# Model Definitions Reference

This document contains all model definitions from your specification.
Copy these into the respective app's `models.py` file.

## apps/notes/models.py

```python
from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.lectures.models import Lecture
from apps.schools.models import Classroom


class NoteTemplate(TimeStampedModel):
    """Predefined note templates for teachers"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content = models.TextField(help_text='Template content in HTML/Markdown')
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='note_templates')
    
    class Meta:
        verbose_name = 'Note Template'
        verbose_name_plural = 'Note Templates'
    
    def __str__(self):
        return self.name


class LectureNote(TimeStampedModel, SoftDeleteModel):
    """Teacher-created lecture notes"""
    lecture = models.OneToOneField(Lecture, on_delete=models.CASCADE, related_name='notes')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='lecture_notes')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_notes')
    
    title = models.CharField(max_length=255)
    content = models.TextField(help_text='Rich text content')
    summary = models.TextField(blank=True, max_length=500)
    
    template = models.ForeignKey(NoteTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_auto_generated = models.BooleanField(default=False)
    auto_generated_at = models.DateTimeField(null=True, blank=True)
    
    is_published = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    pdf_file = models.FileField(upload_to='notes/pdfs/%Y/%m/%d/', null=True, blank=True)
    pdf_generated_at = models.DateTimeField(null=True, blank=True)
    
    view_count = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    bookmark_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Lecture Note'
        verbose_name_plural = 'Lecture Notes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['classroom', '-published_at']),
            models.Index(fields=['teacher', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.lecture.title}"


class StudentNoteBookmark(TimeStampedModel):
    """Students bookmarking lecture notes"""
    note = models.ForeignKey(LectureNote, on_delete=models.CASCADE, related_name='bookmarks')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarked_notes')
    
    class Meta:
        unique_together = ['note', 'student']
        verbose_name = 'Student Note Bookmark'
        verbose_name_plural = 'Student Note Bookmarks'
    
    def __str__(self):
        return f"{self.student.get_full_name()} bookmarked {self.note.title}"


class StudentNoteView(TimeStampedModel):
    """Track when students view notes"""
    note = models.ForeignKey(LectureNote, on_delete=models.CASCADE, related_name='student_views')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='note_views')
    viewed_at = models.DateTimeField(auto_now_add=True)
    time_spent = models.PositiveIntegerField(default=0, help_text='Time spent reading in seconds')
    
    class Meta:
        unique_together = ['note', 'student']
        verbose_name = 'Student Note View'
        verbose_name_plural = 'Student Note Views'
    
    def __str__(self):
        return f"{self.student.get_full_name()} viewed {self.note.title}"


class StudentPersonalNote(TimeStampedModel, SoftDeleteModel):
    """Students' personal notes on lecture notes"""
    lecture_note = models.ForeignKey(LectureNote, on_delete=models.CASCADE, related_name='student_notes')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='personal_notes')
    content = models.TextField()
    highlighted_text = models.TextField(blank=True)
    position = models.JSONField(null=True, blank=True, help_text='Position in the document')
    
    class Meta:
        verbose_name = 'Student Personal Note'
        verbose_name_plural = 'Student Personal Notes'
    
    def __str__(self):
        return f"{self.student.get_full_name()}'s note on {self.lecture_note.title}"
```

## apps/assignments/models.py

```python
from django.db import models
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
```

## apps/assessments/models.py

```python
from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.schools.models import Classroom


class Quiz(TimeStampedModel, SoftDeleteModel):
    """Quiz/Test model"""
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='quizzes')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_quizzes')
    
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    chapter = models.CharField(max_length=255, blank=True)
    
    total_points = models.PositiveIntegerField(default=100)
    time_limit = models.PositiveIntegerField(help_text='Time limit in minutes', null=True, blank=True)
    passing_percentage = models.PositiveIntegerField(default=50)
    
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ],
        default='medium'
    )
    
    is_published = models.BooleanField(default=False, db_index=True)
    available_from = models.DateTimeField(null=True, blank=True)
    available_until = models.DateTimeField(null=True, blank=True)
    
    allow_retake = models.BooleanField(default=True)
    max_attempts = models.PositiveIntegerField(default=3)
    show_correct_answers = models.BooleanField(default=True)
    shuffle_questions = models.BooleanField(default=False)
    shuffle_options = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['classroom', '-created_at']),
            models.Index(fields=['is_published', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.classroom}"


class Question(TimeStampedModel, SoftDeleteModel):
    """Quiz question model"""
    QUESTION_TYPES = [
        ('mcq', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('fill_blank', 'Fill in the Blank'),
        ('short_answer', 'Short Answer'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    question_text = models.TextField()
    explanation = models.TextField(blank=True, help_text='Explanation shown after answering')
    
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    
    correct_answer_text = models.TextField(blank=True)
    is_case_sensitive = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.quiz.title} - Q{self.order}"


class QuestionOption(TimeStampedModel):
    """Options for MCQ questions"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Question Option'
        verbose_name_plural = 'Question Options'
        ordering = ['order']
    
    def __str__(self):
        return f"{self.question} - Option {self.order}"


class QuizAttempt(TimeStampedModel):
    """Student quiz attempt"""
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    
    attempt_number = models.PositiveIntegerField(default=1)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress', db_index=True)
    
    total_points = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    points_earned = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    time_taken = models.PositiveIntegerField(default=0, help_text='Time taken in seconds')
    
    class Meta:
        verbose_name = 'Quiz Attempt'
        verbose_name_plural = 'Quiz Attempts'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['quiz', 'student', '-started_at']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.quiz.title} (Attempt #{self.attempt_number})"


class QuizAnswer(TimeStampedModel):
    """Student answers to questions"""
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='student_answers')
    
    selected_option = models.ForeignKey(
        QuestionOption,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='selected_by'
    )
    
    answer_text = models.TextField(blank=True)
    
    is_correct = models.BooleanField(default=False)
    points_earned = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    answered_at = models.DateTimeField(auto_now_add=True)
    time_taken = models.PositiveIntegerField(default=0, help_text='Time taken in seconds')
    
    class Meta:
        unique_together = ['attempt', 'question']
        verbose_name = 'Quiz Answer'
        verbose_name_plural = 'Quiz Answers'
    
    def __str__(self):
        return f"{self.attempt} - Q{self.question.order}"
```

Continue in next message...
