"""
URL Configuration for lectures app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# Add viewsets here when created

urlpatterns = [
    path('', include(router.urls)),
]
