"""
Models for behavior app
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.schools.models import Classroom
from apps.lectures.models import Lecture


class BehaviorIncident(TimeStampedModel, SoftDeleteModel):
    """
    Behavioral incidents for students
    
    Can be created:
    1. Manually by teachers/admins
    2. Automatically by AI (future) from lecture analysis
    """
    SEVERITY_CHOICES = [
        ('minor', 'Minor'),
        ('moderate', 'Moderate'),
        ('serious', 'Serious'),
        ('critical', 'Critical'),
    ]
    
    INCIDENT_TYPE_CHOICES = [
        ('disruption', 'Class Disruption'),
        ('disrespect', 'Disrespectful Behavior'),
        ('tardiness', 'Tardiness'),
        ('incomplete_work', 'Incomplete Work'),
        ('cheating', 'Academic Dishonesty'),
        ('bullying', 'Bullying'),
        ('other', 'Other'),
    ]
    
    SOURCE_CHOICES = [
        ('manual', 'Manual Entry'),
        ('ai_lecture', 'AI - Lecture Analysis'),
        ('ai_behavior', 'AI - Behavior Detection'),
        ('system', 'System Generated'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='behavior_incidents')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='behavior_incidents')
    reported_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reported_incidents',
        help_text='Teacher/Admin who reported (null if AI-generated)'
    )
    
    # Link to lecture if incident occurred during recorded lecture
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='behavior_incidents',
        help_text='Lecture where incident occurred (if applicable)'
    )
    
    incident_type = models.CharField(max_length=20, choices=INCIDENT_TYPE_CHOICES, db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='minor', db_index=True)
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    incident_date = models.DateTimeField(default=timezone.now, db_index=True)
    
    # AI-related fields
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default='manual',
        db_index=True,
        help_text='How this incident was created'
    )
    is_ai_generated = models.BooleanField(default=False, db_index=True)
    ai_confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='AI confidence (0-100) if AI-generated'
    )
    ai_transcript_snippet = models.TextField(
        blank=True,
        help_text='Transcript excerpt that triggered AI detection'
    )
    lecture_timestamp = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Timestamp in lecture (seconds) where incident occurred'
    )
    
    # Notification tracking
    student_notified = models.BooleanField(default=False)
    student_notified_at = models.DateTimeField(null=True, blank=True)
    parent_notified = models.BooleanField(default=False)
    parent_notified_at = models.DateTimeField(null=True, blank=True)
    
    # Follow-up
    requires_followup = models.BooleanField(default=False)
    followup_notes = models.TextField(blank=True)
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_incidents'
    )
    
    class Meta:
        verbose_name = 'Behavior Incident'
        verbose_name_plural = 'Behavior Incidents'
        ordering = ['-incident_date']
        indexes = [
            models.Index(fields=['student', '-incident_date']),
            models.Index(fields=['classroom', '-incident_date']),
            models.Index(fields=['is_ai_generated', '-incident_date']),
            models.Index(fields=['severity', '-incident_date']),
        ]
    
    def __str__(self):
        source_label = "AI" if self.is_ai_generated else "Manual"
        return f"[{source_label}] {self.student.get_full_name()} - {self.title}"


class BehaviorNote(TimeStampedModel, SoftDeleteModel):
    """
    Positive or negative behavioral notes for students
    
    Can be created:
    1. Manually by teachers
    2. Automatically by AI (future) from lecture analysis
    """
    NOTE_TYPE_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]
    
    SOURCE_CHOICES = [
        ('manual', 'Manual Entry'),
        ('ai_lecture', 'AI - Lecture Analysis'),
        ('system', 'System Generated'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='behavior_notes')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='behavior_notes')
    teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_behavior_notes'
    )
    
    # Link to lecture if note is from recorded lecture
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='behavior_notes'
    )
    
    note_type = models.CharField(max_length=20, choices=NOTE_TYPE_CHOICES, default='neutral', db_index=True)
    note = models.TextField()
    date = models.DateField(default=timezone.now, db_index=True)
    
    # AI-related fields
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='manual')
    is_ai_generated = models.BooleanField(default=False)
    ai_transcript_snippet = models.TextField(blank=True)
    lecture_timestamp = models.PositiveIntegerField(null=True, blank=True)
    
    # Visibility
    visible_to_student = models.BooleanField(default=True)
    visible_to_parent = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Behavior Note'
        verbose_name_plural = 'Behavior Notes'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['student', '-date']),
            models.Index(fields=['note_type', '-date']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.note_type} ({self.date})"


class BehaviorStatistics(TimeStampedModel):
    """
    Cached behavior statistics for students
    Updated when incidents/notes are created
    """
    student = models.OneToOneField(User, on_delete=models.CASCADE, related_name='behavior_stats')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='student_behavior_stats')
    
    # Incident counts by severity
    minor_incidents = models.PositiveIntegerField(default=0)
    moderate_incidents = models.PositiveIntegerField(default=0)
    serious_incidents = models.PositiveIntegerField(default=0)
    critical_incidents = models.PositiveIntegerField(default=0)
    total_incidents = models.PositiveIntegerField(default=0)
    
    # AI-generated vs manual
    ai_generated_incidents = models.PositiveIntegerField(default=0)
    manual_incidents = models.PositiveIntegerField(default=0)
    
    # Note counts
    positive_notes = models.PositiveIntegerField(default=0)
    neutral_notes = models.PositiveIntegerField(default=0)
    negative_notes = models.PositiveIntegerField(default=0)
    total_notes = models.PositiveIntegerField(default=0)
    
    # Behavior score (calculated)
    behavior_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100,
        help_text='100 = perfect, decreases with incidents'
    )
    
    last_incident_date = models.DateTimeField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Behavior Statistics'
        verbose_name_plural = 'Behavior Statistics'
        unique_together = ['student', 'classroom']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - Score: {self.behavior_score}"


class PendingBehaviorDetection(TimeStampedModel):
    """
    AI-detected behavior events pending teacher review
    
    Workflow:
    1. AI detects behavior from lecture transcript
    2. Creates PendingBehaviorDetection (status=PENDING)
    3. Teacher reviews and can APPROVE, MODIFY, or REJECT
    4. If approved/modified, creates BehaviorIncident or BehaviorNote
    5. Sends notifications if requested
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved & Processed'),
        ('rejected', 'Rejected'),
        ('modified', 'Modified & Processed'),
    ]
    
    # Detection details
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='pending_behavior_detections'
    )
    student_name = models.CharField(
        max_length=200,
        help_text='Student name extracted from transcript'
    )
    
    # Detected behavior
    behavior_type = models.CharField(max_length=20)  # Will map to incident_type
    severity = models.CharField(max_length=20)
    description = models.TextField(help_text='AI-generated neutral description')
    original_statement = models.TextField(help_text='Exact quote from lecture transcript')
    
    # AI metadata
    is_positive = models.BooleanField(default=False)
    ai_confidence = models.CharField(max_length=20, default='MEDIUM')  # LOW, MEDIUM, HIGH
    ai_confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=75.0,
        help_text='AI confidence (0-100)'
    )
    detection_sensitivity = models.CharField(
        max_length=20,
        default='MEDIUM',
        help_text='Sensitivity level used for detection'
    )
    
    # Teacher review
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_behavior_detections'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    teacher_notes = models.TextField(
        blank=True,
        help_text='Teacher comments or modifications'
    )
    
    # Modified values (if teacher modifies before approving)
    modified_description = models.TextField(blank=True)
    modified_severity = models.CharField(max_length=20, blank=True)
    modified_behavior_type = models.CharField(max_length=20, blank=True)
    
    # Notification tracking
    student_notified = models.BooleanField(default=False)
    parent_notified = models.BooleanField(default=False)
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Link to created incident/note (if approved)
    created_incident = models.ForeignKey(
        BehaviorIncident,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_detection'
    )
    created_note = models.ForeignKey(
        BehaviorNote,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_detection'
    )
    
    class Meta:
        verbose_name = 'Pending Behavior Detection'
        verbose_name_plural = 'Pending Behavior Detections'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['lecture', '-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['is_positive', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.student_name} - {self.behavior_type} ({self.status})"
