"""
Models for attendance app
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel
from apps.accounts.models import User
from apps.schools.models import Classroom


class AttendanceSession(TimeStampedModel):
    """Daily attendance session for a classroom"""
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='attendance_sessions')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conducted_sessions')
    
    date = models.DateField(db_index=True)
    session_type = models.CharField(
        max_length=20,
        choices=[
            ('morning', 'Morning'),
            ('afternoon', 'Afternoon'),
            ('full_day', 'Full Day'),
        ],
        default='full_day'
    )
    
    notes = models.TextField(blank=True, help_text='General notes about the session')
    
    is_finalized = models.BooleanField(default=False, help_text='Once finalized, cannot be edited')
    finalized_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['classroom', 'date', 'session_type']
        verbose_name = 'Attendance Session'
        verbose_name_plural = 'Attendance Sessions'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['classroom', '-date']),
            models.Index(fields=['teacher', '-date']),
        ]
    
    def __str__(self):
        return f"{self.classroom} - {self.date} ({self.session_type})"


class AttendanceRecord(TimeStampedModel):
    """Individual student attendance record"""
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
        ('sick', 'Sick'),
    ]
    
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present', db_index=True)
    arrival_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text='Specific notes for this student')
    
    # Parent notification
    parent_notified = models.BooleanField(default=False)
    parent_notified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['session', 'student']
        verbose_name = 'Attendance Record'
        verbose_name_plural = 'Attendance Records'
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['session', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.session.date} ({self.status})"


class AttendanceStatistics(TimeStampedModel):
    """Cached attendance statistics for students"""
    student = models.OneToOneField(User, on_delete=models.CASCADE, related_name='attendance_stats')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='student_attendance_stats')
    
    total_sessions = models.PositiveIntegerField(default=0)
    present_count = models.PositiveIntegerField(default=0)
    absent_count = models.PositiveIntegerField(default=0)
    late_count = models.PositiveIntegerField(default=0)
    excused_count = models.PositiveIntegerField(default=0)
    sick_count = models.PositiveIntegerField(default=0)
    
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Attendance Statistics'
        verbose_name_plural = 'Attendance Statistics'
        unique_together = ['student', 'classroom']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.attendance_percentage}%"
