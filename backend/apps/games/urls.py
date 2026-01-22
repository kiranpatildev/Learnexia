"""
URL configuration for games app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GameTemplateViewSet, LectureGameViewSet, GameAttemptViewSet

app_name = 'games'

router = DefaultRouter()
router.register(r'templates', GameTemplateViewSet, basename='gametemplate')
router.register(r'games', LectureGameViewSet, basename='lecturegame')
router.register(r'attempts', GameAttemptViewSet, basename='gameattempt')

urlpatterns = [
    path('', include(router.urls)),
]
