"""
Admin configuration for games app
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import GameTemplate, LectureGame, GameAttempt, GameLeaderboard


@admin.register(GameTemplate)
class GameTemplateAdmin(admin.ModelAdmin):
    """Admin interface for GameTemplate"""
    list_display = [
        'name',
        'code',
        'game_type',
        'is_active',
        'min_questions',
        'max_questions',
        'created_at'
    ]
    list_filter = ['game_type', 'is_active', 'supports_difficulty']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'description', 'icon', 'game_type')
        }),
        ('Configuration', {
            'fields': (
                'is_active',
                'min_questions',
                'max_questions',
                'default_time_per_question',
                'supports_difficulty'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LectureGame)
class LectureGameAdmin(admin.ModelAdmin):
    """Admin interface for LectureGame"""
    list_display = [
        'title',
        'lecture',
        'template',
        'difficulty',
        'question_count',
        'is_published_badge',
        'total_plays',
        'average_score',
        'created_at'
    ]
    list_filter = [
        'template',
        'difficulty',
        'is_published',
        'is_deleted',
        'created_at'
    ]
    search_fields = ['title', 'lecture__title']
    readonly_fields = [
        'generated_at',
        'created_at',
        'updated_at',
        'total_plays',
        'total_completions',
        'average_score',
        'completion_rate_display'
    ]
    raw_id_fields = ['lecture', 'generated_by', 'published_by', 'highest_scorer', 'classroom']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('lecture', 'classroom', 'template', 'title', 'difficulty', 'question_count')
        }),
        ('Game Data', {
            'fields': ('game_data', 'estimated_duration'),
            'classes': ('collapse',)
        }),
        ('AI Generation', {
            'fields': (
                'generated_by',
                'generated_at',
                'ai_model_used',
                'ai_generation_cost',
                'prompt_tokens',
                'completion_tokens'
            ),
            'classes': ('collapse',)
        }),
        ('Publishing', {
            'fields': ('is_published', 'published_at', 'published_by')
        }),
        ('Analytics', {
            'fields': (
                'total_plays',
                'total_completions',
                'completion_rate_display',
                'average_score',
                'average_completion_time',
                'highest_score',
                'highest_scorer'
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'deleted_at', 'is_deleted'),
            'classes': ('collapse',)
        }),
    )
    
    def is_published_badge(self, obj):
        """Display published status as badge"""
        if obj.is_published:
            return format_html(
                '<span style="color: green;">✓ Published</span>'
            )
        return format_html(
            '<span style="color: gray;">○ Draft</span>'
        )
    is_published_badge.short_description = 'Status'
    
    def completion_rate_display(self, obj):
        """Display completion rate"""
        return f"{obj.completion_rate}%"
    completion_rate_display.short_description = 'Completion Rate'


@admin.register(GameAttempt)
class GameAttemptAdmin(admin.ModelAdmin):
    """Admin interface for GameAttempt"""
    list_display = [
        'student',
        'lecture_game',
        'final_score',
        'accuracy_percentage',
        'is_completed',
        'xp_earned',
        'completed_at'
    ]
    list_filter = [
        'is_completed',
        'lecture_game__template',
        'lecture_game__difficulty',
        'completed_at'
    ]
    search_fields = [
        'student__first_name',
        'student__last_name',
        'student__email',
        'lecture_game__title'
    ]
    readonly_fields = [
        'started_at',
        'completed_at',
        'created_at',
        'updated_at',
        'is_perfect_score_display'
    ]
    raw_id_fields = ['student', 'lecture_game']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('student', 'lecture_game', 'is_completed')
        }),
        ('Scores', {
            'fields': (
                'final_score',
                'max_possible_score',
                'accuracy_percentage',
                'is_perfect_score_display',
                'time_taken'
            )
        }),
        ('Performance', {
            'fields': (
                'questions_answered',
                'correct_answers',
                'wrong_answers',
                'max_combo_achieved',
                'lives_remaining'
            )
        }),
        ('Detailed Data', {
            'fields': ('detailed_results', 'performance_metrics'),
            'classes': ('collapse',)
        }),
        ('Gamification', {
            'fields': ('xp_earned', 'rank_achieved')
        }),
        ('Timestamps', {
            'fields': ('started_at', 'completed_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_perfect_score_display(self, obj):
        """Display perfect score badge"""
        if obj.is_perfect_score:
            return format_html(
                '<span style="color: gold;">★ Perfect Score!</span>'
            )
        return format_html(
            '<span style="color: gray;">-</span>'
        )
    is_perfect_score_display.short_description = 'Perfect Score'


@admin.register(GameLeaderboard)
class GameLeaderboardAdmin(admin.ModelAdmin):
    """Admin interface for GameLeaderboard"""
    list_display = [
        'rank',
        'student',
        'lecture_game',
        'best_score',
        'total_plays',
        'last_played'
    ]
    list_filter = ['lecture_game__template', 'last_played']
    search_fields = [
        'student__first_name',
        'student__last_name',
        'lecture_game__title'
    ]
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['lecture_game', 'student', 'best_attempt']
    
    fieldsets = (
        ('Leaderboard Entry', {
            'fields': ('lecture_game', 'student', 'rank')
        }),
        ('Performance', {
            'fields': ('best_score', 'best_attempt', 'total_plays', 'last_played')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
