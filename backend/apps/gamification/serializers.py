"""
Serializers for gamification app
"""

from rest_framework import serializers
from .models import (
    StudentXP, XPTransaction, Badge, StudentBadge,
    Leaderboard, LeaderboardEntry, Achievement, StudentAchievement
)


class StudentXPSerializer(serializers.ModelSerializer):
    """Serializer for student XP"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    progress_to_next_level = serializers.SerializerMethodField()
    level_progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentXP
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'student',
            'total_xp', 'current_level', 'xp_to_next_level',
            'longest_streak', 'total_badges_earned', 'total_achievements'
        ]
    
    def get_progress_to_next_level(self, obj):
        # Calculate XP earned in current level
        xp_for_current_level = 100 * obj.current_level  # Simple formula
        xp_in_current_level = obj.total_xp - (100 * (obj.current_level - 1) * obj.current_level // 2)
        return xp_in_current_level
    
    def get_level_progress_percentage(self, obj):
        progress = self.get_progress_to_next_level(obj)
        if obj.xp_to_next_level == 0:
            return 100
        return round((progress / obj.xp_to_next_level) * 100, 2)


class XPTransactionSerializer(serializers.ModelSerializer):
    """Serializer for XP transactions"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    awarded_by_name = serializers.CharField(source='awarded_by.get_full_name', read_only=True)
    
    class Meta:
        model = XPTransaction
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'student', 'balance_after']


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for badges"""
    earn_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Badge
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'times_earned']
    
    def get_earn_rate(self, obj):
        """Percentage of students who earned this badge"""
        from apps.accounts.models import User
        total_students = User.objects.filter(role='student', is_active=True).count()
        if total_students == 0:
            return 0
        return round((obj.times_earned / total_students) * 100, 2)


class StudentBadgeSerializer(serializers.ModelSerializer):
    """Serializer for student badges"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    badge_name = serializers.CharField(source='badge.name', read_only=True)
    badge_description = serializers.CharField(source='badge.description', read_only=True)
    badge_icon = serializers.CharField(source='badge.icon', read_only=True)
    badge_color = serializers.CharField(source='badge.color', read_only=True)
    badge_rarity = serializers.CharField(source='badge.rarity', read_only=True)
    
    class Meta:
        model = StudentBadge
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'student', 'earned_at']


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    """Serializer for leaderboard entries"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_level = serializers.SerializerMethodField()
    rank_indicator = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaderboardEntry
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_student_level(self, obj):
        try:
            return obj.student.student_xp.current_level
        except:
            return 1
    
    def get_rank_indicator(self, obj):
        """Return up/down/same indicator"""
        if obj.rank_change > 0:
            return 'up'
        elif obj.rank_change < 0:
            return 'down'
        return 'same'


class LeaderboardSerializer(serializers.ModelSerializer):
    """Serializer for leaderboards"""
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    entries = LeaderboardEntrySerializer(many=True, read_only=True)
    
    class Meta:
        model = Leaderboard
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_updated']


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for achievements"""
    unlock_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_unlock_rate(self, obj):
        from apps.accounts.models import User
        total_students = User.objects.filter(role='student', is_active=True).count()
        if total_students == 0:
            return 0
        unlocked_count = obj.student_achievements.count()
        return round((unlocked_count / total_students) * 100, 2)


class StudentAchievementSerializer(serializers.ModelSerializer):
    """Serializer for student achievements"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    achievement_name = serializers.CharField(source='achievement.name', read_only=True)
    achievement_description = serializers.CharField(source='achievement.description', read_only=True)
    achievement_icon = serializers.CharField(source='achievement.icon', read_only=True)
    
    class Meta:
        model = StudentAchievement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'student', 'unlocked_at']
