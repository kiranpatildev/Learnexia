"""
Admin configuration for assignments app
"""

from django.contrib import admin
from .models import (
    Assignment,
    AssignmentQuestion,
    RubricCriterion,
    AssignmentSubmission,
    AssignmentGrade,
    RubricScore,
    GradingAuditLog
)


class AssignmentQuestionInline(admin.TabularInline):
    model = AssignmentQuestion
    extra = 1
    fields = ['question_number', 'question_text', 'marks', 'expected_answer_keywords']


class RubricCriterionInline(admin.TabularInline):
    model = RubricCriterion
    extra = 1
    fields = ['criterion_name', 'weight_percentage', 'order']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'classroom',
        'created_by',
        'submission_type',
        'grading_method',
        'due_date',
        'is_published',
        'is_ai_generated'
    ]
    list_filter = [
        'submission_type',
        'grading_method',
        'grading_type',
        'difficulty',
        'is_published',
        'is_ai_generated',
        'due_date'
    ]
    search_fields = ['title', 'description', 'classroom__name']
    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
        'ai_generated_at',
        'ai_generation_cost',
        'generation_tokens'
    ]
    inlines = [AssignmentQuestionInline, RubricCriterionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'instructions', 'classroom', 'created_by')
        }),
        ('Assignment Configuration', {
            'fields': (
                'submission_type',
                'assignment_format',
                'difficulty',
                'total_marks',
                'pass_marks'
            )
        }),
        ('Grading Settings', {
            'fields': ('grading_method', 'grading_type')
        }),
        ('Deadline', {
            'fields': ('due_date', 'allow_late_submission', 'late_penalty_per_day')
        }),
        ('AI Generation', {
            'fields': (
                'is_ai_generated',
                'source_lecture',
                'ai_generation_prompt',
                'ai_generation_cost',
                'generation_tokens',
                'ai_generated_at'
            ),
            'classes': ('collapse',)
        }),
        ('Publishing', {
            'fields': ('is_published', 'published_at')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(AssignmentQuestion)
class AssignmentQuestionAdmin(admin.ModelAdmin):
    list_display = ['assignment', 'question_number', 'question_text_preview', 'marks']
    list_filter = ['assignment']
    search_fields = ['question_text', 'assignment__title']
    
    def question_text_preview(self, obj):
        return obj.question_text[:100] + '...' if len(obj.question_text) > 100 else obj.question_text
    question_text_preview.short_description = 'Question'


@admin.register(RubricCriterion)
class RubricCriterionAdmin(admin.ModelAdmin):
    list_display = ['assignment', 'criterion_name', 'weight_percentage', 'order']
    list_filter = ['assignment']
    search_fields = ['criterion_name', 'assignment__title']


class RubricScoreInline(admin.TabularInline):
    model = RubricScore
    extra = 0
    fields = ['criterion', 'score', 'ai_suggested_score', 'feedback']
    readonly_fields = ['ai_suggested_score']


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = [
        'assignment',
        'student',
        'status',
        'submitted_at',
        'is_late',
        'days_late',
        'file_size_display'
    ]
    list_filter = ['status', 'is_late', 'assignment']
    search_fields = ['assignment__title', 'student__email', 'student__first_name', 'student__last_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'file_size_mb']
    
    fieldsets = (
        ('Submission Info', {
            'fields': ('assignment', 'student', 'status')
        }),
        ('Content', {
            'fields': ('answers', 'uploaded_file', 'file_size_bytes', 'file_size_mb')
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'graded_at', 'is_late', 'days_late')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def file_size_display(self, obj):
        if obj.file_size_bytes:
            return f"{obj.file_size_mb} MB"
        return "-"
    file_size_display.short_description = 'File Size'


@admin.register(AssignmentGrade)
class AssignmentGradeAdmin(admin.ModelAdmin):
    list_display = [
        'submission',
        'score',
        'max_score',
        'percentage',
        'graded_by',
        'is_published',
        'teacher_modified_ai_score'
    ]
    list_filter = ['is_published', 'teacher_modified_ai_score']
    search_fields = [
        'submission__student__email',
        'submission__assignment__title'
    ]
    readonly_fields = [
        'id',
        'percentage',
        'ai_suggested_score',
        'ai_grading_cost',
        'ai_grading_tokens',
        'created_at',
        'updated_at'
    ]
    inlines = [RubricScoreInline]
    
    fieldsets = (
        ('Grading', {
            'fields': ('submission', 'score', 'max_score', 'percentage', 'graded_by')
        }),
        ('Feedback', {
            'fields': ('overall_feedback', 'teacher_comments')
        }),
        ('AI Grading Data', {
            'fields': (
                'ai_suggested_score',
                'ai_feedback',
                'ai_grading_data',
                'ai_grading_cost',
                'ai_grading_tokens',
                'teacher_modified_ai_score'
            ),
            'classes': ('collapse',)
        }),
        ('Publishing', {
            'fields': ('is_published', 'published_at')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(RubricScore)
class RubricScoreAdmin(admin.ModelAdmin):
    list_display = ['grade', 'criterion', 'score', 'ai_suggested_score', 'weighted_score']
    list_filter = ['criterion']
    search_fields = ['grade__submission__student__email', 'criterion__criterion_name']


@admin.register(GradingAuditLog)
class GradingAuditLogAdmin(admin.ModelAdmin):
    list_display = ['grade', 'action', 'performed_by', 'old_score', 'new_score', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['grade__submission__student__email', 'performed_by__email']
    readonly_fields = ['id', 'timestamp']
    
    def has_add_permission(self, request):
        return False  # Audit logs should only be created programmatically
    
    def has_delete_permission(self, request, obj=None):
        return False  # Audit logs should never be deleted
