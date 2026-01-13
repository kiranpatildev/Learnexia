"""
URL Configuration for schools app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SchoolViewSet, AcademicYearViewSet, SubjectViewSet,
    ClassroomViewSet, ClassroomEnrollmentViewSet
)

router = DefaultRouter()
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'academic-years', AcademicYearViewSet, basename='academic-year')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'classrooms', ClassroomViewSet, basename='classroom')
router.register(r'enrollments', ClassroomEnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
]
