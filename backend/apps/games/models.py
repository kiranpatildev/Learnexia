"""
Models for games app
"""

from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.lectures.models import Lecture
from apps.schools.models import Classroom


class GameTemplate(TimeStampedModel):
    """
    Static game type definitions (Fall Drop, Word Scramble, etc.)
    Created by developers, not users
    """
    
    GAME_TYPE_CHOICES = [
        ('REACTION', 'Reaction Game'),
        ('PUZZLE', 'Puzzle Game'),
        ('MEMORY', 'Memory Game'),
        ('QUIZ', 'Quiz Game'),
    ]
    
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text='Emoji or icon class')
    game_type = models.CharField(max_length=20, choices=GAME_TYPE_CHOICES)
    
    is_active = models.BooleanField(default=True, db_index=True)
    min_questions = models.PositiveIntegerField(default=5)
    max_questions = models.PositiveIntegerField(default=20)
    default_time_per_question = models.PositiveIntegerField(
        default=8,
        help_text='Default time limit in seconds'
    )
    supports_difficulty = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Game Template'
        verbose_name_plural = 'Game Templates'
        ordering = ['name']
    
    def __str__(self) -> str:
        return f"{self.name} ({self.code})"


class LectureGame(TimeStampedModel, SoftDeleteModel):
    """
    AI-generated game instances for specific lectures
    One lecture can have multiple games (different types/difficulties)
    """
    
    DIFFICULTY_CHOICES = [
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    ]
    
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='games'
    )
    template = models.ForeignKey(
        GameTemplate,
        on_delete=models.PROTECT,
        related_name='instances'
    )
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='games',
        null=True,
        blank=True
    )
    
    title = models.CharField(max_length=200)
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default='MEDIUM',
        db_index=True
    )
    question_count = models.PositiveIntegerField()
    
    # Game content stored as JSON
    game_data = models.JSONField(
        help_text='Stores all game content (questions, config, etc.)'
    )
    
    estimated_duration = models.PositiveIntegerField(
        default=5,
        help_text='Estimated duration in minutes'
    )
    
    # AI Generation Metadata
    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='generated_games'
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    ai_model_used = models.CharField(
        max_length=50,
        default='gemini-1.5-flash'
    )
    ai_generation_cost = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        default=Decimal('0.0000')
    )
    prompt_tokens = models.PositiveIntegerField(default=0)
    completion_tokens = models.PositiveIntegerField(default=0)
    
    # Publishing
    is_published = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    published_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='published_games'
    )
    
    # Analytics
    total_plays = models.PositiveIntegerField(default=0)
    total_completions = models.PositiveIntegerField(default=0)
    average_score = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )
    average_completion_time = models.PositiveIntegerField(
        default=0,
        help_text='Average completion time in seconds'
    )
    highest_score = models.PositiveIntegerField(default=0)
    highest_scorer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='high_scores'
    )
    
    class Meta:
        verbose_name = 'Lecture Game'
        verbose_name_plural = 'Lecture Games'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['lecture', 'template']),
            models.Index(fields=['is_published', '-created_at']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['classroom', '-created_at']),
        ]
        unique_together = [['lecture', 'template', 'difficulty']]
    
    def __str__(self) -> str:
        return f"{self.title} ({self.difficulty})"
    
    @property
    def completion_rate(self) -> float:
        """Calculate completion rate percentage"""
        if self.total_plays == 0:
            return 0.0
        return round((self.total_completions / self.total_plays) * 100, 2)


class GameAttempt(TimeStampedModel):
    """
    Student game play records with detailed performance metrics
    """
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='game_attempts'
    )
    lecture_game = models.ForeignKey(
        LectureGame,
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False, db_index=True)
    
    # Scores
    final_score = models.PositiveIntegerField(default=0)
    max_possible_score = models.PositiveIntegerField(default=0)
    accuracy_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    time_taken = models.PositiveIntegerField(
        default=0,
        help_text='Time taken in seconds'
    )
    
    # Performance
    questions_answered = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    wrong_answers = models.PositiveIntegerField(default=0)
    max_combo_achieved = models.PositiveIntegerField(default=0)
    lives_remaining = models.PositiveIntegerField(default=0)
    
    # Detailed results stored as JSON
    detailed_results = models.JSONField(
        default=dict,
        help_text='Question-by-question breakdown'
    )
    performance_metrics = models.JSONField(
        default=dict,
        help_text='Advanced performance metrics'
    )
    
    # Gamification Integration
    xp_earned = models.PositiveIntegerField(default=0)
    rank_achieved = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Position in leaderboard'
    )
    
    class Meta:
        verbose_name = 'Game Attempt'
        verbose_name_plural = 'Game Attempts'
        ordering = ['-completed_at', '-started_at']
        indexes = [
            models.Index(fields=['student', 'lecture_game']),
            models.Index(fields=['is_completed', '-completed_at']),
            models.Index(fields=['lecture_game', '-final_score']),
        ]
    
    def __str__(self) -> str:
        status = 'Completed' if self.is_completed else 'In Progress'
        return f"{self.student.get_full_name()} - {self.lecture_game.title} ({status})"
    
    @property
    def is_perfect_score(self) -> bool:
        """Check if student achieved perfect score"""
        return self.accuracy_percentage == 100


class GameLeaderboard(TimeStampedModel):
    """
    Cached leaderboard data for fast retrieval
    Updated after each game completion
    """
    
    lecture_game = models.ForeignKey(
        LectureGame,
        on_delete=models.CASCADE,
        related_name='leaderboard'
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='game_leaderboard_entries'
    )
    
    rank = models.PositiveIntegerField(db_index=True)
    best_score = models.PositiveIntegerField(default=0)
    best_attempt = models.ForeignKey(
        GameAttempt,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='leaderboard_entries'
    )
    
    total_plays = models.PositiveIntegerField(default=0)
    last_played = models.DateTimeField()
    
    class Meta:
        verbose_name = 'Game Leaderboard Entry'
        verbose_name_plural = 'Game Leaderboard Entries'
        ordering = ['lecture_game', 'rank']
        unique_together = [['lecture_game', 'student']]
        indexes = [
            models.Index(fields=['lecture_game', 'rank']),
            models.Index(fields=['lecture_game', '-best_score']),
        ]
    
    def __str__(self) -> str:
        return f"#{self.rank} - {self.student.get_full_name()} ({self.best_score})"
