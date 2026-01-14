"""
Serializers for notifications app
"""

from rest_framework import serializers
from .models import Notification, NotificationPreference, NotificationTemplate, NotificationBatch


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'recipient', 'sent_at', 'read_at']
    
    def get_time_ago(self, obj):
        """Return human-readable time ago"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.sent_at
        
        if diff < timedelta(minutes=1):
            return 'Just now'
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f'{minutes} minute{"s" if minutes != 1 else ""} ago'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'{hours} hour{"s" if hours != 1 else ""} ago'
        elif diff < timedelta(days=7):
            days = diff.days
            return f'{days} day{"s" if days != 1 else ""} ago'
        else:
            return obj.sent_at.strftime('%b %d, %Y')


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = NotificationPreference
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for notification templates"""
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = NotificationTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationBatchSerializer(serializers.ModelSerializer):
    """Serializer for notification batches"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = NotificationBatch
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'created_by',
            'recipient_count', 'sent_count', 'status', 'sent_at'
        ]
    
    def get_completion_percentage(self, obj):
        if obj.recipient_count == 0:
            return 0
        return round((obj.sent_count / obj.recipient_count) * 100, 2)
