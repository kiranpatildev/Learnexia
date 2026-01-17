"""
Models for reports app
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel
from apps.accounts.models import User
from apps.schools.models import Classroom


class ReportTemplate(TimeStampedModel):
    """Customizable report templates"""
    REPORT_TYPE_CHOICES = [
        ('student_report_card', 'Student Report Card'),
        ('progress_report', 'Progress Report'),
        ('attendance_report', 'Attendance Report'),
        ('behavior_report', 'Behavior Report'),
        ('transcript', 'Academic Transcript'),
        ('class_performance', 'Class Performance'),
        ('parent_summary', 'Parent Summary'),
        ('custom', 'Custom Report'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    report_type = models.CharField(max_length=30, choices=REPORT_TYPE_CHOICES, db_index=True)
    
    # Template configuration (JSON)
    sections = models.JSONField(
        default=dict,
        help_text='Sections to include: grades, attendance, behavior, etc.'
    )
    layout_config = models.JSONField(
        default=dict,
        help_text='Layout settings: colors, fonts, logo, etc.'
    )
    
    # Settings
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    # Creator
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_templates')
    
    class Meta:
        verbose_name = 'Report Template'
        verbose_name_plural = 'Report Templates'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Report(TimeStampedModel):
    """Generated reports"""
    REPORT_TYPE_CHOICES = ReportTemplate.REPORT_TYPE_CHOICES
    
    FILE_FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    report_type = models.CharField(max_length=30, choices=REPORT_TYPE_CHOICES, db_index=True)
    template = models.ForeignKey(ReportTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    
    # Report target
    student = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    
    # Parameters (JSON)
    parameters = models.JSONField(
        default=dict,
        help_text='Filters: academic_year, semester, date_range, etc.'
    )
    
    # File
    file_format = models.CharField(max_length=10, choices=FILE_FORMAT_CHOICES, default='pdf')
    file = models.FileField(upload_to='reports/%Y/%m/', null=True, blank=True)
    file_size = models.PositiveIntegerField(default=0, help_text='File size in bytes')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    error_message = models.TextField(blank=True)
    
    # Generation
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='generated_reports')
    generated_at = models.DateTimeField(null=True, blank=True)
    
    # Scheduling
    is_scheduled = models.BooleanField(default=False)
    schedule = models.ForeignKey('ReportSchedule', on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_reports')
    
    # Sharing
    is_shared = models.BooleanField(default=False)
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_reports')
    
    class Meta:
        verbose_name = 'Report'
        verbose_name_plural = 'Reports'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', '-created_at']),
            models.Index(fields=['classroom', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        target = self.student or self.classroom or 'School'
        return f"{self.get_report_type_display()} - {target}"


class ReportSchedule(TimeStampedModel):
    """Automated report generation schedules"""
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    name = models.CharField(max_length=255)
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE, related_name='schedules')
    
    # Target
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, null=True, blank=True, related_name='report_schedules')
    
    # Schedule
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    next_run_date = models.DateTimeField(db_index=True)
    last_run_date = models.DateTimeField(null=True, blank=True)
    
    # Recipients
    recipients = models.JSONField(
        default=list,
        help_text='List of email addresses to send report to'
    )
    
    # Settings
    is_active = models.BooleanField(default=True)
    
    # Creator
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_schedules')
    
    class Meta:
        verbose_name = 'Report Schedule'
        verbose_name_plural = 'Report Schedules'
        ordering = ['next_run_date']
    
    def __str__(self):
        return f"{self.name} ({self.frequency})"


class DataExport(TimeStampedModel):
    """Data exports (Excel/CSV)"""
    EXPORT_TYPE_CHOICES = [
        ('grades', 'Grades Export'),
        ('attendance', 'Attendance Export'),
        ('students', 'Students Export'),
        ('assignments', 'Assignments Export'),
        ('quizzes', 'Quizzes Export'),
        ('behavior', 'Behavior Export'),
        ('resources', 'Resources Export'),
        ('custom', 'Custom Export'),
    ]
    
    FILE_FORMAT_CHOICES = [
        ('excel', 'Excel (.xlsx)'),
        ('csv', 'CSV'),
    ]
    
    export_type = models.CharField(max_length=30, choices=EXPORT_TYPE_CHOICES, db_index=True)
    name = models.CharField(max_length=255)
    
    # Filters (JSON)
    filters = models.JSONField(
        default=dict,
        help_text='Filters: classroom, date_range, students, etc.'
    )
    
    # File
    file_format = models.CharField(max_length=10, choices=FILE_FORMAT_CHOICES, default='excel')
    file = models.FileField(upload_to='exports/%Y/%m/', null=True, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    
    # Metadata
    row_count = models.PositiveIntegerField(default=0, help_text='Number of rows exported')
    
    # Export info
    exported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='data_exports')
    exported_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Data Export'
        verbose_name_plural = 'Data Exports'
        ordering = ['-exported_at']
    
    def __str__(self):
        return f"{self.name} ({self.exported_at.strftime('%Y-%m-%d')})"
