"""
Models for resources app
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.schools.models import Classroom, Subject


class ResourceCategory(TimeStampedModel):
    """Categories for organizing resources"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True, related_name='resource_categories')
    grade_level = models.CharField(max_length=20, blank=True)
    parent_category = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    color = models.CharField(max_length=7, default='#3B82F6', help_text='Hex color code')
    icon = models.CharField(max_length=50, blank=True, help_text='Icon name/class')
    
    class Meta:
        verbose_name = 'Resource Category'
        verbose_name_plural = 'Resource Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Resource(TimeStampedModel, SoftDeleteModel):
    """Shared educational resources"""
    RESOURCE_TYPE_CHOICES = [
        ('file', 'File Upload'),
        ('link', 'External Link'),
        ('video', 'Video'),
    ]
    
    ACCESS_LEVEL_CHOICES = [
        ('public', 'Public - All School'),
        ('classroom_only', 'Classroom Only'),
        ('specific_students', 'Specific Students'),
        ('teachers_only', 'Teachers Only'),
    ]
    
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES, default='file')
    
    # File or link
    file = models.FileField(upload_to='resources/%Y/%m/%d/', null=True, blank=True)
    external_link = models.URLField(max_length=500, blank=True)
    file_type = models.CharField(max_length=50, blank=True)
    file_size = models.PositiveIntegerField(default=0, help_text='File size in bytes')
    
    # Organization
    category = models.ForeignKey(ResourceCategory, on_delete=models.SET_NULL, null=True, related_name='resources')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_resources')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True, related_name='resources')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources')
    grade_level = models.CharField(max_length=20, blank=True)
    
    # Metadata
    tags = models.CharField(max_length=500, blank=True, help_text='Comma-separated tags')
    access_level = models.CharField(max_length=30, choices=ACCESS_LEVEL_CHOICES, default='public', db_index=True)
    
    # Statistics
    download_count = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    
    # Thumbnail
    thumbnail = models.ImageField(upload_to='resources/thumbnails/%Y/%m/%d/', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Resource'
        verbose_name_plural = 'Resources'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['uploaded_by', '-created_at']),
            models.Index(fields=['-download_count']),
            models.Index(fields=['access_level', '-created_at']),
        ]
    
    def __str__(self):
        return self.title


class ResourceDownload(TimeStampedModel):
    """Track resource downloads"""
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='downloads')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_downloads')
    downloaded_at = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Resource Download'
        verbose_name_plural = 'Resource Downloads'
        ordering = ['-downloaded_at']
        indexes = [
            models.Index(fields=['resource', '-downloaded_at']),
            models.Index(fields=['user', '-downloaded_at']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} downloaded {self.resource.title}"
