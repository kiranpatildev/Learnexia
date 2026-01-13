"""
Views for schools app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import School, AcademicYear, Subject, Classroom, ClassroomEnrollment
from .serializers import (
    SchoolSerializer, AcademicYearSerializer, SubjectSerializer,
    ClassroomSerializer, ClassroomEnrollmentSerializer
)
from apps.core.permissions import IsTeacher, IsAdmin
from apps.core.utils import generate_unique_code


class SchoolViewSet(viewsets.ModelViewSet):
    """
    School CRUD operations
    """
    queryset = School.objects.filter(is_deleted=False)
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'city', 'state']
    ordering_fields = ['name', 'created_at']
    
    def perform_create(self, serializer):
        # Generate unique school code
        serializer.save(code=generate_unique_code(6))


class AcademicYearViewSet(viewsets.ModelViewSet):
    """
    Academic year operations
    """
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['school', 'is_current']
    ordering_fields = ['start_date', 'name']
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current academic year"""
        school_id = request.query_params.get('school')
        if not school_id:
            return Response(
                {'error': 'school parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        academic_year = AcademicYear.objects.filter(
            school_id=school_id,
            is_current=True
        ).first()
        
        if not academic_year:
            return Response(
                {'error': 'No current academic year found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(academic_year)
        return Response(serializer.data)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    Subject operations
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['grade']
    search_fields = ['name', 'code']
    ordering_fields = ['grade', 'name']


class ClassroomViewSet(viewsets.ModelViewSet):
    """
    Classroom operations
    """
    queryset = Classroom.objects.filter(is_deleted=False)
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['school', 'academic_year', 'teacher', 'grade', 'subject']
    search_fields = ['section', 'room_number', 'class_code']
    ordering_fields = ['grade', 'section', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        
        if user.role == 'teacher':
            return queryset.filter(teacher=user)
        elif user.role == 'student':
            return queryset.filter(enrollments__student=user, enrollments__is_active=True)
        elif user.role == 'parent':
            student_ids = user.children_relationships.values_list('student_id', flat=True)
            return queryset.filter(enrollments__student_id__in=student_ids, enrollments__is_active=True)
        
        return queryset
    
    def perform_create(self, serializer):
        # Generate unique class code
        serializer.save(class_code=generate_unique_code(8))
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get all students in a classroom"""
        classroom = self.get_object()
        enrollments = classroom.enrollments.filter(is_active=True).select_related('student')
        serializer = ClassroomEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enroll_student(self, request, pk=None):
        """Enroll a student in the classroom"""
        classroom = self.get_object()
        student_id = request.data.get('student_id')
        
        if not student_id:
            return Response(
                {'error': 'student_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already enrolled
        if ClassroomEnrollment.objects.filter(
            classroom=classroom,
            student_id=student_id,
            is_active=True
        ).exists():
            return Response(
                {'error': 'Student is already enrolled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create enrollment
        enrollment = ClassroomEnrollment.objects.create(
            classroom=classroom,
            student_id=student_id
        )
        
        serializer = ClassroomEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ClassroomEnrollmentViewSet(viewsets.ModelViewSet):
    """
    Classroom enrollment operations
    """
    queryset = ClassroomEnrollment.objects.all()
    serializer_class = ClassroomEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['classroom', 'student', 'is_active']
    ordering_fields = ['enrollment_date']
    
    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        
        if user.role == 'student':
            return queryset.filter(student=user)
        elif user.role == 'teacher':
            return queryset.filter(classroom__teacher=user)
        elif user.role == 'parent':
            student_ids = user.children_relationships.values_list('student_id', flat=True)
            return queryset.filter(student_id__in=student_ids)
        
        return queryset
