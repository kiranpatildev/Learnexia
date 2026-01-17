"""
Admin configuration for notes app
"""

from django.contrib import admin
from .models import (
    NoteTemplate, LectureNote, StudentNoteBookmark,
    StudentNoteView, StudentPersonalNote
)


@admin.register(NoteTemplate)
class NoteTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'is_default', 'created_at']
    list_filter = ['is_default', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(LectureNote)
class LectureNoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'lecture', 'classroom', 'teacher', 'is_published', 'is_auto_generated', 'view_count', 'bookmark_count']
    list_filter = ['is_published', 'is_auto_generated', 'classroom', 'created_at']
    search_fields = ['title', 'content', 'summary']
    readonly_fields = ['created_at', 'updated_at', 'published_at', 'auto_generated_at', 'pdf_generated_at', 'view_count', 'download_count', 'bookmark_count']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('lecture', 'classroom', 'teacher', 'title', 'summary')
        }),
        ('Content', {
            'fields': ('content', 'template')
        }),
        ('Publishing', {
            'fields': ('is_published', 'published_at')
        }),
        ('AI Generation', {
            'fields': ('is_auto_generated', 'auto_generated_at')
        }),
        ('PDF', {
            'fields': ('pdf_file', 'pdf_generated_at')
        }),
        ('Statistics', {
            'fields': ('view_count', 'download_count', 'bookmark_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(StudentNoteBookmark)
class StudentNoteBookmarkAdmin(admin.ModelAdmin):
    list_display = ['student', 'note', 'created_at']
    list_filter = ['created_at']
    search_fields = ['student__email', 'student__first_name', 'student__last_name', 'note__title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StudentNoteView)
class StudentNoteViewAdmin(admin.ModelAdmin):
    list_display = ['student', 'note', 'viewed_at', 'time_spent']
    list_filter = ['viewed_at']
    search_fields = ['student__email', 'student__first_name', 'student__last_name', 'note__title']
    readonly_fields = ['created_at', 'updated_at', 'viewed_at']


@admin.register(StudentPersonalNote)
class StudentPersonalNoteAdmin(admin.ModelAdmin):
    list_display = ['student', 'lecture_note', 'created_at']
    list_filter = ['created_at']
    search_fields = ['student__email', 'student__first_name', 'student__last_name', 'lecture_note__title', 'content']
    readonly_fields = ['created_at', 'updated_at']
