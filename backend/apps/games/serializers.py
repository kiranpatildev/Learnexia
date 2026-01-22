"""
Serializers for games app
"""

from typing import Dict, Any
from rest_framework import serializers
from django.utils import timezone
from .models import GameTemplate, LectureGame, GameAttempt, GameLeaderboard
from apps.accounts.models import User
from apps.lectures.models import Lecture


class GameTemplateSerializer(serializers.ModelSerializer):
    """Serializer for GameTemplate model"""
    
    class Meta:
        model = GameTemplate
        fields = [
            'id',
            'code',
            'name',
            'description',
            'icon',
            'game_type',
            'is_active',
            'min_questions',
            'max_questions',
            'default_time_per_question',
            'supports_difficulty',
        ]
        read_only_fields = ['id']


class GameGenerationRequestSerializer(serializers.Serializer):
    """
    Serializer for game generation request
    """
    
    lecture_id = serializers.UUIDField(
        help_text='ID of the lecture to generate game from'
    )
    game_type = serializers.CharField(
        default='fall_drop',
        help_text='Game type code (e.g., "fall_drop")'
    )
    difficulty = serializers.ChoiceField(
        choices=['EASY', 'MEDIUM', 'HARD'],
        default='MEDIUM',
        help_text='Difficulty level'
    )
    question_count = serializers.IntegerField(
        default=10,
        min_value=5,
        max_value=20,
        help_text='Number of questions to generate'
    )
    force_regenerate = serializers.BooleanField(
        default=False,
        help_text='Force regeneration even if game exists'
    )
    auto_publish = serializers.BooleanField(
        default=False,
        help_text='Automatically publish after generation'
    )
    
    def validate_lecture_id(self, value):
        """Validate lecture exists"""
        if not Lecture.objects.filter(id=value).exists():
            raise serializers.ValidationError('Lecture not found')
        return value
    
    def validate_game_type(self, value: str) -> str:
        """Validate game type exists and is active"""
        if not GameTemplate.objects.filter(code=value, is_active=True).exists():
            raise serializers.ValidationError(
                f'Game type "{value}" not found or inactive'
            )
        return value


class StudentStatsSerializer(serializers.Serializer):
    """Student-specific stats for a game"""
    
    played = serializers.BooleanField()
    best_score = serializers.IntegerField()
    best_rank = serializers.IntegerField(allow_null=True)
    total_attempts = serializers.IntegerField()
    last_played = serializers.DateTimeField(allow_null=True)


class GameAnalyticsSerializer(serializers.Serializer):
    """Game analytics data"""
    
    total_plays = serializers.IntegerField()
    total_completions = serializers.IntegerField()
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    highest_score = serializers.IntegerField()
    completion_rate = serializers.FloatField()


class LectureGameListSerializer(serializers.ModelSerializer):
    """Serializer for listing games"""
    
    template = GameTemplateSerializer(read_only=True)
    lecture_title = serializers.CharField(source='lecture.title', read_only=True)
    classroom_name = serializers.SerializerMethodField()
    student_stats = serializers.SerializerMethodField()
    analytics = serializers.SerializerMethodField()
    
    class Meta:
        model = LectureGame
        fields = [
            'id',
            'title',
            'lecture_title',
            'classroom_name',
            'template',
            'difficulty',
            'question_count',
            'estimated_duration',
            'is_published',
            'published_at',
            'student_stats',
            'analytics',
            'created_at',
        ]
    
    def get_classroom_name(self, obj: LectureGame) -> str:
        """Get classroom name"""
        if obj.classroom:
            return str(obj.classroom)
        return obj.lecture.classroom.name if hasattr(obj.lecture, 'classroom') else ''
    
    def get_student_stats(self, obj: LectureGame) -> Dict[str, Any]:
        """Get student-specific stats"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        if request.user.role != 'student':
            return None
        
        attempts = GameAttempt.objects.filter(
            lecture_game=obj,
            student=request.user,
            is_completed=True
        ).order_by('-final_score')
        
        if not attempts.exists():
            return {
                'played': False,
                'best_score': 0,
                'best_rank': None,
                'total_attempts': 0,
                'last_played': None
            }
        
        best_attempt = attempts.first()
        
        return {
            'played': True,
            'best_score': best_attempt.final_score,
            'best_rank': best_attempt.rank_achieved,
            'total_attempts': attempts.count(),
            'last_played': best_attempt.completed_at
        }
    
    def get_analytics(self, obj: LectureGame) -> Dict[str, Any]:
        """Get game analytics"""
        return {
            'total_plays': obj.total_plays,
            'total_completions': obj.total_completions,
            'average_score': float(obj.average_score),
            'highest_score': obj.highest_score,
            'completion_rate': obj.completion_rate
        }


class LectureGameDetailSerializer(serializers.ModelSerializer):
    """Serializer for game detail (without questions)"""
    
    template = GameTemplateSerializer(read_only=True)
    lecture = serializers.SerializerMethodField()
    game_config = serializers.SerializerMethodField()
    personal_best = serializers.SerializerMethodField()
    leaderboard_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = LectureGame
        fields = [
            'id',
            'title',
            'lecture',
            'template',
            'difficulty',
            'question_count',
            'estimated_duration',
            'game_config',
            'personal_best',
            'leaderboard_preview',
            'is_published',
            'published_at',
            'created_at',
        ]
    
    def get_lecture(self, obj: LectureGame) -> Dict[str, Any]:
        """Get lecture info"""
        return {
            'id': obj.lecture.id,
            'title': obj.lecture.title,
            'transcript_preview': obj.lecture.transcript[:200] if obj.lecture.transcript else ''
        }
    
    def get_game_config(self, obj: LectureGame) -> Dict[str, Any]:
        """Get game configuration (without questions)"""
        game_data = obj.game_data or {}
        config = game_data.get('game_config', {})
        
        # Default config for Fall Drop
        return {
            'lives': config.get('lives', 3),
            'base_speed': config.get('base_speed', 1.5),
            'time_limit_per_question': config.get('time_limit_per_question', 10),
            'points_per_correct': config.get('points_per_correct', 100),
            'combo_multiplier': config.get('combo_multiplier', 1.5),
        }
    
    def get_personal_best(self, obj: LectureGame) -> Dict[str, Any]:
        """Get user's personal best"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        if request.user.role != 'student':
            return None
        
        best_attempt = GameAttempt.objects.filter(
            lecture_game=obj,
            student=request.user,
            is_completed=True
        ).order_by('-final_score').first()
        
        if not best_attempt:
            return None
        
        return {
            'score': best_attempt.final_score,
            'rank': best_attempt.rank_achieved,
            'accuracy': float(best_attempt.accuracy_percentage),
            'completed_at': best_attempt.completed_at
        }
    
    def get_leaderboard_preview(self, obj: LectureGame) -> list:
        """Get top 5 leaderboard entries"""
        entries = GameLeaderboard.objects.filter(
            lecture_game=obj
        ).select_related('student').order_by('rank')[:5]
        
        return [
            {
                'rank': entry.rank,
                'student': {
                    'id': entry.student.id,
                    'name': entry.student.get_full_name(),
                },
                'score': entry.best_score,
                'completed_at': entry.last_played
            }
            for entry in entries
        ]


class GameStartResponseSerializer(serializers.Serializer):
    """Response when starting a game"""
    
    attempt_id = serializers.IntegerField()
    game = serializers.DictField()
    questions = serializers.ListField()
    started_at = serializers.DateTimeField()
    expires_at = serializers.DateTimeField()


class AnswerSubmissionSerializer(serializers.Serializer):
    """Serializer for submitting an answer"""
    
    question_id = serializers.CharField()
    selected_index = serializers.IntegerField(min_value=0, max_value=3)
    time_taken = serializers.FloatField(min_value=0)
    
    def validate_selected_index(self, value: int) -> int:
        """Validate answer index is valid"""
        if value not in [0, 1, 2, 3]:
            raise serializers.ValidationError('Answer index must be 0-3')
        return value


class AnswerValidationResponseSerializer(serializers.Serializer):
    """Response after answer validation"""
    
    is_correct = serializers.BooleanField()
    explanation = serializers.CharField()
    points_earned = serializers.IntegerField()
    game_over = serializers.BooleanField()
    current_score = serializers.IntegerField()
    lives_remaining = serializers.IntegerField()


class GameAttemptSerializer(serializers.ModelSerializer):
    """Serializer for GameAttempt"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    game_title = serializers.CharField(source='lecture_game.title', read_only=True)
    
    class Meta:
        model = GameAttempt
        fields = [
            'id',
            'student_name',
            'game_title',
            'started_at',
            'completed_at',
            'is_completed',
            'final_score',
            'max_possible_score',
            'accuracy_percentage',
            'time_taken',
            'correct_answers',
            'wrong_answers',
            'max_combo_achieved',
            'lives_remaining',
            'xp_earned',
            'rank_achieved',
        ]
        read_only_fields = fields


class GameResultsSerializer(serializers.Serializer):
    """Detailed game results"""
    
    attempt_id = serializers.IntegerField()
    final_score = serializers.IntegerField()
    max_possible_score = serializers.IntegerField()
    accuracy = serializers.DecimalField(max_digits=5, decimal_places=2)
    correct_answers = serializers.IntegerField()
    wrong_answers = serializers.IntegerField()
    time_taken = serializers.IntegerField()
    max_combo = serializers.IntegerField()
    xp_earned = serializers.IntegerField()
    badges_earned = serializers.ListField()
    rank = serializers.IntegerField(allow_null=True)
    rank_change = serializers.IntegerField(allow_null=True)
    percentile = serializers.FloatField(allow_null=True)
    question_feedback = serializers.ListField()
    insights = serializers.DictField()
    completed_at = serializers.DateTimeField()


class GameLeaderboardSerializer(serializers.ModelSerializer):
    """Serializer for leaderboard entries"""
    
    student = serializers.SerializerMethodField()
    
    class Meta:
        model = GameLeaderboard
        fields = [
            'rank',
            'student',
            'best_score',
            'total_plays',
            'last_played',
        ]
    
    def get_student(self, obj: GameLeaderboard) -> Dict[str, Any]:
        """Get student info"""
        request = self.context.get('request')
        is_current_user = (
            request and 
            request.user.is_authenticated and 
            request.user.id == obj.student.id
        )
        
        return {
            'id': obj.student.id,
            'name': obj.student.get_full_name(),
            'is_current_user': is_current_user
        }
