"""
Views for notifications app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.utils import timezone
from django.db.models import Q

from .models import Notification, NotificationPreference, NotificationTemplate, NotificationBatch
from .serializers import (
    NotificationSerializer, NotificationPreferenceSerializer,
    NotificationTemplateSerializer, NotificationBatchSerializer
)
from apps.core.permissions import IsTeacher


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['notification_type', 'priority', 'is_read']
    ordering = ['-sent_at']
    
    def get_queryset(self):
        """Users see only their own notifications"""
        user = self.request.user
        
        if not user.is_authenticated:
            return Notification.objects.none()
        
        return Notification.objects.filter(recipient=user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
        
        return Response(self.get_serializer(notification).data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        updated = self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'Marked {updated} notifications as read',
            'count': updated
        })
    
    @action(detail=True, methods=['delete'])
    def delete_notification(self, request, pk=None):
        """Delete a notification"""
        notification = self.get_object()
        notification.delete()
        
        return Response({'message': 'Notification deleted'}, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Clear all notifications"""
        deleted = self.get_queryset().delete()
        
        return Response({
            'message': f'Cleared {deleted[0]} notifications',
            'count': deleted[0]
        })
    
    @action(detail=False, methods=['delete'])
    def clear_read(self, request):
        """Clear all read notifications"""
        deleted = self.get_queryset().filter(is_read=True).delete()
        
        return Response({
            'message': f'Cleared {deleted[0]} read notifications',
            'count': deleted[0]
        })


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for notification preferences"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Users see only their own preferences"""
        user = self.request.user
        
        if not user.is_authenticated:
            return NotificationPreference.objects.none()
        
        return NotificationPreference.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def my_preferences(self, request):
        """Get current user's preferences"""
        preferences, created = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_preferences(self, request):
        """Update current user's preferences"""
        preferences, created = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(preferences, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for notification templates (admin only)"""
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['notification_type', 'is_active']
    
    def get_queryset(self):
        return NotificationTemplate.objects.filter(is_active=True)


class NotificationBatchViewSet(viewsets.ModelViewSet):
    """ViewSet for batch notifications (teachers/admins)"""
    serializer_class = NotificationBatchSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'notification_type']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return NotificationBatch.objects.all()
        elif user.role == 'teacher':
            return NotificationBatch.objects.filter(created_by=user)
        
        return NotificationBatch.objects.none()
    
    def perform_create(self, serializer):
        """Create batch notification"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def send_batch(self, request, pk=None):
        """Send batch notification"""
        batch = self.get_object()
        
        if batch.status != 'pending':
            return Response(
                {'error': 'Batch already processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get recipients based on batch criteria
        # TODO: Implement recipient selection logic
        
        batch.status = 'processing'
        batch.save()
        
        # TODO: Implement async batch sending with Celery
        
        return Response({
            'message': 'Batch notification queued for sending',
            'batch_id': batch.id
        })


# Helper function to create notifications
def create_notification(
    recipient,
    notification_type,
    title,
    message,
    priority='normal',
    reference_type='',
    reference_id='',
    action_url='',
    metadata=None
):
    """
    Helper function to create a notification
    
    Usage:
    from apps.notifications.views import create_notification
    
    create_notification(
        recipient=student,
        notification_type='assignment_created',
        title='New Assignment',
        message='Math homework has been assigned',
        priority='normal',
        reference_type='assignment',
        reference_id=str(assignment.id),
        action_url=f'/assignments/{assignment.id}/'
    )
    """
    # Check user preferences
    try:
        prefs = recipient.notification_preferences
        
        # Check if notifications are enabled
        if not prefs.enable_in_app:
            return None
        
        # Check type-specific preferences
        type_map = {
            'assignment_created': prefs.notify_assignments,
            'assignment_graded': prefs.notify_assignments,
            'quiz_created': prefs.notify_quizzes,
            'quiz_graded': prefs.notify_quizzes,
            'new_message': prefs.notify_messages,
            'new_announcement': prefs.notify_announcements,
            'attendance_marked': prefs.notify_attendance,
            'behavior_incident': prefs.notify_behavior,
            'grade_updated': prefs.notify_grades,
            'xp_earned': prefs.notify_gamification,
            'resource_shared': prefs.notify_resources,
        }
        
        if notification_type in type_map and not type_map[notification_type]:
            return None
        
        # Check quiet hours
        if prefs.enable_quiet_hours and prefs.quiet_hours_start and prefs.quiet_hours_end:
            from datetime import datetime
            current_time = datetime.now().time()
            if prefs.quiet_hours_start <= current_time <= prefs.quiet_hours_end:
                return None
    
    except NotificationPreference.DoesNotExist:
        # Create default preferences
        NotificationPreference.objects.create(user=recipient)
    
    # Create notification
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        priority=priority,
        title=title,
        message=message,
        reference_type=reference_type,
        reference_id=reference_id,
        action_url=action_url,
        metadata=metadata or {}
    )
    
    # TODO: Send push notification if enabled
    # TODO: Queue email notification if enabled
    
    return notification
