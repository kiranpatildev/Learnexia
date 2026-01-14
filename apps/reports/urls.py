"""
URL Configuration for reports app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportTemplateViewSet, ReportViewSet, ReportScheduleViewSet, DataExportViewSet

router = DefaultRouter()
router.register(r'templates', ReportTemplateViewSet, basename='report-template')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'schedules', ReportScheduleViewSet, basename='report-schedule')
router.register(r'exports', DataExportViewSet, basename='data-export')

urlpatterns = [
    path('', include(router.urls)),
]
