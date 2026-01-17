"""
URL Configuration for gamification app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentXPViewSet, XPTransactionViewSet, BadgeViewSet, StudentBadgeViewSet,
    LeaderboardViewSet, AchievementViewSet, StudentAchievementViewSet
)

router = DefaultRouter()
router.register(r'xp', StudentXPViewSet, basename='student-xp')
router.register(r'transactions', XPTransactionViewSet, basename='xp-transaction')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'student-badges', StudentBadgeViewSet, basename='student-badge')
router.register(r'leaderboards', LeaderboardViewSet, basename='leaderboard')
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'student-achievements', StudentAchievementViewSet, basename='student-achievement')

urlpatterns = [
    path('', include(router.urls)),
]
