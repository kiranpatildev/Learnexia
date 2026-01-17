"""
Admin configuration for behavior app
"""

from django.contrib import admin
from .models import BehaviorIncident, BehaviorNote, BehaviorStatistics


@admin.register(BehaviorIncident)
class BehaviorIncidentAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'incident_type', 'severity', 'classroom',
        'is_ai_generated', 'source', 'incident_date', 'resolved'
    ]
    list_filter = [
        'severity', 'incident_type', 'is_ai_generated', 'source',
        'resolved', 'incident_date'
    ]
    search_fields = [
        'student__first_name', 'student__last_name',
        'title', 'description', 'ai_transcript_snippet'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'student_notified_at',
        'parent_notified_at', 'resolved_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('student', 'classroom', 'reported_by', 'lecture')
        }),
        ('Incident Details', {
            'fields': ('incident_type', 'severity', 'title', 'description', 'incident_date')
        }),
        ('AI Detection', {
            'fields': (
                'source', 'is_ai_generated', 'ai_confidence_score',
                'ai_transcript_snippet', 'lecture_timestamp'
            ),
            'classes': ('collapse',)
        }),
        ('Notifications', {
            'fields': (
                'student_notified', 'student_notified_at',
                'parent_notified', 'parent_notified_at'
            ),
            'classes': ('collapse',)
        }),
        ('Follow-up', {
            'fields': (
                'requires_followup', 'followup_notes',
                'resolved', 'resolved_at', 'resolved_by'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BehaviorNote)
class BehaviorNoteAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'note_type', 'classroom', 'teacher',
        'is_ai_generated', 'date', 'visible_to_student', 'visible_to_parent'
    ]
    list_filter = ['note_type', 'is_ai_generated', 'source', 'date']
    search_fields = [
        'student__first_name', 'student__last_name',
        'note', 'ai_transcript_snippet'
    ]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('student', 'classroom', 'teacher', 'lecture')
        }),
        ('Note Details', {
            'fields': ('note_type', 'note', 'date')
        }),
        ('AI Detection', {
            'fields': (
                'source', 'is_ai_generated',
                'ai_transcript_snippet', 'lecture_timestamp'
            ),
            'classes': ('collapse',)
        }),
        ('Visibility', {
            'fields': ('visible_to_student', 'visible_to_parent')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BehaviorStatistics)
class BehaviorStatisticsAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'classroom', 'behavior_score',
        'total_incidents', 'total_notes', 'last_incident_date'
    ]
    list_filter = ['classroom']
    search_fields = ['student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at', 'last_updated']
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student', 'classroom')
        }),
        ('Incident Statistics', {
            'fields': (
                'minor_incidents', 'moderate_incidents',
                'serious_incidents', 'critical_incidents',
                'total_incidents', 'ai_generated_incidents', 'manual_incidents'
            )
        }),
        ('Note Statistics', {
            'fields': (
                'positive_notes', 'neutral_notes',
                'negative_notes', 'total_notes'
            )
        }),
        ('Behavior Score', {
            'fields': ('behavior_score', 'last_incident_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_updated'),
            'classes': ('collapse',)
        }),
    )
