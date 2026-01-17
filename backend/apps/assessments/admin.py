"""
Admin configuration for assessments app
"""

from django.contrib import admin
from .models import Quiz, Question, QuestionOption, QuizAttempt, QuizAnswer


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'classroom', 'teacher', 'is_published', 'difficulty_level', 'is_ai_generated']
    list_filter = ['is_published', 'difficulty_level', 'is_ai_generated']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'ai_generated_at']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'question_type', 'order', 'points', 'is_ai_generated']
    list_filter = ['question_type', 'is_ai_generated']
    search_fields = ['question_text']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'student', 'attempt_number', 'status', 'percentage', 'is_ai_graded']
    list_filter = ['status', 'is_ai_graded']
    readonly_fields = ['created_at', 'started_at', 'submitted_at']


admin.site.register(QuestionOption)
admin.site.register(QuizAnswer)
