"""
Views for behavior app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db.models import Count, Q

from .models import BehaviorIncident, BehaviorNote, BehaviorStatistics
from .serializers import (
    BehaviorIncidentSerializer, BehaviorNoteSerializer,
    BehaviorStatisticsSerializer
)
from apps.core.permissions import IsTeacher
from apps.schools.models import ClassroomEnrollment


class BehaviorIncidentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing behavior incidents
    
    Supports:
    - Manual incident creation by teachers
    - AI-generated incidents (future)
    - Student/parent viewing
    """
    serializer_class = BehaviorIncidentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'student', 'classroom', 'incident_type', 'severity',
        'is_ai_generated', 'source', 'resolved'
    ]
    search_fields = ['title', 'description', 'student__first_name', 'student__last_name']
    ordering_fields = ['incident_date', 'severity', 'created_at']
    ordering = ['-incident_date']
    
    def get_queryset(self):
        """Filter incidents based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return BehaviorIncident.objects.none()
        
        if user.role == 'teacher':
            # Teachers see incidents for their classrooms
            return BehaviorIncident.objects.filter(
                classroom__teacher=user,
                is_deleted=False
            ).select_related('student', 'classroom', 'reported_by', 'lecture')
        
        elif user.role == 'student':
            # Students see their own incidents
            return BehaviorIncident.objects.filter(
                student=user,
                is_deleted=False
            ).select_related('classroom', 'reported_by', 'lecture')
        
        elif user.role == 'parent':
            # Parents see their children's incidents
            children = user.children_relationships.values_list('student_id', flat=True)
            return BehaviorIncident.objects.filter(
                student_id__in=children,
                is_deleted=False
            ).select_related('student', 'classroom', 'reported_by', 'lecture')
        
        elif user.role == 'admin':
            # Admins see all incidents
            return BehaviorIncident.objects.filter(
                is_deleted=False
            ).select_related('student', 'classroom', 'reported_by', 'lecture')
        
        return BehaviorIncident.objects.none()
    
    def perform_create(self, serializer):
        """
        Create incident manually
        
        Sets reported_by to current user and source to 'manual'
        """
        serializer.save(
            reported_by=self.request.user,
            source='manual',
            is_ai_generated=False
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def resolve(self, request, pk=None):
        """Mark incident as resolved"""
        incident = self.get_object()
        incident.resolved = True
        incident.resolved_at = timezone.now()
        incident.resolved_by = request.user
        incident.followup_notes = request.data.get('followup_notes', incident.followup_notes)
        incident.save()
        
        return Response(self.get_serializer(incident).data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def notify_parents(self, request, pk=None):
        """
        Notify parents about incident
        
        TODO: Implement actual notification sending
        """
        incident = self.get_object()
        incident.parent_notified = True
        incident.parent_notified_at = timezone.now()
        incident.save()
        
        # TODO: Send actual notification
        # send_parent_notification(incident)
        
        return Response({
            'message': 'Parent notification sent',
            'incident_id': incident.id
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_incidents(self, request):
        """
        Get current user's incidents (for students)
        """
        if request.user.role != 'student':
            return Response(
                {'error': 'This endpoint is only for students'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        incidents = self.get_queryset().filter(student=request.user)
        serializer = self.get_serializer(incidents, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher])
    def analytics(self, request):
        """
        Get behavior analytics for teacher's classrooms
        """
        incidents = self.get_queryset()
        
        # Aggregate by severity
        by_severity = incidents.values('severity').annotate(count=Count('id'))
        
        # Aggregate by type
        by_type = incidents.values('incident_type').annotate(count=Count('id'))
        
        # AI vs Manual
        ai_count = incidents.filter(is_ai_generated=True).count()
        manual_count = incidents.filter(is_ai_generated=False).count()
        
        # Resolved vs Unresolved
        resolved_count = incidents.filter(resolved=True).count()
        unresolved_count = incidents.filter(resolved=False).count()
        
        return Response({
            'total_incidents': incidents.count(),
            'by_severity': list(by_severity),
            'by_type': list(by_type),
            'ai_generated': ai_count,
            'manual': manual_count,
            'resolved': resolved_count,
            'unresolved': unresolved_count
        })
    
    # ============================================
    # AI INTEGRATION ENDPOINT (PLACEHOLDER)
    # ============================================
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_from_ai(self, request):
        """
        Create incident from AI lecture analysis
        
        This endpoint will be called by AI service after analyzing lecture
        
        Expected payload:
        {
            "student_id": "uuid",
            "classroom_id": "uuid",
            "lecture_id": "uuid",
            "incident_type": "disruption",
            "severity": "minor",
            "title": "Class disruption detected",
            "description": "Student was talking during lecture",
            "ai_transcript_snippet": "Kiran, you are disturbing the class",
            "lecture_timestamp": 1234,
            "ai_confidence_score": 85.5
        }
        
        TODO: Implement AI integration
        - Validate AI service authentication
        - Process AI-detected incident
        - Auto-notify student and parents
        - Update behavior statistics
        """
        # TODO: Implement AI incident creation
        return Response({
            'message': 'AI incident creation coming soon',
            'status': 'not_implemented',
            'note': 'This endpoint will be used by AI service to create incidents from lecture analysis'
        }, status=status.HTTP_501_NOT_IMPLEMENTED)


class BehaviorNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing behavior notes
    
    Supports:
    - Manual notes by teachers
    - AI-generated notes (future)
    """
    serializer_class = BehaviorNoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['student', 'classroom', 'note_type', 'is_ai_generated', 'source']
    search_fields = ['note', 'student__first_name', 'student__last_name']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']
    
    def get_queryset(self):
        """Filter notes based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return BehaviorNote.objects.none()
        
        if user.role == 'teacher':
            # Teachers see notes for their classrooms
            return BehaviorNote.objects.filter(
                classroom__teacher=user,
                is_deleted=False
            ).select_related('student', 'classroom', 'teacher', 'lecture')
        
        elif user.role == 'student':
            # Students see their own notes (if visible)
            return BehaviorNote.objects.filter(
                student=user,
                visible_to_student=True,
                is_deleted=False
            ).select_related('classroom', 'teacher', 'lecture')
        
        elif user.role == 'parent':
            # Parents see their children's notes (if visible)
            children = user.children_relationships.values_list('student_id', flat=True)
            return BehaviorNote.objects.filter(
                student_id__in=children,
                visible_to_parent=True,
                is_deleted=False
            ).select_related('student', 'classroom', 'teacher', 'lecture')
        
        elif user.role == 'admin':
            # Admins see all notes
            return BehaviorNote.objects.filter(
                is_deleted=False
            ).select_related('student', 'classroom', 'teacher', 'lecture')
        
        return BehaviorNote.objects.none()
    
    def perform_create(self, serializer):
        """Create note manually"""
        serializer.save(
            teacher=self.request.user,
            source='manual',
            is_ai_generated=False
        )


class BehaviorStatisticsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing behavior statistics
    
    Read-only: Statistics are auto-calculated
    """
    serializer_class = BehaviorStatisticsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'classroom']
    
    def get_queryset(self):
        """Filter statistics based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return BehaviorStatistics.objects.none()
        
        if user.role == 'teacher':
            # Teachers see stats for their classrooms
            return BehaviorStatistics.objects.filter(
                classroom__teacher=user
            ).select_related('student', 'classroom')
        
        elif user.role == 'student':
            # Students see their own stats
            return BehaviorStatistics.objects.filter(
                student=user
            ).select_related('classroom')
        
        elif user.role == 'parent':
            # Parents see their children's stats
            children = user.children_relationships.values_list('student_id', flat=True)
            return BehaviorStatistics.objects.filter(
                student_id__in=children
            ).select_related('student', 'classroom')
        
        elif user.role == 'admin':
            # Admins see all stats
            return BehaviorStatistics.objects.all().select_related('student', 'classroom')
        
        return BehaviorStatistics.objects.none()
