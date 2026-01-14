"""
Admin configuration for gamification app
"""

from django.contrib import admin
from .models import (
    StudentXP, XPTransaction, Badge, StudentBadge,
    Leaderboard, LeaderboardEntry, Achievement, StudentAchievement
)


@admin.register(StudentXP)
class StudentXPAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'total_xp', 'current_level', 'current_streak',
        'longest_streak', 'total_badges_earned', 'total_achievements'
    ]
    list_filter = ['current_level']
    search_fields = ['student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(XPTransaction)
class XPTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'transaction_type', 'source', 'amount',
        'balance_after', 'created_at', 'awarded_by'
    ]
    list_filter = ['transaction_type', 'source', 'created_at']
    search_fields = ['student__first_name', 'student__last_name', 'description']
    readonly_fields = ['created_at']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'rarity', 'xp_reward',
        'times_earned', 'is_active', 'is_secret'
    ]
    list_filter = ['category', 'rarity', 'is_active', 'is_secret']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'times_earned']


@admin.register(StudentBadge)
class StudentBadgeAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'badge', 'earned_at', 'is_displayed'
    ]
    list_filter = ['badge', 'earned_at', 'is_displayed']
    search_fields = ['student__first_name', 'student__last_name', 'badge__name']
    readonly_fields = ['created_at', 'earned_at']


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'leaderboard_type', 'scope', 'time_period',
        'classroom', 'max_entries', 'is_active', 'last_updated'
    ]
    list_filter = ['leaderboard_type', 'scope', 'time_period', 'is_active']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at', 'last_updated']


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = [
        'leaderboard', 'rank', 'student', 'score',
        'previous_rank', 'rank_change'
    ]
    list_filter = ['leaderboard']
    search_fields = ['student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'requirement_type', 'requirement_value',
        'xp_reward', 'badge_reward', 'is_active'
    ]
    list_filter = ['requirement_type', 'is_active']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StudentAchievement)
class StudentAchievementAdmin(admin.ModelAdmin):
    list_display = ['student', 'achievement', 'unlocked_at']
    list_filter = ['achievement', 'unlocked_at']
    search_fields = ['student__first_name', 'student__last_name', 'achievement__name']
    readonly_fields = ['created_at', 'unlocked_at']
