"""
URL Configuration for behavior app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BehaviorIncidentViewSet, BehaviorNoteViewSet, BehaviorStatisticsViewSet

router = DefaultRouter()
router.register(r'incidents', BehaviorIncidentViewSet, basename='behavior-incident')
router.register(r'notes', BehaviorNoteViewSet, basename='behavior-note')
router.register(r'statistics', BehaviorStatisticsViewSet, basename='behavior-stats')

urlpatterns = [
    path('', include(router.urls)),
]
