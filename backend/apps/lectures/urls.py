"""
URL Configuration for lectures app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LectureViewSet, LectureBookmarkViewSet,
    LectureViewViewSet, LectureResourceViewSet
)

router = DefaultRouter()
router.register(r'lectures', LectureViewSet, basename='lecture')
router.register(r'bookmarks', LectureBookmarkViewSet, basename='lecture-bookmark')
router.register(r'views', LectureViewViewSet, basename='lecture-view')
router.register(r'resources', LectureResourceViewSet, basename='lecture-resource')

urlpatterns = [
    path('', include(router.urls)),
]
