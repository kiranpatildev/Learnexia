"""
URL configuration for flashcards app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FlashcardSetViewSet, FlashcardViewSet

router = DefaultRouter()
router.register(r'flashcard-sets', FlashcardSetViewSet, basename='flashcard-set')
router.register(r'flashcards', FlashcardViewSet, basename='flashcard')

urlpatterns = [
    path('', include(router.urls)),
]
