"""
URL Configuration for behavior app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BehaviorIncidentViewSet, 
    BehaviorNoteViewSet, 
    BehaviorStatisticsViewSet,
    PendingBehaviorDetectionViewSet
)

router = DefaultRouter()
router.register(r'incidents', BehaviorIncidentViewSet, basename='behavior-incident')
router.register(r'notes', BehaviorNoteViewSet, basename='behavior-note')
router.register(r'statistics', BehaviorStatisticsViewSet, basename='behavior-stats')
router.register(r'pending-detections', PendingBehaviorDetectionViewSet, basename='pending-detection')

urlpatterns = [
    path('', include(router.urls)),
]
