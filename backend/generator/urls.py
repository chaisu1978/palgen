# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'palettes', views.PaletteViewSet, basename='palette')
router.register(r'palette-files', views.PaletteFileViewSet, basename='palette-files')

urlpatterns = [
    # Register the preview endpoint before the router's URLs
    path('palettes/preview/', views.PalettePreviewView.as_view(), name='palette-preview'),
    # Register the anonymous download endpoint
    path('palettes/download-anonymous/', views.AnonymousPaletteDownloadView.as_view(), name='palette-download-anonymous'),
    # Include the router's URLs
    path('', include(router.urls)),
]
