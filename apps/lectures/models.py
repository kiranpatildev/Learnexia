"""
Lecture models
"""

from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.schools.models import Classroom


class Lecture(TimeStampedModel, SoftDeleteModel):
    """
    Lecture recording model
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('recording', 'Recording'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='lectures')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lectures_created')
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    chapter = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    
    # Recording details
    recording_type = models.CharField(
        max_length=10,
        choices=[('audio', 'Audio'), ('video', 'Video')],
        default='audio'
    )
    audio_file = models.FileField(upload_to='lectures/audio/%Y/%m/%d/', null=True, blank=True)
    video_file = models.FileField(upload_to='lectures/video/%Y/%m/%d/', null=True, blank=True)
    thumbnail = models.ImageField(upload_to='lectures/thumbnails/%Y/%m/%d/', null=True, blank=True)
    duration = models.PositiveIntegerField(help_text='Duration in seconds', null=True, blank=True)
    
    # Transcription
    transcript = models.TextField(blank=True)
    has_auto_generated_transcript = models.BooleanField(default=False)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    
    # Scheduling
    scheduled_date = models.DateTimeField(null=True, blank=True)
    is_live = models.BooleanField(default=False, db_index=True)
    
    # Sharing
    is_shared_with_students = models.BooleanField(default=False, db_index=True)
    shared_at = models.DateTimeField(null=True, blank=True)
    notify_students = models.BooleanField(default=True)
    notify_parents = models.BooleanField(default=False)
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Lecture'
        verbose_name_plural = 'Lectures'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['classroom', '-created_at']),
            models.Index(fields=['teacher', '-created_at']),
            models.Index(fields=['status', 'is_shared_with_students']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.classroom}"


class LectureBookmark(TimeStampedModel):
    """
    Timestamps/bookmarks within lectures
    """
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='bookmarks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lecture_bookmarks')
    timestamp = models.PositiveIntegerField(help_text='Timestamp in seconds')
    title = models.CharField(max_length=255)
    note = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Lecture Bookmark'
        verbose_name_plural = 'Lecture Bookmarks'
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.lecture.title} - {self.timestamp}s"


class LectureView(TimeStampedModel):
    """
    Track who viewed which lecture
    """
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='views')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lecture_views')
    started_at = models.DateTimeField(auto_now_add=True)
    last_position = models.PositiveIntegerField(default=0, help_text='Last watched position in seconds')
    completed_at = models.DateTimeField(null=True, blank=True)
    completion_percentage = models.PositiveIntegerField(default=0)
    watch_time = models.PositiveIntegerField(default=0, help_text='Total watch time in seconds')
    
    class Meta:
        unique_together = ['lecture', 'student']
        verbose_name = 'Lecture View'
        verbose_name_plural = 'Lecture Views'
    
    def __str__(self):
        return f"{self.student.get_full_name()} viewed {self.lecture.title}"


class LectureResource(TimeStampedModel, SoftDeleteModel):
    """
    Additional resources attached to lectures
    """
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='lectures/resources/%Y/%m/%d/')
    file_type = models.CharField(max_length=50)
    file_size = models.PositiveIntegerField(help_text='File size in bytes')
    
    class Meta:
        verbose_name = 'Lecture Resource'
        verbose_name_plural = 'Lecture Resources'
    
    def __str__(self):
        return f"{self.title} - {self.lecture.title}"
