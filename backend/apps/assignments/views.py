"""
Views for assignments app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db.models import Avg, Count

from .models import Assignment, AssignmentSubmission
from .serializers import AssignmentSerializer, AssignmentSubmissionSerializer
from apps.core.permissions import IsTeacher, IsStudent
from apps.schools.models import ClassroomEnrollment


class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing assignments"""
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['classroom', 'is_ai_generated']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'title']
    ordering = ['-due_date']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Assignment.objects.none()
        
        if user.role == 'teacher':
            return Assignment.objects.filter(teacher=user, is_deleted=False)
        elif user.role == 'student':
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user, is_active=True
            ).values_list('classroom_id', flat=True)
            return Assignment.objects.filter(classroom_id__in=enrolled_classrooms, is_deleted=False)
        elif user.role == 'admin':
            return Assignment.objects.filter(is_deleted=False)
        
        return Assignment.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def generate_ai(self, request, pk=None):
        """AI generate assignment - Placeholder"""
        assignment = self.get_object()
        # TODO: Implement AI generation
        return Response({
            'message': 'AI assignment generation coming soon',
            'status': 'not_implemented'
        })
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher])
    def analytics(self, request, pk=None):
        """Get assignment analytics"""
        assignment = self.get_object()
        submissions = assignment.submissions.all()
        
        return Response({
            'total_students': ClassroomEnrollment.objects.filter(
                classroom=assignment.classroom, is_active=True
            ).count(),
            'submitted_count': submissions.filter(status__in=['submitted', 'graded']).count(),
            'graded_count': submissions.filter(status='graded').count(),
            'average_score': submissions.filter(status='graded').aggregate(
                avg=Avg('points_earned')
            )['avg'] or 0,
            'late_submissions': submissions.filter(is_late=True).count()
        })


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing submissions"""
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['assignment', 'student', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AssignmentSubmission.objects.none()
        
        if user.role == 'student':
            return AssignmentSubmission.objects.filter(student=user)
        elif user.role == 'teacher':
            return AssignmentSubmission.objects.filter(assignment__teacher=user)
        elif user.role == 'admin':
            return AssignmentSubmission.objects.all()
        
        return AssignmentSubmission.objects.none()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def submit(self, request, pk=None):
        """Submit assignment"""
        submission = self.get_object()
        submission.submitted_at = timezone.now()
        submission.status = 'submitted'
        submission.is_late = timezone.now() > submission.assignment.due_date
        submission.save()
        
        return Response(self.get_serializer(submission).data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def grade(self, request, pk=None):
        """Grade submission"""
        submission = self.get_object()
        submission.points_earned = request.data.get('points_earned')
        submission.feedback = request.data.get('feedback', '')
        submission.status = 'graded'
        submission.graded_at = timezone.now()
        submission.graded_by = request.user
        submission.save()
        
        return Response(self.get_serializer(submission).data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def ai_grade(self, request, pk=None):
        """AI grade submission - Placeholder"""
        submission = self.get_object()
        # TODO: Implement AI grading
        return Response({
            'message': 'AI grading coming soon',
            'status': 'not_implemented'
        })
