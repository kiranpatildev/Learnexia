"""
Models for communication app
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.schools.models import Classroom


class Conversation(TimeStampedModel, SoftDeleteModel):
    """Message conversation/thread"""
    CONVERSATION_TYPE_CHOICES = [
        ('direct', 'Direct Message'),
        ('group', 'Group Chat'),
    ]
    
    conversation_type = models.CharField(max_length=20, choices=CONVERSATION_TYPE_CHOICES, default='direct')
    title = models.CharField(max_length=255, blank=True, help_text='Required for group conversations')
    
    participants = models.ManyToManyField(User, related_name='conversations')
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations')
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_conversations')
    last_message_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-last_message_at']
        indexes = [
            models.Index(fields=['-last_message_at']),
        ]
    
    def __str__(self):
        if self.title:
            return self.title
        # Auto-generate title for direct messages
        participant_names = ', '.join([p.get_full_name() for p in self.participants.all()[:3]])
        return f"{participant_names}"


class Message(TimeStampedModel, SoftDeleteModel):
    """Individual message in a conversation"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    
    message_text = models.TextField(max_length=5000)
    
    # Threading
    replied_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    # Editing
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender', '-created_at']),
        ]
    
    def __str__(self):
        preview = self.message_text[:50]
        return f"{self.sender.get_full_name()}: {preview}"


class MessageAttachment(TimeStampedModel):
    """File attachments for messages"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='communication/attachments/%Y/%m/%d/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.PositiveIntegerField(help_text='File size in bytes')
    
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_attachments')
    download_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Message Attachment'
        verbose_name_plural = 'Message Attachments'
    
    def __str__(self):
        return f"{self.file_name} - {self.message}"


class MessageRead(TimeStampedModel):
    """Track who has read which messages"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='message_reads')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='read_messages')
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['message', 'user']
        verbose_name = 'Message Read'
        verbose_name_plural = 'Message Reads'
        indexes = [
            models.Index(fields=['message', 'user']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} read message at {self.read_at}"


class Announcement(TimeStampedModel, SoftDeleteModel):
    """School/classroom announcements"""
    PRIORITY_CHOICES = [
        ('normal', 'Normal'),
        ('important', 'Important'),
        ('urgent', 'Urgent'),
    ]
    
    TARGET_ROLE_CHOICES = [
        ('student', 'Students'),
        ('parent', 'Parents'),
        ('teacher', 'Teachers'),
        ('all', 'Everyone'),
    ]
    
    title = models.CharField(max_length=200, db_index=True)
    content = models.TextField(max_length=10000)
    
    sent_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_announcements')
    sent_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # Targeting
    target_role = models.CharField(max_length=20, choices=TARGET_ROLE_CHOICES, db_index=True)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True, related_name='announcements')
    
    # Scheduling
    scheduled_for = models.DateTimeField(null=True, blank=True, help_text='Schedule for future sending')
    is_draft = models.BooleanField(default=False, db_index=True)
    
    # Settings
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal', db_index=True)
    requires_acknowledgment = models.BooleanField(default=False)
    
    # Statistics
    total_recipients = models.PositiveIntegerField(default=0)
    read_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['target_role', '-sent_at']),
            models.Index(fields=['classroom', '-sent_at']),
            models.Index(fields=['is_draft', '-created_at']),
        ]
    
    def __str__(self):
        return self.title


class AnnouncementRead(TimeStampedModel):
    """Track who has read announcements"""
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE, related_name='announcement_reads')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='read_announcements')
    read_at = models.DateTimeField(null=True, blank=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['announcement', 'user']
        verbose_name = 'Announcement Read'
        verbose_name_plural = 'Announcement Reads'
        indexes = [
            models.Index(fields=['announcement', 'user']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.announcement.title}"
