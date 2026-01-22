"""
Custom permissions for games app
"""

from rest_framework import permissions
from .models import LectureGame, GameAttempt


class IsTeacher(permissions.BasePermission):
    """
    Permission class to check if user is a teacher
    """
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is a teacher"""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'teacher'
        )


class IsGamePublished(permissions.BasePermission):
    """
    Permission class to check if game is published
    Students can only access published games
    Teachers can access all games
    """
    
    def has_object_permission(self, request, view, obj):
        """Check if game is published or user is teacher"""
        if not isinstance(obj, LectureGame):
            return False
        
        # Teachers can access all games
        if request.user.role == 'teacher':
            return True
        
        # Students can only access published games
        return obj.is_published


class IsOwnAttempt(permissions.BasePermission):
    """
    Permission class to check if attempt belongs to user
    Students can only access their own attempts
    Teachers can access all attempts
    """
    
    def has_object_permission(self, request, view, obj):
        """Check if attempt belongs to user or user is teacher"""
        if not isinstance(obj, GameAttempt):
            return False
        
        # Teachers can access all attempts
        if request.user.role == 'teacher':
            return True
        
        # Students can only access their own attempts
        return obj.student == request.user


class CanGenerateGames(permissions.BasePermission):
    """
    Permission class to check if user can generate games
    Only teachers can generate games
    """
    
    message = 'Only teachers can generate games'
    
    def has_permission(self, request, view):
        """Check if user is teacher"""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'teacher'
        )


class CanPublishGames(permissions.BasePermission):
    """
    Permission class to check if user can publish games
    Only teachers who created the game or are assigned to the classroom can publish
    """
    
    message = 'You do not have permission to publish this game'
    
    def has_object_permission(self, request, view, obj):
        """Check if user can publish the game"""
        if not isinstance(obj, LectureGame):
            return False
        
        # Must be a teacher
        if request.user.role != 'teacher':
            return False
        
        # Teacher who generated the game can publish
        if obj.generated_by == request.user:
            return True
        
        # Teacher assigned to the classroom can publish
        if obj.classroom:
            return obj.classroom.teacher == request.user
        
        return False
