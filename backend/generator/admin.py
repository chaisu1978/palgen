from django.contrib import admin
from generator import models

admin.site.register(models.Palette)
admin.site.register(models.PaletteFile)
admin.site.register(models.PaletteFileType)
