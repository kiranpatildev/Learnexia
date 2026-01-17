"""
Admin configuration for attendance app
"""

from django.contrib import admin
from .models import AttendanceSession, AttendanceRecord, AttendanceStatistics


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ['classroom', 'date', 'session_type', 'teacher', 'is_finalized']
    list_filter = ['date', 'session_type', 'is_finalized']
    search_fields = ['classroom__grade', 'classroom__section']
    readonly_fields = ['created_at', 'updated_at', 'finalized_at']


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['session', 'student', 'status', 'arrival_time', 'parent_notified']
    list_filter = ['status', 'parent_notified']
    search_fields = ['student__email', 'student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at', 'parent_notified_at']


@admin.register(AttendanceStatistics)
class AttendanceStatisticsAdmin(admin.ModelAdmin):
    list_display = ['student', 'classroom', 'attendance_percentage', 'total_sessions', 'present_count', 'absent_count']
    list_filter = ['classroom']
    search_fields = ['student__email', 'student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at', 'last_updated']
