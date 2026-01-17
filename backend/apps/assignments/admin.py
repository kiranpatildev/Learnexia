"""
Admin configuration for assignments app
"""

from django.contrib import admin
from .models import Assignment, AssignmentAttachment, AssignmentSubmission, SubmissionFile


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'classroom', 'teacher', 'due_date', 'total_points', 'is_ai_generated']
    list_filter = ['classroom', 'is_ai_generated', 'due_date']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'assigned_date', 'ai_generated_at']


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ['assignment', 'student', 'status', 'points_earned', 'submitted_at', 'is_late', 'is_ai_graded']
    list_filter = ['status', 'is_late', 'is_ai_graded']
    search_fields = ['assignment__title', 'student__email']
    readonly_fields = ['created_at', 'updated_at', 'submitted_at', 'graded_at']


admin.site.register(AssignmentAttachment)
admin.site.register(SubmissionFile)
