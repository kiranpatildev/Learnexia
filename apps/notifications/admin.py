"""
Admin configuration for notifications app
"""

from django.contrib import admin
from .models import Notification, NotificationPreference, NotificationTemplate, NotificationBatch


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'recipient', 'notification_type', 'title', 'priority',
        'is_read', 'sent_at'
    ]
    list_filter = ['notification_type', 'priority', 'is_read', 'sent_at']
    search_fields = ['recipient__first_name', 'recipient__last_name', 'title', 'message']
    readonly_fields = ['sent_at', 'read_at']
    
    fieldsets = (
        ('Recipient', {
            'fields': ('recipient',)
        }),
        ('Notification Details', {
            'fields': ('notification_type', 'priority', 'title', 'message')
        }),
        ('Reference', {
            'fields': ('reference_type', 'reference_id', 'action_url')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at', 'sent_at')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'enable_in_app', 'enable_email', 'email_frequency',
        'enable_push', 'enable_quiet_hours'
    ]
    list_filter = ['enable_in_app', 'enable_email', 'email_frequency', 'enable_push']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Delivery Methods', {
            'fields': ('enable_in_app', 'enable_email', 'email_frequency', 'enable_push', 'enable_sms')
        }),
        ('Notification Types', {
            'fields': (
                'notify_assignments', 'notify_quizzes', 'notify_messages',
                'notify_announcements', 'notify_attendance', 'notify_behavior',
                'notify_grades', 'notify_gamification', 'notify_resources'
            )
        }),
        ('Quiet Hours', {
            'fields': ('enable_quiet_hours', 'quiet_hours_start', 'quiet_hours_end')
        }),
    )


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'notification_type', 'priority', 'is_active']
    list_filter = ['notification_type', 'priority', 'is_active']
    search_fields = ['name', 'title_template', 'message_template']
    
    fieldsets = (
        ('Template Info', {
            'fields': ('name', 'notification_type', 'priority', 'is_active')
        }),
        ('In-App Template', {
            'fields': ('title_template', 'message_template')
        }),
        ('Email Template', {
            'fields': ('email_subject_template', 'email_body_template'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationBatch)
class NotificationBatchAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'notification_type', 'status',
        'recipient_count', 'sent_count', 'created_by', 'sent_at'
    ]
    list_filter = ['status', 'notification_type', 'sent_at']
    search_fields = ['name', 'title', 'message']
    readonly_fields = ['created_at', 'sent_at', 'recipient_count', 'sent_count']
    
    fieldsets = (
        ('Batch Info', {
            'fields': ('name', 'notification_type', 'created_by')
        }),
        ('Content', {
            'fields': ('title', 'message')
        }),
        ('Status', {
            'fields': ('status', 'recipient_count', 'sent_count')
        }),
        ('Scheduling', {
            'fields': ('scheduled_for', 'sent_at')
        }),
    )
