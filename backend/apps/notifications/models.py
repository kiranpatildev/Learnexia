"""
Models for notifications app
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel
from apps.accounts.models import User


class Notification(TimeStampedModel):
    """System notifications for users"""
    NOTIFICATION_TYPE_CHOICES = [
        # Academic
        ('assignment_created', 'New Assignment'),
        ('assignment_graded', 'Assignment Graded'),
        ('quiz_created', 'New Quiz'),
        ('quiz_graded', 'Quiz Graded'),
        
        # Communication
        ('new_message', 'New Message'),
        ('new_announcement', 'New Announcement'),
        
        # Attendance
        ('attendance_marked', 'Attendance Marked'),
        ('absence_alert', 'Absence Alert'),
        
        # Behavior
        ('behavior_incident', 'Behavior Incident'),
        ('behavior_note', 'Behavior Note'),
        
        # Performance
        ('grade_updated', 'Grade Updated'),
        ('progress_report', 'Progress Report Available'),
        
        # Gamification
        ('xp_earned', 'XP Earned'),
        ('level_up', 'Level Up'),
        ('badge_earned', 'Badge Earned'),
        ('achievement_unlocked', 'Achievement Unlocked'),
        
        # Resources
        ('resource_shared', 'Resource Shared'),
        
        # System
        ('system_alert', 'System Alert'),
        ('reminder', 'Reminder'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPE_CHOICES, db_index=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal', db_index=True)
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Reference to source object
    reference_type = models.CharField(max_length=50, blank=True, help_text='assignment, quiz, message, etc.')
    reference_id = models.CharField(max_length=100, blank=True)
    
    # Action URL
    action_url = models.CharField(max_length=500, blank=True, help_text='URL to navigate to when clicked')
    
    # Status
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Delivery
    sent_at = models.DateTimeField(auto_now_add=True)
    
    # Additional data (JSON)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['recipient', '-sent_at']),
            models.Index(fields=['recipient', 'is_read', '-sent_at']),
            models.Index(fields=['notification_type', '-sent_at']),
        ]
    
    def __str__(self):
        return f"{self.recipient.get_full_name()} - {self.title}"


class NotificationPreference(TimeStampedModel):
    """User notification preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # In-app notifications
    enable_in_app = models.BooleanField(default=True)
    
    # Email notifications
    enable_email = models.BooleanField(default=True)
    email_frequency = models.CharField(
        max_length=20,
        choices=[
            ('instant', 'Instant'),
            ('daily', 'Daily Digest'),
            ('weekly', 'Weekly Digest'),
            ('never', 'Never'),
        ],
        default='instant'
    )
    
    # Push notifications (future)
    enable_push = models.BooleanField(default=False)
    
    # SMS notifications (future)
    enable_sms = models.BooleanField(default=False)
    
    # Notification type preferences
    notify_assignments = models.BooleanField(default=True)
    notify_quizzes = models.BooleanField(default=True)
    notify_messages = models.BooleanField(default=True)
    notify_announcements = models.BooleanField(default=True)
    notify_attendance = models.BooleanField(default=True)
    notify_behavior = models.BooleanField(default=True)
    notify_grades = models.BooleanField(default=True)
    notify_gamification = models.BooleanField(default=True)
    notify_resources = models.BooleanField(default=True)
    
    # Quiet hours
    enable_quiet_hours = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True, help_text='e.g., 22:00')
    quiet_hours_end = models.TimeField(null=True, blank=True, help_text='e.g., 07:00')
    
    class Meta:
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Preferences"


class NotificationTemplate(TimeStampedModel):
    """Templates for notification messages"""
    name = models.CharField(max_length=100, unique=True)
    notification_type = models.CharField(max_length=30, choices=Notification.NOTIFICATION_TYPE_CHOICES)
    
    # Template content
    title_template = models.CharField(max_length=255, help_text='Use {variable} for placeholders')
    message_template = models.TextField(help_text='Use {variable} for placeholders')
    
    # Email template (optional)
    email_subject_template = models.CharField(max_length=255, blank=True)
    email_body_template = models.TextField(blank=True)
    
    # Settings
    is_active = models.BooleanField(default=True)
    priority = models.CharField(max_length=20, choices=Notification.PRIORITY_CHOICES, default='normal')
    
    class Meta:
        verbose_name = 'Notification Template'
        verbose_name_plural = 'Notification Templates'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class NotificationBatch(TimeStampedModel):
    """Batch notifications for bulk sending"""
    name = models.CharField(max_length=255)
    notification_type = models.CharField(max_length=30, choices=Notification.NOTIFICATION_TYPE_CHOICES)
    
    # Content
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Recipients
    recipient_count = models.PositiveIntegerField(default=0)
    sent_count = models.PositiveIntegerField(default=0)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    
    # Scheduling
    scheduled_for = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    # Creator
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_batches')
    
    class Meta:
        verbose_name = 'Notification Batch'
        verbose_name_plural = 'Notification Batches'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.status})"
