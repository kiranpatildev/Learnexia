"""
Admin configuration for schools app
"""

from django.contrib import admin
from .models import School, AcademicYear, Subject, Classroom, ClassroomEnrollment


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    """
    School admin
    """
    list_display = ['name', 'code', 'city', 'state', 'principal_name', 'established_year']
    list_filter = ['state', 'city', 'established_year']
    search_fields = ['name', 'code', 'city', 'principal_name']
    readonly_fields = ['code', 'created_at', 'updated_at']


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    """
    Academic year admin
    """
    list_display = ['school', 'name', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current', 'school']
    search_fields = ['name', 'school__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    """
    Subject admin
    """
    list_display = ['name', 'code', 'grade', 'color']
    list_filter = ['grade']
    search_fields = ['name', 'code']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    """
    Classroom admin
    """
    list_display = ['__str__', 'school', 'teacher', 'academic_year', 'class_code', 'max_students']
    list_filter = ['school', 'academic_year', 'grade', 'subject']
    search_fields = ['section', 'class_code', 'teacher__email']
    readonly_fields = ['class_code', 'created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'school', 'academic_year', 'subject', 'teacher'
        )


@admin.register(ClassroomEnrollment)
class ClassroomEnrollmentAdmin(admin.ModelAdmin):
    """
    Classroom enrollment admin
    """
    list_display = ['student', 'classroom', 'enrollment_date', 'is_active']
    list_filter = ['is_active', 'enrollment_date', 'classroom__school']
    search_fields = ['student__email', 'student__first_name', 'student__last_name']
    readonly_fields = ['enrollment_date', 'created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'classroom')
