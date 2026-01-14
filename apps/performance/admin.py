"""
Admin configuration for performance app
"""

from django.contrib import admin
from .models import StudentGrade, SubjectPerformance, ProgressReport, PerformanceMetric


@admin.register(StudentGrade)
class StudentGradeAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'classroom', 'academic_year', 'semester',
        'overall_percentage', 'overall_grade', 'gpa', 'class_rank', 'is_passing', 'is_honor_roll'
    ]
    list_filter = ['academic_year', 'semester', 'is_passing', 'is_honor_roll', 'classroom']
    search_fields = ['student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student', 'classroom', 'academic_year', 'semester')
        }),
        ('Overall Performance', {
            'fields': ('overall_percentage', 'overall_grade', 'gpa')
        }),
        ('Ranking', {
            'fields': ('class_rank', 'total_students')
        }),
        ('Additional Factors', {
            'fields': ('attendance_percentage', 'behavior_score')
        }),
        ('Status', {
            'fields': ('is_passing', 'is_honor_roll')
        }),
        ('Comments', {
            'fields': ('teacher_comments',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SubjectPerformance)
class SubjectPerformanceAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'subject', 'classroom', 'academic_year',
        'overall_score', 'letter_grade', 'trend'
    ]
    list_filter = ['academic_year', 'semester', 'trend', 'subject']
    search_fields = ['student__first_name', 'student__last_name', 'subject__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Student & Subject', {
            'fields': ('student', 'subject', 'classroom', 'academic_year', 'semester')
        }),
        ('Scores', {
            'fields': ('assignment_average', 'quiz_average', 'overall_score', 'letter_grade')
        }),
        ('Statistics', {
            'fields': (
                'total_assignments', 'completed_assignments',
                'total_quizzes', 'completed_quizzes'
            )
        }),
        ('Trends', {
            'fields': ('is_improving', 'trend')
        }),
        ('Feedback', {
            'fields': ('strengths', 'areas_for_improvement')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProgressReport)
class ProgressReportAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'classroom', 'report_type', 'academic_year',
        'report_period', 'generated_at', 'shared_with_parent'
    ]
    list_filter = ['report_type', 'academic_year', 'shared_with_parent', 'generated_at']
    search_fields = ['student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at', 'generated_at', 'parent_viewed_at']
    
    fieldsets = (
        ('Report Information', {
            'fields': ('student', 'classroom', 'report_type', 'academic_year', 'report_period')
        }),
        ('Generation', {
            'fields': ('generated_at', 'generated_by')
        }),
        ('Content', {
            'fields': (
                'overall_performance', 'academic_summary',
                'attendance_summary', 'behavior_summary'
            )
        }),
        ('Recommendations', {
            'fields': ('recommendations', 'next_steps')
        }),
        ('PDF', {
            'fields': ('pdf_file',)
        }),
        ('Sharing', {
            'fields': ('shared_with_parent', 'parent_viewed_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PerformanceMetric)
class PerformanceMetricAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'metric_name', 'metric_type',
        'current_value', 'target_value', 'progress_percentage',
        'is_achieved', 'target_date'
    ]
    list_filter = ['metric_type', 'is_achieved', 'target_date']
    search_fields = ['student__first_name', 'student__last_name', 'metric_name']
    readonly_fields = ['created_at', 'updated_at', 'achieved_at']
    
    fieldsets = (
        ('Metric Information', {
            'fields': ('student', 'metric_name', 'metric_type')
        }),
        ('Values', {
            'fields': ('current_value', 'target_value', 'unit')
        }),
        ('Progress', {
            'fields': ('progress_percentage', 'is_achieved', 'achieved_at')
        }),
        ('Timeline', {
            'fields': ('start_date', 'target_date')
        }),
        ('Tracking', {
            'fields': ('tracked_by', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
