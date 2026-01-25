"""
Serializers for communication app
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Conversation, Message, MessageAttachment, MessageRead, Announcement, AnnouncementRead


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations"""
    participant_names = serializers.SerializerMethodField()
    participants_info = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'last_message_at']
    
    def get_participant_names(self, obj):
        return [p.get_full_name() for p in obj.participants.all()]

    def get_participants_info(self, obj):
        return [
            {
                'id': p.id,
                'name': p.get_full_name(),
                'role': p.role,
                'email': p.email
            }
            for p in obj.participants.all()
        ]
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        # Count messages user hasn't read
        return obj.messages.exclude(
            sender=request.user
        ).exclude(
            message_reads__user=request.user
        ).count()
    
    def get_last_message_preview(self, obj):
        last_message = obj.messages.filter(is_deleted=False).last()
        if not last_message:
            return None
        
        return {
            'sender': last_message.sender.get_full_name(),
            'text': last_message.message_text[:100],
            'timestamp': last_message.created_at
        }
    
    def validate(self, data):
        # Group conversations must have title
        if data.get('conversation_type') == 'group' and not data.get('title'):
            raise serializers.ValidationError({
                'title': 'Group conversations must have a title'
            })
        
        return data


class MessageAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for message attachments"""
    class Meta:
        model = MessageAttachment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'uploaded_by', 'file_type', 'file_size', 'download_count']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages"""
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    conversation_title = serializers.CharField(source='conversation.__str__', read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    is_read_by_current_user = serializers.SerializerMethodField()
    read_by_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'sender', 'is_edited', 'edited_at']
    
    def get_is_read_by_current_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Sender always "read" their own message
        if obj.sender == request.user:
            return True
        
        return MessageRead.objects.filter(message=obj, user=request.user).exists()
    
    def get_read_by_count(self, obj):
        return obj.message_reads.count()
    
    def validate(self, data):
        # Must have message text or attachment
        if not data.get('message_text') and not self.context.get('has_attachments'):
            raise serializers.ValidationError({
                'message_text': 'Message text or attachment is required'
            })
        
        # Verify sender is participant
        conversation = data.get('conversation')
        request = self.context.get('request')
        if conversation and request and request.user not in conversation.participants.all():
            raise serializers.ValidationError({
                'conversation': 'You must be a participant in this conversation'
            })
        
        return data


class AnnouncementSerializer(serializers.ModelSerializer):
    """Serializer for announcements"""
    sent_by_name = serializers.CharField(source='sent_by.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    is_read_by_current_user = serializers.SerializerMethodField()
    read_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'sent_by', 'sent_at',
            'total_recipients', 'read_count'
        ]
    
    def get_is_read_by_current_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        return AnnouncementRead.objects.filter(
            announcement=obj,
            user=request.user,
            read_at__isnull=False
        ).exists()
    
    def get_read_percentage(self, obj):
        if obj.total_recipients == 0:
            return 0
        return round((obj.read_count / obj.total_recipients) * 100, 2)
    
    def validate(self, data):
        # Must specify target audience
        if not data.get('target_role'):
            raise serializers.ValidationError({
                'target_role': 'Target role is required'
            })
        
        # Scheduled date must be in future
        if data.get('scheduled_for') and data['scheduled_for'] <= timezone.now():
            raise serializers.ValidationError({
                'scheduled_for': 'Scheduled time must be in the future'
            })
        
        return data


class MessageReadSerializer(serializers.ModelSerializer):
    """Serializer for message read receipts"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = MessageRead
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'user', 'read_at']


class AnnouncementReadSerializer(serializers.ModelSerializer):
    """Serializer for announcement read receipts"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    has_acknowledged = serializers.SerializerMethodField()
    
    class Meta:
        model = AnnouncementRead
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'user', 'read_at', 'acknowledged_at']
    
    def get_has_acknowledged(self, obj):
        return obj.acknowledged_at is not None
