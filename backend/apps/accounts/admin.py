"""
Admin configuration for accounts app
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, StudentProfile, TeacherProfile, ParentProfile, ParentStudentRelationship


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom user admin
    """
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active', 'is_verified', 'created_at']
    list_filter = ['role', 'is_active', 'is_verified', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'avatar')}),
        ('Role & Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_verified')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'role', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    """
    Student profile admin
    """
    list_display = ['user', 'grade', 'total_xp', 'current_level', 'current_streak']
    list_filter = ['grade', 'current_level']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['total_xp', 'current_level', 'current_streak', 'longest_streak']


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    """
    Teacher profile admin
    """
    list_display = ['user', 'employee_id', 'specialization', 'years_of_experience', 'date_of_joining']
    list_filter = ['specialization', 'date_of_joining']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'employee_id']


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    """
    Parent profile admin
    """
    list_display = ['user', 'occupation']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']


@admin.register(ParentStudentRelationship)
class ParentStudentRelationshipAdmin(admin.ModelAdmin):
    """
    Parent-student relationship admin
    """
    list_display = ['parent', 'student', 'relationship_type', 'is_primary']
    list_filter = ['relationship_type', 'is_primary']
    search_fields = ['parent__email', 'student__email']
