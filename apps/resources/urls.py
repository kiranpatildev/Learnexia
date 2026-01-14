"""
URL Configuration for resources app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceViewSet, ResourceCategoryViewSet, ResourceDownloadViewSet

router = DefaultRouter()
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'categories', ResourceCategoryViewSet, basename='resource-category')
router.register(r'downloads', ResourceDownloadViewSet, basename='resource-download')

urlpatterns = [
    path('', include(router.urls)),
]
