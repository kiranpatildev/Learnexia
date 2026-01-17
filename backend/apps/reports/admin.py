"""
Admin configuration for reports app
"""

from django.contrib import admin
from .models import ReportTemplate, Report, ReportSchedule, DataExport


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'report_type', 'is_active', 'is_default', 'created_by']
    list_filter = ['report_type', 'is_active', 'is_default']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Template Info', {
            'fields': ('name', 'description', 'report_type', 'created_by')
        }),
        ('Configuration', {
            'fields': ('sections', 'layout_config')
        }),
        ('Settings', {
            'fields': ('is_active', 'is_default')
        }),
    )


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = [
        'report_type', 'student', 'classroom', 'file_format',
        'status', 'generated_by', 'generated_at'
    ]
    list_filter = ['report_type', 'file_format', 'status', 'is_scheduled', 'generated_at']
    search_fields = ['student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at', 'generated_at', 'file_size']
    filter_horizontal = ['shared_with']
    
    fieldsets = (
        ('Report Info', {
            'fields': ('report_type', 'template', 'file_format')
        }),
        ('Target', {
            'fields': ('student', 'classroom')
        }),
        ('Parameters', {
            'fields': ('parameters',)
        }),
        ('File', {
            'fields': ('file', 'file_size')
        }),
        ('Status', {
            'fields': ('status', 'error_message')
        }),
        ('Generation', {
            'fields': ('generated_by', 'generated_at')
        }),
        ('Scheduling', {
            'fields': ('is_scheduled', 'schedule'),
            'classes': ('collapse',)
        }),
        ('Sharing', {
            'fields': ('is_shared', 'shared_with'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ReportSchedule)
class ReportScheduleAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'template', 'frequency', 'classroom',
        'next_run_date', 'is_active', 'created_by'
    ]
    list_filter = ['frequency', 'is_active', 'next_run_date']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at', 'last_run_date']
    
    fieldsets = (
        ('Schedule Info', {
            'fields': ('name', 'template', 'classroom', 'created_by')
        }),
        ('Schedule', {
            'fields': ('frequency', 'next_run_date', 'last_run_date')
        }),
        ('Recipients', {
            'fields': ('recipients',)
        }),
        ('Settings', {
            'fields': ('is_active',)
        }),
    )


@admin.register(DataExport)
class DataExportAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'export_type', 'file_format',
        'row_count', 'exported_by', 'exported_at'
    ]
    list_filter = ['export_type', 'file_format', 'exported_at']
    search_fields = ['name']
    readonly_fields = ['exported_at', 'file_size', 'row_count']
    
    fieldsets = (
        ('Export Info', {
            'fields': ('name', 'export_type', 'file_format')
        }),
        ('Filters', {
            'fields': ('filters',)
        }),
        ('File', {
            'fields': ('file', 'file_size', 'row_count')
        }),
        ('Export Info', {
            'fields': ('exported_by', 'exported_at')
        }),
    )
