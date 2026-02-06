"""
URL configuration for assignments app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, AssignmentSubmissionViewSet, AssignmentGradeViewSet

router = DefaultRouter()
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'submissions', AssignmentSubmissionViewSet, basename='submission')
router.register(r'grades', AssignmentGradeViewSet, basename='grade')

urlpatterns = [
    path('', include(router.urls)),
]
