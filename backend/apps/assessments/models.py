"""
Models for assessments app
"""

from django.db import models
from django.utils import timezone
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
    
    # AI Generation
    is_ai_generated = models.BooleanField(default=False)
    ai_generated_at = models.DateTimeField(null=True, blank=True)
    
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
    
    # AI Generation
    is_ai_generated = models.BooleanField(default=False)
    
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
    
    # AI Grading
    is_ai_graded = models.BooleanField(default=False)
    
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
    
    # AI Grading for text answers
    is_ai_graded = models.BooleanField(default=False)
    ai_feedback = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['attempt', 'question']
        verbose_name = 'Quiz Answer'
        verbose_name_plural = 'Quiz Answers'
    
    def __str__(self):
        return f"{self.attempt} - Q{self.question.order}"
