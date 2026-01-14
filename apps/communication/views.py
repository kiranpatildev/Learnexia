"""
Views for communication app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db.models import Count, Q

from .models import Conversation, Message, Announcement, MessageRead, AnnouncementRead
from .serializers import (
    ConversationSerializer, MessageSerializer, AnnouncementSerializer,
    MessageReadSerializer, AnnouncementReadSerializer
)
from apps.core.permissions import IsTeacher
from apps.schools.models import ClassroomEnrollment


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing conversations"""
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['conversation_type', 'classroom']
    search_fields = ['title']
    ordering = ['-last_message_at']
    
    def get_queryset(self):
        """Only show conversations user is part of"""
        user = self.request.user
        if not user.is_authenticated:
            return Conversation.objects.none()
        
        return Conversation.objects.filter(
            participants=user,
            is_deleted=False
        ).prefetch_related('participants').distinct()
    
    def perform_create(self, serializer):
        """Create conversation and add participants"""
        conversation = serializer.save(created_by=self.request.user)
        
        # Add creator as participant
        conversation.participants.add(self.request.user)
    
    @action(detail=False, methods=['post'])
    def start(self, request):
        """
        Start new conversation or return existing
        
        For direct messages, checks if conversation already exists
        """
        participant_ids = request.data.get('participant_ids', [])
        conversation_type = request.data.get('conversation_type', 'direct')
        
        if not participant_ids:
            return Response(
                {'error': 'participant_ids required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Include current user
        all_participant_ids = set(participant_ids + [request.user.id])
        
        # For direct messages, check if exists
        if conversation_type == 'direct' and len(all_participant_ids) == 2:
            existing = Conversation.objects.filter(
                conversation_type='direct',
                participants__in=all_participant_ids
            ).annotate(
                participant_count=Count('participants')
            ).filter(
                participant_count=2
            ).first()
            
            if existing:
                return Response(
                    ConversationSerializer(existing, context={'request': request}).data
                )
        
        # Create new conversation
        conversation = Conversation.objects.create(
            conversation_type=conversation_type,
            title=request.data.get('title', ''),
            classroom_id=request.data.get('classroom_id'),
            created_by=request.user
        )
        
        conversation.participants.set(all_participant_ids)
        
        return Response(
            ConversationSerializer(conversation, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark all messages in conversation as read"""
        conversation = self.get_object()
        
        # Get unread messages
        unread_messages = conversation.messages.exclude(
            sender=request.user
        ).exclude(
            message_reads__user=request.user
        ).filter(is_deleted=False)
        
        # Create read receipts
        MessageRead.objects.bulk_create([
            MessageRead(message=msg, user=request.user)
            for msg in unread_messages
        ], ignore_conflicts=True)
        
        return Response({'message': f'Marked {unread_messages.count()} messages as read'})
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get conversations with unread messages"""
        conversations = self.get_queryset().filter(
            messages__message_reads__isnull=True
        ).exclude(
            messages__sender=request.user
        ).distinct()
        
        serializer = self.get_serializer(conversations, many=True)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing messages"""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['conversation', 'sender']
    ordering = ['created_at']
    
    def get_queryset(self):
        """Only show messages from user's conversations"""
        user = self.request.user
        if not user.is_authenticated:
            return Message.objects.none()
        
        user_conversations = Conversation.objects.filter(participants=user)
        
        return Message.objects.filter(
            conversation__in=user_conversations,
            is_deleted=False
        ).select_related('sender', 'conversation')
    
    def perform_create(self, serializer):
        """Send message and update conversation timestamp"""
        message = serializer.save(sender=self.request.user)
        
        # Update conversation last_message_at
        message.conversation.last_message_at = timezone.now()
        message.conversation.save(update_fields=['last_message_at'])
        
        # TODO: Send real-time notification
        # TODO: Send push notification to participants
    
    def retrieve(self, request, *args, **kwargs):
        """Auto-mark message as read when retrieved"""
        instance = self.get_object()
        
        # Mark as read if not sender
        if instance.sender != request.user:
            MessageRead.objects.get_or_create(
                message=instance,
                user=request.user
            )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark single message as read"""
        message = self.get_object()
        
        if message.sender == request.user:
            return Response({'message': 'Cannot mark own message as read'})
        
        MessageRead.objects.get_or_create(
            message=message,
            user=request.user
        )
        
        return Response({'message': 'Message marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get all unread messages for current user"""
        unread = self.get_queryset().exclude(
            sender=request.user
        ).exclude(
            message_reads__user=request.user
        )
        
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)


class AnnouncementViewSet(viewsets.ModelViewSet):
    """ViewSet for managing announcements"""
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['target_role', 'classroom', 'priority', 'is_draft']
    search_fields = ['title', 'content']
    ordering = ['-sent_at']
    
    def get_queryset(self):
        """Filter announcements based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return Announcement.objects.none()
        
        if user.role in ['teacher', 'admin']:
            # Teachers/admins see announcements they created
            return Announcement.objects.filter(
                Q(sent_by=user) | Q(target_role=user.role),
                is_deleted=False
            )
        
        elif user.role == 'student':
            # Students see announcements targeted to them
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user, is_active=True
            ).values_list('classroom_id', flat=True)
            
            return Announcement.objects.filter(
                Q(target_role='student') | Q(target_role='all'),
                Q(classroom__isnull=True) | Q(classroom_id__in=enrolled_classrooms),
                is_draft=False,
                is_deleted=False
            ).filter(
                Q(sent_at__isnull=False) | Q(scheduled_for__lte=timezone.now())
            )
        
        elif user.role == 'parent':
            # Parents see announcements targeted to parents
            children = user.children_relationships.values_list('student_id', flat=True)
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student_id__in=children, is_active=True
            ).values_list('classroom_id', flat=True)
            
            return Announcement.objects.filter(
                Q(target_role='parent') | Q(target_role='all'),
                Q(classroom__isnull=True) | Q(classroom_id__in=enrolled_classrooms),
                is_draft=False,
                is_deleted=False
            ).filter(
                Q(sent_at__isnull=False) | Q(scheduled_for__lte=timezone.now())
            )
        
        return Announcement.objects.none()
    
    def perform_create(self, serializer):
        """Create announcement"""
        announcement = serializer.save(sent_by=self.request.user)
        
        # If not draft and not scheduled, send immediately
        if not announcement.is_draft and not announcement.scheduled_for:
            self.publish_announcement(announcement)
    
    def publish_announcement(self, announcement):
        """Publish announcement and create read receipts"""
        announcement.sent_at = timezone.now()
        announcement.save()
        
        # Calculate recipients
        recipients = self.calculate_recipients(announcement)
        
        # Create AnnouncementRead records
        AnnouncementRead.objects.bulk_create([
            AnnouncementRead(announcement=announcement, user=recipient)
            for recipient in recipients
        ], ignore_conflicts=True)
        
        announcement.total_recipients = len(recipients)
        announcement.save(update_fields=['total_recipients'])
        
        # TODO: Send notifications
    
    def calculate_recipients(self, announcement):
        """Calculate who should receive this announcement"""
        from apps.accounts.models import User
        
        recipients = []
        
        if announcement.classroom:
            # Classroom-specific
            if announcement.target_role == 'student':
                recipients = ClassroomEnrollment.objects.filter(
                    classroom=announcement.classroom, is_active=True
                ).values_list('student', flat=True)
            elif announcement.target_role == 'parent':
                students = ClassroomEnrollment.objects.filter(
                    classroom=announcement.classroom, is_active=True
                ).values_list('student_id', flat=True)
                # Get parents of these students
                from apps.accounts.models import ParentStudentRelationship
                recipients = ParentStudentRelationship.objects.filter(
                    student_id__in=students
                ).values_list('parent_id', flat=True)
        else:
            # School-wide
            if announcement.target_role == 'all':
                recipients = User.objects.filter(is_active=True).values_list('id', flat=True)
            else:
                recipients = User.objects.filter(
                    role=announcement.target_role, is_active=True
                ).values_list('id', flat=True)
        
        return list(set(recipients))
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def publish(self, request, pk=None):
        """Publish draft announcement"""
        announcement = self.get_object()
        
        if announcement.sent_by != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'You can only publish your own announcements'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        announcement.is_draft = False
        self.publish_announcement(announcement)
        
        return Response(AnnouncementSerializer(announcement, context={'request': request}).data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark announcement as read"""
        announcement = self.get_object()
        
        read_record, created = AnnouncementRead.objects.get_or_create(
            announcement=announcement,
            user=request.user
        )
        
        if not read_record.read_at:
            read_record.read_at = timezone.now()
            read_record.save()
            
            # Update read count
            announcement.read_count = announcement.announcement_reads.filter(
                read_at__isnull=False
            ).count()
            announcement.save(update_fields=['read_count'])
        
        return Response({'message': 'Announcement marked as read'})
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge announcement (for important ones)"""
        announcement = self.get_object()
        
        if not announcement.requires_acknowledgment:
            return Response(
                {'error': 'This announcement does not require acknowledgment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        read_record = AnnouncementRead.objects.get(
            announcement=announcement,
            user=request.user
        )
        
        read_record.acknowledged_at = timezone.now()
        if not read_record.read_at:
            read_record.read_at = timezone.now()
        read_record.save()
        
        return Response({'message': 'Announcement acknowledged'})
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread announcements for current user"""
        unread = AnnouncementRead.objects.filter(
            user=request.user,
            read_at__isnull=True
        ).values_list('announcement_id', flat=True)
        
        announcements = self.get_queryset().filter(id__in=unread)
        serializer = self.get_serializer(announcements, many=True)
        return Response(serializer.data)
