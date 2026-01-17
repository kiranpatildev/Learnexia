"""
Models for flashcards app
"""

from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.lectures.models import Lecture
from apps.schools.models import Classroom


class FlashcardSet(TimeStampedModel, SoftDeleteModel):
    """Teacher-created flashcard sets for lectures"""
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='flashcard_sets')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='flashcard_sets')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_flashcard_sets')
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    is_published = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    # AI Generation
    is_ai_generated = models.BooleanField(default=False)
    ai_generated_at = models.DateTimeField(null=True, blank=True)
    
    view_count = models.PositiveIntegerField(default=0)
    study_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Flashcard Set'
        verbose_name_plural = 'Flashcard Sets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['classroom', '-published_at']),
            models.Index(fields=['teacher', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.lecture.title}"


class Flashcard(TimeStampedModel):
    """Individual flashcards in a set"""
    flashcard_set = models.ForeignKey(FlashcardSet, on_delete=models.CASCADE, related_name='flashcards')
    
    question = models.TextField(help_text='Front of the card')
    answer = models.TextField(help_text='Back of the card')
    hint = models.TextField(blank=True)
    
    order = models.PositiveIntegerField(default=0)
    
    # AI Generation
    is_ai_generated = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Flashcard'
        verbose_name_plural = 'Flashcards'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.flashcard_set.title} - Card {self.order}"


class StudentFlashcardProgress(TimeStampedModel):
    """Track student progress with flashcards"""
    CONFIDENCE_LEVELS = [
        ('not_studied', 'Not Studied'),
        ('hard', 'Hard'),
        ('medium', 'Medium'),
        ('easy', 'Easy'),
        ('mastered', 'Mastered'),
    ]
    
    flashcard = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name='student_progress')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flashcard_progress')
    
    confidence_level = models.CharField(max_length=20, choices=CONFIDENCE_LEVELS, default='not_studied')
    times_studied = models.PositiveIntegerField(default=0)
    times_correct = models.PositiveIntegerField(default=0)
    times_incorrect = models.PositiveIntegerField(default=0)
    
    last_studied_at = models.DateTimeField(null=True, blank=True)
    next_review_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['flashcard', 'student']
        verbose_name = 'Student Flashcard Progress'
        verbose_name_plural = 'Student Flashcard Progress'
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.flashcard}"


class StudentFlashcardSetView(TimeStampedModel):
    """Track when students view flashcard sets"""
    flashcard_set = models.ForeignKey(FlashcardSet, on_delete=models.CASCADE, related_name='student_views')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flashcard_set_views')
    
    viewed_at = models.DateTimeField(auto_now_add=True)
    time_spent = models.PositiveIntegerField(default=0, help_text='Time spent studying in seconds')
    cards_studied = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ['flashcard_set', 'student']
        verbose_name = 'Student Flashcard Set View'
        verbose_name_plural = 'Student Flashcard Set Views'
    
    def __str__(self):
        return f"{self.student.get_full_name()} viewed {self.flashcard_set.title}"
