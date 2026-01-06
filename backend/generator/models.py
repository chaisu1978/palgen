from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from core.models import User
import os
import shutil
from django.conf import settings

class Palette(models.Model):
    """
    UI Palette based on HSB brand color
    """
    name = models.CharField(max_length=100)
    primary = models.CharField(max_length=7)
    secondary = models.CharField(max_length=7, null=True, blank=True)
    tertiary = models.CharField(max_length=7, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='palettes')
    is_processing = models.BooleanField(default=False)
    error_message = models.TextField(null=True, blank=True)
    storage_path = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Palette'
        verbose_name_plural = 'Palettes'
        ordering = ['-updated_at']


class PaletteFileType(models.Model):
    """
    Palette file type
    """
    name = models.CharField(max_length=25)
    description = models.CharField(max_length=100)
    file_extension = models.CharField(max_length=10, help_text="File extension without the dot, e.g., 'png', 'xlsx'", blank=True, null=True)

    def __str__(self):
        return f"{self.name} (.{self.file_extension})"

    class Meta:
        verbose_name = 'Palette File Type'
        verbose_name_plural = 'Palette File Types'
        ordering = ['name']


class PaletteFile(models.Model):
    """
    Palette file
    """
    palette = models.ForeignKey(Palette, on_delete=models.CASCADE, related_name='files')
    file_type = models.ForeignKey(PaletteFileType, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=512, blank=True)  # Relative to MEDIA_ROOT
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.file_path and self.palette.storage_path:
            self.file_path = os.path.join(
                self.palette.storage_path,
                f"{self.palette.name}-color-palette.{self.file_type.file_extension}"
            )
        super().save(*args, **kwargs)

    @property
    def url(self):
        """Get the URL to access this file"""
        if not self.file_path:
            return None
        return os.path.join(settings.MEDIA_URL, self.file_path.replace('\\', '/'))

    @property
    def full_path(self):
        """Get the full filesystem path to this file"""
        if not self.file_path:
            return None
        return os.path.join(settings.MEDIA_ROOT, self.file_path)

    def __str__(self):
        return f"{self.palette.name} - {self.file_type.name}"

    class Meta:
        verbose_name = 'Palette File'
        verbose_name_plural = 'Palette Files'
        ordering = ['-updated_at']
        unique_together = ['palette', 'file_type']


@receiver(pre_delete, sender=Palette)
def delete_palette_files(sender, instance, **kwargs):
    """
    Signal handler to clean up files when a palette is deleted.
    This ensures files are removed even if the palette is deleted outside the view.
    """
    # Delete associated files from storage
    for file_obj in instance.files.all():
        if file_obj.full_path and os.path.exists(file_obj.full_path):
            try:
                os.remove(file_obj.full_path)
            except OSError as e:
                print(f"Error deleting file {file_obj.full_path}: {e}")

    # Delete the palette directory if it exists
    if instance.storage_path:
        palette_dir = os.path.join(settings.MEDIA_ROOT, instance.storage_path)
        if os.path.exists(palette_dir):
            try:
                shutil.rmtree(palette_dir)
            except OSError as e:
                print(f"Error deleting directory {palette_dir}: {e}")
