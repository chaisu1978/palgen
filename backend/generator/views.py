"""
Endpoints for generating color palettes and managing palette files
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser
from django.shortcuts import get_object_or_404
from .models import Palette, PaletteFile, PaletteFileType
from .serializers import PaletteSerializer, PaletteFileSerializer, PalettePreviewRequestSerializer, PalettePreviewResponseSerializer
from .generator import PaletteGenerator, generate_palette
from django.conf import settings
import os
import json
from django.core.files import File
import tempfile
from django.core.files.base import ContentFile
import shutil
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.authentication import CustomJWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
import colorsys
from contextlib import contextmanager


@contextmanager
def temporary_palette_directory():
    """
    Context manager for creating and cleaning up temporary palette directories.
    Ensures cleanup even if errors occur during generation.
    """
    # Create temp dir in system temp, not in app directory to avoid Django autoreloader issues
    temp_dir = tempfile.mkdtemp(prefix='palette_', dir=tempfile.gettempdir())
    try:
        yield temp_dir
    finally:
        # Clean up the temporary directory with retry logic
        if os.path.exists(temp_dir):
            try:
                # Force remove even if files are in use
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception as e:
                # Log but don't raise - cleanup failure shouldn't break the response
                print(f"Warning: Could not clean up temporary directory {temp_dir}: {e}")


class PaletteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for generating color palettes
    """
    queryset = Palette.objects.all()
    serializer_class = PaletteSerializer
    parser_classes = [JSONParser, MultiPartParser]
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Only return palettes belonging to the current user."""
        return self.queryset.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        """Set the user to the current user when creating a palette."""
        serializer.save(user=self.request.user)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create palette in processing state with the current user
        palette = serializer.save(user=self.request.user, is_processing=True)

        # Start async task to generate files
        self._generate_palette_files(palette)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Delete associated files from storage
        for file_obj in instance.files.all():
            if file_obj.full_path and os.path.exists(file_obj.full_path):
                try:
                    os.remove(file_obj.full_path)
                except OSError as e:
                    # Log the error but continue with deletion
                    print(f"Error deleting file {file_obj.full_path}: {e}")

        # Delete the palette directory if it exists
        if instance.storage_path:
            palette_dir = os.path.join(settings.MEDIA_ROOT, instance.storage_path)
            if os.path.exists(palette_dir):
                try:
                    shutil.rmtree(palette_dir)
                except OSError as e:
                    print(f"Error deleting directory {palette_dir}: {e}")

        # Let DRF handle the actual model deletion
        return super().destroy(request, *args, **kwargs)

    def _generate_palette_files(self, palette):
        try:
            from django.utils.text import slugify

            # Generate a slug from the palette name
            name_slug = slugify(palette.name)
            if not name_slug:  # In case name is empty or only special characters
                name_slug = 'palette'

            # Create palette directory with ID and slugged name
            palette_dir = os.path.join('palettes', f'{palette.id}-{name_slug}')
            full_palette_dir = os.path.join(settings.MEDIA_ROOT, palette_dir)
            os.makedirs(full_palette_dir, exist_ok=True)

            # Generate files
            generator = PaletteGenerator(
                name=palette.name,
                primary=palette.primary,
                secondary=palette.secondary,
                tertiary=palette.tertiary,
                base_dir=full_palette_dir  # Pass the full path to the generator
            )

            # Save files to database
            file_types = PaletteFileType.objects.all()
            for file_type in file_types:
                file_name = f"{palette.name}-color-palette.{file_type.file_extension}"
                file_path = os.path.join(palette_dir, file_name)

                # Save file to database
                PaletteFile.objects.create(
                    palette=palette,
                    file_type=file_type,
                    file_name=file_name,
                    file_path=file_path  # Store relative path
                )

            # Update palette status
            palette.is_processing = False
            palette.storage_path = palette_dir  # Store relative path
            palette.save()

        except Exception as e:
            palette.error_message = str(e)
            palette.is_processing = False
            palette.save()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download all files for a palette as a zip archive
        """
        import zipfile
        import io
        from django.http import FileResponse
        from django.core.files.storage import default_storage

        palette = self.get_object()

        # Create a zip file in memory
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add each file to the zip
            for file_obj in palette.files.all():
                file_path = file_obj.file_path
                if default_storage.exists(file_path):
                    with default_storage.open(file_path, 'rb') as file_content:
                        zip_file.writestr(file_obj.file_name, file_content.read())

        # Prepare the response
        buffer.seek(0)
        response = FileResponse(buffer, as_attachment=True,
                              content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{palette.name}-palette-files.zip"'
        return response


class PalettePreviewView(GenericAPIView):
    """
    API endpoint for previewing color palettes without saving them.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [AllowAny]
    serializer_class = PalettePreviewRequestSerializer
    http_method_names = ['post']  # Explicitly allow only POST method

    def post(self, request, *args, **kwargs):
        """
        Generate a preview of a color palette without saving it.
        """
        # Manually validate the request data
        request_serializer = self.serializer_class(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        try:
            # Extract and validate colors
            primary = request_serializer.validated_data['primary']
            secondary = request_serializer.validated_data.get('secondary')
            include_tertiary = request_serializer.validated_data.get('include_tertiary', False)
            tertiary = request_serializer.validated_data.get('tertiary') if include_tertiary else None

            # Generate the palette
            palette = generate_palette(primary, secondary, tertiary)

            # Format the response
            response_data = {}

            # Include all colors from the palette (Primary, Secondary, Tertiary, Neutral, and supporting colors)
            for color_name, shades in palette.items():
                shade_data = {}
                for shade, hsb in shades.items():
                    # Ensure HSB values are in correct ranges
                    h, s, b = hsb
                    h = max(0, min(360, h))  # Hue: 0-360
                    s = max(0, min(100, s))  # Saturation: 0-100
                    b = max(0, min(100, b))  # Brightness: 0-100

                    # Convert HSB to RGB
                    rgb = colorsys.hsv_to_rgb(h/360, s/100, b/100)
                    rgb_ints = [int(round(x * 255)) for x in rgb]
                    rgb_ints = [max(0, min(255, c)) for c in rgb_ints]  # Ensure 0-255 range

                    # Convert RGB to hex
                    hex_color = '#{:02x}{:02x}{:02x}'.format(*rgb_ints)
                    
                    # Convert RGB to CMYK
                    from .generator import rgb_to_cmyk
                    cmyk = rgb_to_cmyk(rgb_ints)

                    shade_data[str(shade)] = {
                        'rgb': rgb_ints,
                        'hex': hex_color.lower(),
                        'hsb': [h, s, b],  # Original HSB values
                        'cmyk': cmyk       # Calculated CMYK values
                    }

                if shade_data:  # Only add if we have valid shades
                    response_data[color_name.lower()] = {
                        'name': color_name,
                        'shades': shade_data
                    }

            # Validate the response data with the response serializer
            response_serializer = PalettePreviewResponseSerializer(data=response_data)
            response_serializer.is_valid(raise_exception=True)
            return Response(response_serializer.validated_data)

        except Exception as e:
            return Response(
                {
                    "error": f"Error generating palette: {str(e)}",
                    "type": type(e).__name__
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class PaletteFileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing palette files
    """
    queryset = PaletteFile.objects.all()
    serializer_class = PaletteFileSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only return files belonging to palettes owned by the current user."""
        return self.queryset.filter(palette__user=self.request.user)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download a single palette file
        """
        from django.http import FileResponse
        from django.core.files.storage import default_storage
        from rest_framework.exceptions import NotFound

        file_obj = self.get_object()
        file_path = file_obj.file_path

        if not default_storage.exists(file_path):
            raise NotFound("File not found")

        file = default_storage.open(file_path, 'rb')
        response = FileResponse(file, as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{file_obj.file_name}"'
        response['Content-Length'] = default_storage.size(file_path)

        # Set appropriate content type based on file extension
        if file_path.endswith('.png'):
            response['Content-Type'] = 'image/png'
        elif file_path.endswith('.xlsx'):
            response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        elif file_path.endswith('.css'):
            response['Content-Type'] = 'text/css'
        elif file_path.endswith('.ts'):
            response['Content-Type'] = 'application/typescript'
        elif file_path.endswith('.dart'):
            response['Content-Type'] = 'application/dart'

        return response


class AnonymousPaletteDownloadView(GenericAPIView):
    """
    API endpoint for anonymous users to download palette files without saving to database.
    Generates files in a temporary directory and returns them as a zip file.
    """
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [AllowAny]
    serializer_class = PalettePreviewRequestSerializer
    http_method_names = ['post']

    def post(self, request, *args, **kwargs):
        """
        Generate palette files and return them as a zip download.
        """
        import zipfile
        import io
        from django.http import FileResponse
        from django.utils.text import slugify

        # Validate request data
        request_serializer = self.serializer_class(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        # Extract palette data
        palette_name = request.data.get('name', 'palette')
        if not palette_name or not palette_name.strip():
            return Response(
                {"error": "Palette name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        primary = request_serializer.validated_data['primary']
        secondary = request_serializer.validated_data.get('secondary')
        include_tertiary = request_serializer.validated_data.get('include_tertiary', False)
        tertiary = request_serializer.validated_data.get('tertiary') if include_tertiary else None
        
        # Validate colors are not empty
        if not primary or not secondary:
            return Response(
                {"error": "Primary and secondary colors are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Use context manager to ensure cleanup
            with temporary_palette_directory() as temp_dir:
                # Generate palette files in temporary directory
                generator = PaletteGenerator(
                    name=palette_name,
                    primary=primary,
                    secondary=secondary,
                    tertiary=tertiary,
                    base_dir=temp_dir
                )

                # Create zip file in memory
                buffer = io.BytesIO()
                with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                    # Add each generated file to the zip
                    for file_info in generator.get_generated_files():
                        file_path = os.path.join(temp_dir, file_info['name'])
                        if os.path.exists(file_path):
                            with open(file_path, 'rb') as f:
                                zip_file.writestr(file_info['name'], f.read())

                # Prepare response
                buffer.seek(0)
                response = FileResponse(
                    buffer,
                    as_attachment=True,
                    content_type='application/zip'
                )
                
                # Create safe filename
                safe_name = slugify(palette_name) or 'palette'
                response['Content-Disposition'] = f'attachment; filename="{safe_name}-palette-files.zip"'
                
                return response

        except Exception as e:
            return Response(
                {
                    "error": f"Error generating palette files: {str(e)}",
                    "type": type(e).__name__
                },
                status=status.HTTP_400_BAD_REQUEST
            )
