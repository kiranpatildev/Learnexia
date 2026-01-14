"""
Views for attendance app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.utils import timezone

from .models import AttendanceSession, AttendanceRecord, AttendanceStatistics
from .serializers import (
    AttendanceSessionSerializer, AttendanceRecordSerializer,
    AttendanceStatisticsSerializer
)
from apps.core.permissions import IsTeacher
from apps.schools.models import ClassroomEnrollment


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing attendance sessions"""
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['classroom', 'date', 'session_type', 'is_finalized']
    ordering = ['-date']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AttendanceSession.objects.none()
        
        if user.role == 'teacher':
            return AttendanceSession.objects.filter(teacher=user)
        elif user.role == 'admin':
            return AttendanceSession.objects.all()
        
        return AttendanceSession.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def finalize(self, request, pk=None):
        """Finalize attendance session"""
        session = self.get_object()
        session.is_finalized = True
        session.finalized_at = timezone.now()
        session.save()
        
        # TODO: Update statistics
        # TODO: Send parent notifications
        
        return Response(self.get_serializer(session).data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def mark_all_present(self, request, pk=None):
        """Mark all students as present"""
        session = self.get_object()
        students = ClassroomEnrollment.objects.filter(
            classroom=session.classroom,
            is_active=True
        ).values_list('student_id', flat=True)
        
        for student_id in students:
            AttendanceRecord.objects.get_or_create(
                session=session,
                student_id=student_id,
                defaults={'status': 'present'}
            )
        
        return Response({'message': f'Marked {len(students)} students as present'})


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for managing attendance records"""
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['session', 'student', 'status']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AttendanceRecord.objects.none()
        
        if user.role == 'teacher':
            return AttendanceRecord.objects.filter(session__teacher=user)
        elif user.role == 'student':
            return AttendanceRecord.objects.filter(student=user)
        elif user.role == 'parent':
            children = user.children_relationships.values_list('student_id', flat=True)
            return AttendanceRecord.objects.filter(student_id__in=children)
        elif user.role == 'admin':
            return AttendanceRecord.objects.all()
        
        return AttendanceRecord.objects.none()


class AttendanceStatisticsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing attendance statistics"""
    serializer_class = AttendanceStatisticsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'classroom']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AttendanceStatistics.objects.none()
        
        if user.role == 'teacher':
            return AttendanceStatistics.objects.filter(classroom__teacher=user)
        elif user.role == 'student':
            return AttendanceStatistics.objects.filter(student=user)
        elif user.role == 'parent':
            children = user.children_relationships.values_list('student_id', flat=True)
            return AttendanceStatistics.objects.filter(student_id__in=children)
        elif user.role == 'admin':
            return AttendanceStatistics.objects.all()
        
        return AttendanceStatistics.objects.none()
