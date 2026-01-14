"""
Models for assignments app
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.schools.models import Classroom
from apps.notes.models import LectureNote


class Assignment(TimeStampedModel, SoftDeleteModel):
    """Homework/Assignment model"""
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='assignments')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_assignments')
    
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    instructions = models.TextField(blank=True)
    
    linked_lecture_note = models.ForeignKey(
        LectureNote,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assignments'
    )
    
    assigned_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(db_index=True)
    
    total_points = models.PositiveIntegerField(default=100)
    
    allow_late_submission = models.BooleanField(default=False)
    late_penalty_percentage = models.PositiveIntegerField(default=0)
    
    # AI Generation
    is_ai_generated = models.BooleanField(default=False)
    ai_generated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'
        ordering = ['-due_date']
        indexes = [
            models.Index(fields=['classroom', '-due_date']),
            models.Index(fields=['teacher', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.classroom}"


class AssignmentAttachment(TimeStampedModel):
    """Files attached to assignments by teacher"""
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='assignments/attachments/%Y/%m/%d/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.PositiveIntegerField(help_text='File size in bytes')
    
    class Meta:
        verbose_name = 'Assignment Attachment'
        verbose_name_plural = 'Assignment Attachments'
    
    def __str__(self):
        return f"{self.file_name} - {self.assignment.title}"


class AssignmentSubmission(TimeStampedModel):
    """Student submissions for assignments"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
        ('returned', 'Returned for Revision'),
    ]
    
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_submissions')
    
    submitted_at = models.DateTimeField(null=True, blank=True)
    is_late = models.BooleanField(default=False)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    
    points_earned = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    graded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_submissions'
    )
    
    # AI Grading
    is_ai_graded = models.BooleanField(default=False)
    ai_feedback = models.TextField(blank=True)
    ai_confidence_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    class Meta:
        unique_together = ['assignment', 'student']
        verbose_name = 'Assignment Submission'
        verbose_name_plural = 'Assignment Submissions'
        indexes = [
            models.Index(fields=['assignment', 'status']),
            models.Index(fields=['student', '-submitted_at']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.assignment.title}"


class SubmissionFile(TimeStampedModel):
    """Files uploaded by students for submissions"""
    submission = models.ForeignKey(AssignmentSubmission, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='assignments/submissions/%Y/%m/%d/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.PositiveIntegerField(help_text='File size in bytes')
    
    class Meta:
        verbose_name = 'Submission File'
        verbose_name_plural = 'Submission Files'
    
    def __str__(self):
        return f"{self.file_name} - {self.submission}"
