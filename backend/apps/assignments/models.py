"""
Production-Grade Assignment Models
Supports AI generation, rubric-based grading, online/offline submissions
"""

from django.db import models
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator
from django.utils import timezone
from apps.core.models import TimeStampedModel
from apps.accounts.models import User
from apps.schools.models import Classroom
from apps.lectures.models import Lecture
import uuid


class Assignment(TimeStampedModel):
    """
    Core assignment model supporting both AI-generated and manual creation.
    Handles online (text) and offline (PDF) submission types.
    """
    
    # Identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    
    # Relationships
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_assignments',
        limit_choices_to={'role': 'teacher'},
        null=True,
        blank=True
    )
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    source_lecture = models.ForeignKey(
        Lecture,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_assignments',
        help_text='If AI-generated, the lecture it was based on'
    )
    
    # Assignment Configuration
    SUBMISSION_TYPE_CHOICES = [
        ('online', 'Online (Type Answer)'),
        ('offline', 'Offline (Upload PDF)')
    ]
    submission_type = models.CharField(
        max_length=10,
        choices=SUBMISSION_TYPE_CHOICES,
        default='online'
    )
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ]
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        null=True,
        blank=True
    )
    
    ASSIGNMENT_FORMAT_CHOICES = [
        ('essay', 'Essay/Long Answer'),
        ('short_answer', 'Short Answer Questions'),
        ('case_study', 'Case Study Analysis')
    ]
    assignment_format = models.CharField(
        max_length=20,
        choices=ASSIGNMENT_FORMAT_CHOICES,
        default='short_answer'
    )
    
    # Grading Configuration
    total_marks = models.PositiveIntegerField(default=10)
    pass_marks = models.PositiveIntegerField(default=6)
    
    GRADING_METHOD_CHOICES = [
        ('manual', 'Manual Grading'),
        ('ai_assisted', 'AI-Assisted (Teacher Reviews)'),
        ('automated', 'Fully Automated AI')
    ]
    grading_method = models.CharField(
        max_length=15,
        choices=GRADING_METHOD_CHOICES,
        default='ai_assisted'
    )
    
    GRADING_TYPE_CHOICES = [
        ('basic', 'Basic (Overall Score)'),
        ('rubric', 'Rubric-Based (Criteria)')
    ]
    grading_type = models.CharField(
        max_length=10,
        choices=GRADING_TYPE_CHOICES,
        default='basic'
    )
    
    # AI Generation Metadata
    is_ai_generated = models.BooleanField(default=False)
    ai_generation_prompt = models.TextField(blank=True)
    ai_generation_cost = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        default=0,
        help_text='Cost in USD'
    )
    generation_tokens = models.IntegerField(default=0)
    ai_generated_at = models.DateTimeField(null=True, blank=True)
    
    # Deadline Management
    due_date = models.DateTimeField(db_index=True)
    allow_late_submission = models.BooleanField(default=False)
    late_penalty_per_day = models.PositiveIntegerField(
        default=10,
        validators=[MaxValueValidator(100)],
        help_text='Percentage penalty per day late'
    )
    
    # Status
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'
        indexes = [
            models.Index(fields=['classroom', 'is_published']),
            models.Index(fields=['due_date']),
            models.Index(fields=['created_by', '-created_at'])
        ]
    
    def __str__(self):
        return f"{self.title} - {self.classroom.name}"
    
    @property
    def is_overdue(self):
        return timezone.now() > self.due_date
    
    @property
    def submission_stats(self):
        """Calculate submission statistics"""
        from apps.schools.models import ClassroomEnrollment
        
        total_students = ClassroomEnrollment.objects.filter(
            classroom=self.classroom,
            is_active=True
        ).count()
        
        submissions = self.submissions.all()
        submitted_count = submissions.filter(status__in=['submitted', 'graded']).count()
        graded_count = submissions.filter(status='graded').count()
        
        return {
            'total_students': total_students,
            'submitted': submitted_count,
            'pending': total_students - submitted_count,
            'graded': graded_count,
            'awaiting_review': submitted_count - graded_count,
            'submission_rate': (submitted_count / total_students * 100) if total_students > 0 else 0
        }


class AssignmentQuestion(models.Model):
    """
    Individual questions within an assignment.
    Supports both AI-generated and manual questions.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    
    question_number = models.PositiveIntegerField()
    question_text = models.TextField()
    
    # For AI-generated questions
    expected_answer_keywords = models.JSONField(
        default=list,
        blank=True,
        help_text='Keywords AI should look for when grading'
    )
    
    expected_answer_length = models.CharField(
        max_length=50,
        blank=True,
        help_text='e.g., "2-3 sentences", "1 paragraph"'
    )
    
    grading_notes = models.TextField(
        blank=True,
        help_text='Criteria for full marks'
    )
    
    # Question-specific marks (if different from equal distribution)
    marks = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Leave blank for equal distribution'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['question_number']
        unique_together = ['assignment', 'question_number']
        verbose_name = 'Assignment Question'
        verbose_name_plural = 'Assignment Questions'
    
    def __str__(self):
        return f"Q{self.question_number}: {self.question_text[:50]}"


class RubricCriterion(models.Model):
    """
    Grading criteria for rubric-based assignments.
    Only exists if assignment.grading_type == 'rubric'
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='rubric_criteria'
    )
    
    criterion_name = models.CharField(
        max_length=100,
        help_text='e.g., Content Accuracy, Grammar, Structure'
    )
    
    description = models.TextField(blank=True)
    
    weight_percentage = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text='Percentage weight (all criteria must sum to 100)'
    )
    
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        verbose_name = 'Rubric Criterion'
        verbose_name_plural = 'Rubric Criteria'
    
    def __str__(self):
        return f"{self.criterion_name} ({self.weight_percentage}%)"


class AssignmentSubmission(TimeStampedModel):
    """
    Student's submission for an assignment.
    Handles both online text and offline PDF submissions.
    """
    
    # Identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='assignment_submissions',
        limit_choices_to={'role': 'student'}
    )
    
    # Submission Content
    submission_method = models.CharField(
        max_length=10,
        choices=[
            ('text', 'Text Entry'),
            ('pdf', 'PDF Upload')
        ],
        null=True,
        blank=True,
        help_text='For online assignments: how student submitted (text vs PDF)'
    )

    answers = models.JSONField(
        default=dict,
        help_text='For text: {question_id: answer_text}. For PDF: {metadata: {...}}'
    )
    
    uploaded_file = models.FileField(
        upload_to='assignments/submissions/%Y/%m/%d/',
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf']),
        ],
        help_text='PDF file for both online-PDF and offline submissions'
    )
    file_size_bytes = models.PositiveIntegerField(null=True, blank=True)
    
    # Status
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('grading', 'Being Graded'),
        ('graded', 'Graded'),
        ('returned', 'Returned to Student')
    ]
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True
    )
    
    # Timestamps
    submitted_at = models.DateTimeField(null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    
    # Late submission tracking
    is_late = models.BooleanField(default=False)
    days_late = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-submitted_at']
        unique_together = ['assignment', 'student']
        verbose_name = 'Assignment Submission'
        verbose_name_plural = 'Assignment Submissions'
        indexes = [
            models.Index(fields=['assignment', 'status']),
            models.Index(fields=['student', '-submitted_at'])
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.assignment.title}"
    
    def calculate_late_penalty(self):
        """Calculate penalty if submission was late"""
        if self.is_late and self.assignment.allow_late_submission:
            penalty_percent = self.days_late * self.assignment.late_penalty_per_day
            return min(penalty_percent, 100)  # Max 100% penalty
        return 0
    
    @property
    def file_size_mb(self):
        if self.file_size_bytes:
            return round(self.file_size_bytes / (1024 * 1024), 2)
        return 0
    
    def calculate_days_late(self):
        """Calculate how many days late the submission is"""
        if self.submitted_at and self.submitted_at > self.assignment.due_date:
            delta = self.submitted_at - self.assignment.due_date
            return delta.days
        return 0


class AssignmentGrade(TimeStampedModel):
    """
    Grading record for a submission.
    Stores both AI suggestions and teacher's final decision.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.OneToOneField(
        AssignmentSubmission,
        on_delete=models.CASCADE,
        related_name='grade'
    )
    
    # Scoring
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        editable=False
    )
    
    # Feedback
    overall_feedback = models.TextField(blank=True)
    teacher_comments = models.TextField(blank=True)
    
    # AI Grading Data
    ai_suggested_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    ai_feedback = models.TextField(blank=True)
    ai_grading_data = models.JSONField(
        default=dict,
        help_text='Detailed AI analysis and scoring breakdown'
    )
    ai_grading_cost = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        default=0
    )
    ai_grading_tokens = models.IntegerField(default=0)
    
    # Teacher Actions
    graded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='graded_assignments'
    )
    
    teacher_modified_ai_score = models.BooleanField(
        default=False,
        help_text='True if teacher changed AI suggestion'
    )
    
    # Status
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Assignment Grade'
        verbose_name_plural = 'Assignment Grades'
    
    def save(self, *args, **kwargs):
        # Auto-calculate percentage
        if self.max_score > 0:
            self.percentage = (self.score / self.max_score) * 100
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.submission.student.get_full_name()} - {self.score}/{self.max_score}"
    
    @property
    def passed(self):
        return self.score >= self.submission.assignment.pass_marks


class RubricScore(models.Model):
    """
    Individual criterion scores for rubric-based grading.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grade = models.ForeignKey(
        AssignmentGrade,
        on_delete=models.CASCADE,
        related_name='rubric_scores'
    )
    
    criterion = models.ForeignKey(
        RubricCriterion,
        on_delete=models.CASCADE
    )
    
    # Scoring (0-10 scale)
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    
    # AI suggestion for this criterion
    ai_suggested_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    feedback = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['grade', 'criterion']
        verbose_name = 'Rubric Score'
        verbose_name_plural = 'Rubric Scores'
    
    def __str__(self):
        return f"{self.criterion.criterion_name}: {self.score}/10"
    
    @property
    def weighted_score(self):
        """Calculate this criterion's contribution to total score"""
        return (self.score / 10) * (self.criterion.weight_percentage / 100) * self.grade.max_score


class GradingAuditLog(models.Model):
    """
    Audit trail for all grading actions.
    Essential for accountability and debugging.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grade = models.ForeignKey(
        AssignmentGrade,
        on_delete=models.CASCADE,
        related_name='audit_logs'
    )
    
    ACTION_CHOICES = [
        ('ai_graded', 'AI Graded'),
        ('teacher_reviewed', 'Teacher Reviewed'),
        ('score_modified', 'Score Modified'),
        ('feedback_added', 'Feedback Added'),
        ('published', 'Published to Student')
    ]
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    
    old_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    new_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    notes = models.TextField(blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Grading Audit Log'
        verbose_name_plural = 'Grading Audit Logs'
        indexes = [
            models.Index(fields=['grade', '-timestamp'])
        ]
    
    def __str__(self):
        return f"{self.action} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
