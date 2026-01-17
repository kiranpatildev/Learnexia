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


class PendingBehaviorDetectionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing pending behavior detections
    
    Teachers can:
    - View pending detections
    - Approve, modify, or reject detections
    - Send notifications
    """
    from .models import PendingBehaviorDetection
    from .serializers import PendingBehaviorDetectionSerializer, BehaviorReviewRequestSerializer
    
    serializer_class = PendingBehaviorDetectionSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['lecture', 'status', 'is_positive', 'severity']
    ordering_fields = ['created_at', 'ai_confidence_score']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter pending detections - teachers see only their lectures"""
        user = self.request.user
        
        if not user.is_authenticated or user.role != 'teacher':
            from .models import PendingBehaviorDetection
            return PendingBehaviorDetection.objects.none()
        
        from .models import PendingBehaviorDetection
        return PendingBehaviorDetection.objects.filter(
            lecture__teacher=user
        ).select_related('lecture', 'reviewed_by')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def review(self, request, pk=None):
        """
        Review and process a pending behavior detection
        
        Actions:
        - APPROVE: Accept as-is and create incident/note
        - MODIFY: Edit before creating incident/note
        - REJECT: Discard detection
        
        Request Body:
        {
            "action": "APPROVE" | "REJECT" | "MODIFY",
            "teacher_notes": "optional comments",
            "modified_description": "optional (for MODIFY)",
            "modified_severity": "optional (for MODIFY)",
            "modified_behavior_type": "optional (for MODIFY)",
            "send_to_student": true,
            "send_to_parent": true
        }
        """
        from .models import PendingBehaviorDetection
        from .serializers import BehaviorReviewRequestSerializer
        from apps.schools.models import ClassroomEnrollment
        
        pending = self.get_object()
        
        # Validate request
        serializer = BehaviorReviewRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'message': 'Invalid request data',
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validated_data = serializer.validated_data
        action = validated_data['action']
        teacher_notes = validated_data.get('teacher_notes', '')
        send_to_student = validated_data.get('send_to_student', True)
        send_to_parent = validated_data.get('send_to_parent', True)
        
        # Handle REJECT
        if action == 'REJECT':
            pending.status = 'rejected'
            pending.reviewed_by = request.user
            pending.reviewed_at = timezone.now()
            pending.teacher_notes = teacher_notes
            pending.save()
            
            return Response({
                'success': True,
                'message': 'Behavior detection rejected. No action taken.',
                'detection_id': pending.id,
                'status': pending.status
            })
        
        # Handle APPROVE or MODIFY
        try:
            # Find student by name (simplified - in production, use better matching)
            from apps.accounts.models import User
            
            # Try to find student in the lecture's classroom
            classroom = pending.lecture.classroom
            enrolled_students = ClassroomEnrollment.objects.filter(
                classroom=classroom,
                is_active=True
            ).select_related('student')
            
            # Simple name matching (case-insensitive)
            student = None
            for enrollment in enrolled_students:
                full_name = enrollment.student.get_full_name()
                if pending.student_name.lower() in full_name.lower() or full_name.lower() in pending.student_name.lower():
                    student = enrollment.student
                    break
            
            if not student:
                return Response(
                    {
                        'success': False,
                        'message': f'Could not find student "{pending.student_name}" in classroom. Please create incident manually.',
                        'error_code': 'STUDENT_NOT_FOUND'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prepare data
            if action == 'MODIFY':
                description = validated_data.get('modified_description') or pending.description
                severity = validated_data.get('modified_severity') or pending.severity
                behavior_type = validated_data.get('modified_behavior_type') or pending.behavior_type
                
                # Save modifications
                pending.modified_description = description
                pending.modified_severity = severity
                pending.modified_behavior_type = behavior_type
                pending.status = 'modified'
            else:  # APPROVE
                description = pending.description
                severity = pending.severity
                behavior_type = pending.behavior_type
                pending.status = 'approved'
            
            # Create BehaviorIncident or BehaviorNote based on type
            if pending.is_positive:
                # Create positive behavior note
                note = BehaviorNote.objects.create(
                    student=student,
                    classroom=classroom,
                    teacher=request.user,
                    lecture=pending.lecture,
                    note_type='positive',
                    note=description,
                    source='ai_lecture',
                    is_ai_generated=True,
                    ai_transcript_snippet=pending.original_statement,
                    visible_to_student=send_to_student,
                    visible_to_parent=send_to_parent
                )
                pending.created_note = note
                created_type = 'note'
                created_id = note.id
            else:
                # Create negative behavior incident
                incident = BehaviorIncident.objects.create(
                    student=student,
                    classroom=classroom,
                    reported_by=request.user,
                    lecture=pending.lecture,
                    incident_type=behavior_type,
                    severity=severity,
                    title=f"Behavior: {behavior_type}",
                    description=description,
                    source='ai_lecture',
                    is_ai_generated=True,
                    ai_confidence_score=pending.ai_confidence_score,
                    ai_transcript_snippet=pending.original_statement
                )
                pending.created_incident = incident
                created_type = 'incident'
                created_id = incident.id
            
            # Update pending detection
            pending.reviewed_by = request.user
            pending.reviewed_at = timezone.now()
            pending.teacher_notes = teacher_notes
            
            # Mark notifications (actual sending would happen here)
            if send_to_student:
                pending.student_notified = True
            if send_to_parent:
                pending.parent_notified = True
            if send_to_student or send_to_parent:
                pending.notification_sent_at = timezone.now()
            
            pending.save()
            
            return Response({
                'success': True,
                'message': f'Behavior detection {action.lower()}ed and {created_type} created.',
                'detection_id': pending.id,
                'status': pending.status,
                'created_type': created_type,
                'created_id': str(created_id),
                'student_notified': pending.student_notified,
                'parent_notified': pending.parent_notified
            })
        
        except Exception as e:
            return Response(
                {
                    'success': False,
                    'message': f'Error processing detection: {str(e)}',
                    'error_code': 'PROCESSING_ERROR'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher])
    def pending_count(self, request):
        """Get count of pending detections for teacher"""
        count = self.get_queryset().filter(status='pending').count()
        return Response({
            'pending_count': count
        })
