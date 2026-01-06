# serializers.py
from rest_framework import serializers
from .models import Palette, PaletteFile, PaletteFileType

class PaletteFileTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaletteFileType
        fields = '__all__'

class PaletteFileSerializer(serializers.ModelSerializer):
    file_type = PaletteFileTypeSerializer(read_only=True)
    download_url = serializers.SerializerMethodField()

    def get_download_url(self, obj: 'PaletteFile') -> str:
        """Generate download URL for a palette file.

        Args:
            obj: The PaletteFile instance

        Returns:
            str: The download URL for the file
        """
        from django.urls import reverse
        return reverse('palette-files-download', kwargs={'pk': obj.pk})

    class Meta:
        model = PaletteFile
        fields = ['id', 'file_type', 'file_name', 'created_at', 'updated_at', 'download_url']

class PaletteSerializer(serializers.ModelSerializer):
    files = PaletteFileSerializer(many=True, read_only=True)
    status = serializers.SerializerMethodField()

    def get_status(self, obj: 'Palette') -> str:
        """Get the processing status of a palette.

        Args:
            obj: The Palette instance

        Returns:
            str: One of 'processing', 'error', or 'completed'
        """
        if obj.is_processing:
            return "processing"
        if obj.error_message:
            return "error"
        return "completed"

    class Meta:
        model = Palette
        fields = ['id', 'name', 'primary', 'secondary', 'tertiary',
                 'created_at', 'updated_at', 'files', 'status', 'error_message']

class PalettePreviewRequestSerializer(serializers.Serializer):
    """Serializer for validating palette preview requests."""
    primary = serializers.CharField(max_length=7, required=True)  # Hex color code
    secondary = serializers.CharField(max_length=7, required=False, allow_blank=True)
    tertiary = serializers.CharField(max_length=7, required=False, allow_blank=True)
    include_tertiary = serializers.BooleanField(default=False)

    def validate_primary(self, value):
        if not value.startswith('#'):
            value = '#' + value
        if len(value) not in [4, 7]:  # #RGB or #RRGGBB
            raise serializers.ValidationError("Invalid hex color format")
        return value

    def validate_secondary(self, value):
        if not value:
            return value
        if not value.startswith('#'):
            value = '#' + value
        if len(value) not in [4, 7]:
            raise serializers.ValidationError("Invalid hex color format")
        return value

    def validate_tertiary(self, value):
        if not value:
            return value
        if not value.startswith('#'):
            value = '#' + value
        if len(value) not in [4, 7]:
            raise serializers.ValidationError("Invalid hex color format")
        return value


class ColorShadeSerializer(serializers.Serializer):
    """Serializer for individual color shades."""
    rgb = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=255),
        min_length=3,
        max_length=3,
        help_text="RGB color values as [R, G, B] where each value is 0-255"
    )
    hex = serializers.CharField(
        help_text="HEX color code (e.g., #ff0000 for red)"
    )
    hsb = serializers.ListField(
        child=serializers.FloatField(min_value=0),
        min_length=3,
        max_length=3,
        help_text="HSB color values as [H, S, B] where H is 0-360, S and B are 0-100"
    )
    cmyk = serializers.ListField(
        child=serializers.FloatField(min_value=0, max_value=100),
        min_length=4,
        max_length=4,
        help_text="CMYK color values as [C, M, Y, K] where each value is 0-100"
    )


class ColorPaletteSerializer(serializers.Serializer):
    """Serializer for a color palette with multiple shades."""
    name = serializers.CharField(help_text="Name of the color palette (e.g., 'Primary', 'Secondary')")
    shades = serializers.DictField(
        child=ColorShadeSerializer(),
        help_text="Dictionary of shades where keys are shade names (e.g., '100', '200') and values are color definitions"
    )


class PalettePreviewResponseSerializer(serializers.Serializer):
    """
    Response schema for palette preview.
    """
    def to_representation(self, instance):
        """Dynamically include all color palettes in the response."""
        representation = {}
        
        # Add all color palettes from the instance
        for color_name, color_data in instance.items():
            representation[color_name.lower()] = {
                'name': color_data['name'],
                'shades': color_data['shades']
            }
            
        return representation
    
    def to_internal_value(self, data):
        """Convert the incoming data to the internal representation."""
        return data
