"""
Admin configuration for resources app
"""

from django.contrib import admin
from .models import Resource, ResourceCategory, ResourceDownload


@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'grade_level', 'parent_category', 'color']
    list_filter = ['subject', 'grade_level']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'resource_type', 'category', 'uploaded_by',
        'access_level', 'download_count', 'created_at'
    ]
    list_filter = ['resource_type', 'access_level', 'category', 'subject', 'grade_level']
    search_fields = ['title', 'description', 'tags']
    readonly_fields = ['created_at', 'updated_at', 'download_count', 'view_count', 'file_size', 'file_type']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'resource_type')
        }),
        ('File/Link', {
            'fields': ('file', 'external_link', 'file_type', 'file_size', 'thumbnail')
        }),
        ('Organization', {
            'fields': ('category', 'uploaded_by', 'classroom', 'subject', 'grade_level', 'tags')
        }),
        ('Access Control', {
            'fields': ('access_level',)
        }),
        ('Statistics', {
            'fields': ('download_count', 'view_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ResourceDownload)
class ResourceDownloadAdmin(admin.ModelAdmin):
    list_display = ['resource', 'user', 'downloaded_at', 'ip_address']
    list_filter = ['downloaded_at']
    search_fields = ['resource__title', 'user__email']
    readonly_fields = ['downloaded_at']
