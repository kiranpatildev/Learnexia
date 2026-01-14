"""
URL Configuration for notes app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NoteTemplateViewSet, LectureNoteViewSet,
    StudentNoteBookmarkViewSet, StudentPersonalNoteViewSet
)

router = DefaultRouter()
router.register(r'templates', NoteTemplateViewSet, basename='note-template')
router.register(r'notes', LectureNoteViewSet, basename='lecture-note')
router.register(r'bookmarks', StudentNoteBookmarkViewSet, basename='note-bookmark')
router.register(r'annotations', StudentPersonalNoteViewSet, basename='note-annotation')

urlpatterns = [
    path('', include(router.urls)),
]
