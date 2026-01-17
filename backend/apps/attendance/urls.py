"""
URL Configuration for attendance app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceSessionViewSet, AttendanceRecordViewSet, AttendanceStatisticsViewSet

router = DefaultRouter()
router.register(r'sessions', AttendanceSessionViewSet, basename='attendance-session')
router.register(r'records', AttendanceRecordViewSet, basename='attendance-record')
router.register(r'statistics', AttendanceStatisticsViewSet, basename='attendance-stats')

urlpatterns = [
    path('', include(router.urls)),
]
