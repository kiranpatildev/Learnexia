"""
Admin configuration for communication app
"""

from django.contrib import admin
from .models import Conversation, Message, MessageAttachment, MessageRead, Announcement, AnnouncementRead


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'conversation_type', 'classroom', 'created_by', 'last_message_at']
    list_filter = ['conversation_type', 'created_at']
    search_fields = ['title']
    readonly_fields = ['created_at', 'updated_at', 'last_message_at']
    filter_horizontal = ['participants']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'conversation', 'message_text_preview', 'created_at', 'is_edited']
    list_filter = ['is_edited', 'created_at']
    search_fields = ['message_text', 'sender__email']
    readonly_fields = ['created_at', 'updated_at', 'edited_at']
    
    def message_text_preview(self, obj):
        return obj.message_text[:50]
    message_text_preview.short_description = 'Message Preview'


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'message', 'uploaded_by', 'file_size', 'download_count']
    list_filter = ['file_type', 'created_at']
    search_fields = ['file_name']
    readonly_fields = ['created_at', 'file_type', 'file_size']


@admin.register(MessageRead)
class MessageReadAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'read_at']
    list_filter = ['read_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'read_at']


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'sent_by', 'target_role', 'classroom',
        'priority', 'is_draft', 'sent_at', 'read_count', 'total_recipients'
    ]
    list_filter = ['priority', 'target_role', 'is_draft', 'requires_acknowledgment', 'sent_at']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at', 'updated_at', 'sent_at', 'total_recipients', 'read_count']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'content')
        }),
        ('Sender & Targeting', {
            'fields': ('sent_by', 'target_role', 'classroom')
        }),
        ('Settings', {
            'fields': ('priority', 'requires_acknowledgment', 'is_draft', 'scheduled_for')
        }),
        ('Statistics', {
            'fields': ('sent_at', 'total_recipients', 'read_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AnnouncementRead)
class AnnouncementReadAdmin(admin.ModelAdmin):
    list_display = ['user', 'announcement', 'read_at', 'acknowledged_at']
    list_filter = ['read_at', 'acknowledged_at']
    search_fields = ['user__email', 'announcement__title']
    readonly_fields = ['created_at', 'read_at', 'acknowledged_at']
