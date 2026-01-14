"""
URL Configuration for performance app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentGradeViewSet, SubjectPerformanceViewSet, ProgressReportViewSet, PerformanceMetricViewSet

router = DefaultRouter()
router.register(r'grades', StudentGradeViewSet, basename='student-grade')
router.register(r'subjects', SubjectPerformanceViewSet, basename='subject-performance')
router.register(r'reports', ProgressReportViewSet, basename='progress-report')
router.register(r'metrics', PerformanceMetricViewSet, basename='performance-metric')

urlpatterns = [
    path('', include(router.urls)),
]
