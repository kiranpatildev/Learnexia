"""
Models for gamification app
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel
from apps.accounts.models import User
from apps.schools.models import Classroom


class StudentXP(TimeStampedModel):
    """Student experience points and level"""
    student = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_xp')
    
    # XP and Level
    total_xp = models.PositiveIntegerField(default=0, db_index=True)
    current_level = models.PositiveIntegerField(default=1)
    xp_to_next_level = models.PositiveIntegerField(default=100)
    
    # Streaks
    current_streak = models.PositiveIntegerField(default=0, help_text='Consecutive days active')
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Statistics
    total_badges_earned = models.PositiveIntegerField(default=0)
    total_achievements = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Student XP'
        verbose_name_plural = 'Student XP'
        ordering = ['-total_xp']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - Level {self.current_level} ({self.total_xp} XP)"


class XPTransaction(TimeStampedModel):
    """Log of XP earned/spent"""
    TRANSACTION_TYPE_CHOICES = [
        ('earned', 'Earned'),
        ('spent', 'Spent'),
        ('bonus', 'Bonus'),
        ('penalty', 'Penalty'),
    ]
    
    SOURCE_CHOICES = [
        ('assignment_completed', 'Assignment Completed'),
        ('quiz_completed', 'Quiz Completed'),
        ('perfect_score', 'Perfect Score'),
        ('attendance', 'Attendance'),
        ('behavior', 'Good Behavior'),
        ('streak', 'Streak Bonus'),
        ('badge_earned', 'Badge Earned'),
        ('manual', 'Manual Award'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='xp_transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES)
    
    amount = models.IntegerField(help_text='Positive for earned, negative for spent')
    balance_after = models.PositiveIntegerField(help_text='Total XP after transaction')
    
    description = models.CharField(max_length=255)
    
    # Reference to source object (optional)
    reference_type = models.CharField(max_length=50, blank=True, help_text='assignment, quiz, etc.')
    reference_id = models.CharField(max_length=100, blank=True)
    
    awarded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='awarded_xp'
    )
    
    class Meta:
        verbose_name = 'XP Transaction'
        verbose_name_plural = 'XP Transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.amount} XP ({self.source})"


class Badge(TimeStampedModel):
    """Badge definitions"""
    CATEGORY_CHOICES = [
        ('academic', 'Academic'),
        ('attendance', 'Attendance'),
        ('behavior', 'Behavior'),
        ('participation', 'Participation'),
        ('special', 'Special'),
    ]
    
    RARITY_CHOICES = [
        ('common', 'Common'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='common')
    
    # Requirements
    requirement_description = models.TextField(help_text='What student needs to do to earn this')
    xp_reward = models.PositiveIntegerField(default=50)
    
    # Visual
    icon = models.CharField(max_length=50, default='trophy', help_text='Icon name/class')
    color = models.CharField(max_length=7, default='#FFD700', help_text='Hex color code')
    image = models.ImageField(upload_to='badges/', null=True, blank=True)
    
    # Availability
    is_active = models.BooleanField(default=True)
    is_secret = models.BooleanField(default=False, help_text='Hidden until earned')
    
    # Statistics
    times_earned = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Badge'
        verbose_name_plural = 'Badges'
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.rarity})"


class StudentBadge(TimeStampedModel):
    """Badges earned by students"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='earned_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='student_badges')
    
    earned_at = models.DateTimeField(auto_now_add=True)
    
    # Context
    earned_for = models.CharField(max_length=255, blank=True, help_text='What action earned this badge')
    reference_type = models.CharField(max_length=50, blank=True)
    reference_id = models.CharField(max_length=100, blank=True)
    
    # Display
    is_displayed = models.BooleanField(default=True, help_text='Show on student profile')
    display_order = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ['student', 'badge']
        verbose_name = 'Student Badge'
        verbose_name_plural = 'Student Badges'
        ordering = ['-earned_at']
        indexes = [
            models.Index(fields=['student', '-earned_at']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} earned {self.badge.name}"


class Leaderboard(TimeStampedModel):
    """Leaderboard configurations"""
    LEADERBOARD_TYPE_CHOICES = [
        ('xp', 'Total XP'),
        ('level', 'Level'),
        ('badges', 'Badges Earned'),
        ('streak', 'Current Streak'),
        ('custom', 'Custom Metric'),
    ]
    
    SCOPE_CHOICES = [
        ('school', 'School-Wide'),
        ('classroom', 'Classroom'),
        ('grade', 'Grade Level'),
    ]
    
    TIME_PERIOD_CHOICES = [
        ('all_time', 'All Time'),
        ('monthly', 'This Month'),
        ('weekly', 'This Week'),
        ('daily', 'Today'),
    ]
    
    name = models.CharField(max_length=100)
    leaderboard_type = models.CharField(max_length=20, choices=LEADERBOARD_TYPE_CHOICES)
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    time_period = models.CharField(max_length=20, choices=TIME_PERIOD_CHOICES, default='all_time')
    
    # Scope filters
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True, related_name='leaderboards')
    grade_level = models.CharField(max_length=20, blank=True)
    
    # Settings
    is_active = models.BooleanField(default=True)
    max_entries = models.PositiveIntegerField(default=10, help_text='Top N students to show')
    
    # Cache
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Leaderboard'
        verbose_name_plural = 'Leaderboards'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.scope})"


class LeaderboardEntry(TimeStampedModel):
    """Cached leaderboard entries"""
    leaderboard = models.ForeignKey(Leaderboard, on_delete=models.CASCADE, related_name='entries')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaderboard_entries')
    
    rank = models.PositiveIntegerField(db_index=True)
    score = models.PositiveIntegerField(help_text='XP, badges count, etc.')
    
    # Change tracking
    previous_rank = models.PositiveIntegerField(null=True, blank=True)
    rank_change = models.IntegerField(default=0, help_text='Positive = moved up, negative = moved down')
    
    class Meta:
        unique_together = ['leaderboard', 'student']
        verbose_name = 'Leaderboard Entry'
        verbose_name_plural = 'Leaderboard Entries'
        ordering = ['leaderboard', 'rank']
        indexes = [
            models.Index(fields=['leaderboard', 'rank']),
        ]
    
    def __str__(self):
        return f"#{self.rank} - {self.student.get_full_name()} ({self.score})"


class Achievement(TimeStampedModel):
    """Special achievements/milestones"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    
    # Requirements
    requirement_type = models.CharField(
        max_length=30,
        choices=[
            ('xp_milestone', 'XP Milestone'),
            ('level_reached', 'Level Reached'),
            ('badges_collected', 'Badges Collected'),
            ('streak_milestone', 'Streak Milestone'),
            ('perfect_scores', 'Perfect Scores'),
            ('custom', 'Custom'),
        ]
    )
    requirement_value = models.PositiveIntegerField()
    
    # Rewards
    xp_reward = models.PositiveIntegerField(default=100)
    badge_reward = models.ForeignKey(Badge, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Visual
    icon = models.CharField(max_length=50, default='star')
    color = models.CharField(max_length=7, default='#FFA500')
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Achievement'
        verbose_name_plural = 'Achievements'
        ordering = ['requirement_value']
    
    def __str__(self):
        return self.name


class StudentAchievement(TimeStampedModel):
    """Achievements unlocked by students"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='student_achievements')
    
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['student', 'achievement']
        verbose_name = 'Student Achievement'
        verbose_name_plural = 'Student Achievements'
        ordering = ['-unlocked_at']
    
    def __str__(self):
        return f"{self.student.get_full_name()} unlocked {self.achievement.name}"
