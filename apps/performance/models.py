"""
Models for performance app
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel
from apps.accounts.models import User
from apps.schools.models import Classroom, Subject


class StudentGrade(TimeStampedModel):
    """Overall student grades and GPA"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_grades')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='student_grades')
    
    # Academic period
    academic_year = models.CharField(max_length=20, help_text='e.g., 2025-2026')
    semester = models.CharField(
        max_length=20,
        choices=[
            ('semester1', 'Semester 1'),
            ('semester2', 'Semester 2'),
            ('full_year', 'Full Year'),
        ],
        default='full_year'
    )
    
    # Overall performance
    overall_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overall_grade = models.CharField(max_length=2, blank=True, help_text='A+, A, B+, etc.')
    gpa = models.DecimalField(max_digits=3, decimal_places=2, default=0, help_text='Grade Point Average')
    
    # Ranking
    class_rank = models.PositiveIntegerField(null=True, blank=True)
    total_students = models.PositiveIntegerField(default=0)
    
    # Attendance impact
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Behavior impact
    behavior_score = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    
    # Status
    is_passing = models.BooleanField(default=True)
    is_honor_roll = models.BooleanField(default=False)
    
    # Comments
    teacher_comments = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['student', 'classroom', 'academic_year', 'semester']
        verbose_name = 'Student Grade'
        verbose_name_plural = 'Student Grades'
        ordering = ['-academic_year', 'classroom', '-overall_percentage']
        indexes = [
            models.Index(fields=['student', '-academic_year']),
            models.Index(fields=['classroom', '-overall_percentage']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.academic_year} - {self.overall_percentage}%"


class SubjectPerformance(TimeStampedModel):
    """Per-subject performance tracking"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subject_performances')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='student_performances')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='subject_performances')
    
    academic_year = models.CharField(max_length=20)
    semester = models.CharField(max_length=20, default='full_year')
    
    # Scores from different sources
    assignment_average = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    quiz_average = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Weighted average
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    letter_grade = models.CharField(max_length=2, blank=True)
    
    # Statistics
    total_assignments = models.PositiveIntegerField(default=0)
    completed_assignments = models.PositiveIntegerField(default=0)
    total_quizzes = models.PositiveIntegerField(default=0)
    completed_quizzes = models.PositiveIntegerField(default=0)
    
    # Trends
    is_improving = models.BooleanField(default=False)
    trend = models.CharField(
        max_length=20,
        choices=[
            ('improving', 'Improving'),
            ('stable', 'Stable'),
            ('declining', 'Declining'),
        ],
        default='stable'
    )
    
    # Teacher feedback
    strengths = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['student', 'subject', 'classroom', 'academic_year', 'semester']
        verbose_name = 'Subject Performance'
        verbose_name_plural = 'Subject Performances'
        ordering = ['-academic_year', 'subject']
        indexes = [
            models.Index(fields=['student', 'subject', '-academic_year']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.subject.name} - {self.overall_score}%"


class ProgressReport(TimeStampedModel):
    """Periodic progress reports"""
    REPORT_TYPE_CHOICES = [
        ('midterm', 'Mid-Term Report'),
        ('final', 'Final Report'),
        ('quarterly', 'Quarterly Report'),
        ('custom', 'Custom Report'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress_reports')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='progress_reports')
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    academic_year = models.CharField(max_length=20)
    report_period = models.CharField(max_length=50, help_text='e.g., Q1, Semester 1')
    
    # Generated data
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='generated_progress_reports')
    
    # Overall summary
    overall_performance = models.TextField()
    academic_summary = models.TextField()
    attendance_summary = models.TextField(blank=True)
    behavior_summary = models.TextField(blank=True)
    
    # Recommendations
    recommendations = models.TextField(blank=True)
    next_steps = models.TextField(blank=True)
    
    # PDF
    pdf_file = models.FileField(upload_to='reports/progress/%Y/%m/', null=True, blank=True)
    
    # Sharing
    shared_with_parent = models.BooleanField(default=False)
    parent_viewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Progress Report'
        verbose_name_plural = 'Progress Reports'
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['student', '-generated_at']),
            models.Index(fields=['classroom', '-generated_at']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.report_type} - {self.report_period}"


class PerformanceMetric(TimeStampedModel):
    """Custom performance metrics and milestones"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performance_metrics')
    
    metric_name = models.CharField(max_length=100)
    metric_type = models.CharField(
        max_length=20,
        choices=[
            ('academic', 'Academic'),
            ('attendance', 'Attendance'),
            ('behavior', 'Behavior'),
            ('participation', 'Participation'),
            ('custom', 'Custom'),
        ]
    )
    
    current_value = models.DecimalField(max_digits=10, decimal_places=2)
    target_value = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, default='%', help_text='%, points, count, etc.')
    
    # Progress
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_achieved = models.BooleanField(default=False)
    achieved_at = models.DateTimeField(null=True, blank=True)
    
    # Timeline
    start_date = models.DateField()
    target_date = models.DateField()
    
    # Tracking
    tracked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='tracked_metrics')
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Performance Metric'
        verbose_name_plural = 'Performance Metrics'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.metric_name}: {self.current_value}/{self.target_value}"
