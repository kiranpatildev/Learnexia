"""
Views for performance app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.db.models import Avg, Count, Q
from django.utils import timezone

from .models import StudentGrade, SubjectPerformance, ProgressReport, PerformanceMetric
from .serializers import (
    StudentGradeSerializer, SubjectPerformanceSerializer,
    ProgressReportSerializer, PerformanceMetricSerializer
)
from apps.core.permissions import IsTeacher
from apps.schools.models import ClassroomEnrollment


class StudentGradeViewSet(viewsets.ModelViewSet):
    """ViewSet for student grades"""
    serializer_class = StudentGradeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'classroom', 'academic_year', 'semester', 'is_passing', 'is_honor_roll']
    ordering = ['-academic_year', '-overall_percentage']
    
    def get_queryset(self):
        """Filter grades based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return StudentGrade.objects.none()
        
        if user.role == 'teacher':
            # Teachers see grades for their classrooms
            return StudentGrade.objects.filter(classroom__teacher=user)
        
        elif user.role == 'student':
            # Students see their own grades
            return StudentGrade.objects.filter(student=user)
        
        elif user.role == 'parent':
            # Parents see their children's grades
            children = user.children_relationships.values_list('student_id', flat=True)
            return StudentGrade.objects.filter(student_id__in=children)
        
        elif user.role == 'admin':
            # Admins see all grades
            return StudentGrade.objects.all()
        
        return StudentGrade.objects.none()
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def calculate_grades(self, request):
        """
        Calculate/recalculate grades for classroom
        
        Aggregates data from assignments and assessments
        """
        classroom_id = request.data.get('classroom_id')
        academic_year = request.data.get('academic_year')
        semester = request.data.get('semester', 'full_year')
        
        if not classroom_id or not academic_year:
            return Response(
                {'error': 'classroom_id and academic_year required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get enrolled students
        enrollments = ClassroomEnrollment.objects.filter(
            classroom_id=classroom_id,
            is_active=True
        )
        
        updated_count = 0
        for enrollment in enrollments:
            # Calculate grades (simplified - should aggregate from assignments/quizzes)
            grade, created = StudentGrade.objects.get_or_create(
                student=enrollment.student,
                classroom_id=classroom_id,
                academic_year=academic_year,
                semester=semester
            )
            
            # TODO: Aggregate actual scores from assignments and assessments
            # For now, placeholder calculation
            
            updated_count += 1
        
        return Response({
            'message': f'Calculated grades for {updated_count} students',
            'classroom_id': classroom_id,
            'academic_year': academic_year
        })
    
    @action(detail=False, methods=['get'])
    def my_grades(self, request):
        """Get current user's grades (for students)"""
        if request.user.role != 'student':
            return Response(
                {'error': 'This endpoint is only for students'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        grades = self.get_queryset().filter(student=request.user)
        serializer = self.get_serializer(grades, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher])
    def class_analytics(self, request):
        """Get analytics for a classroom"""
        classroom_id = request.query_params.get('classroom_id')
        
        if not classroom_id:
            return Response(
                {'error': 'classroom_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        grades = self.get_queryset().filter(classroom_id=classroom_id)
        
        return Response({
            'total_students': grades.count(),
            'average_gpa': grades.aggregate(avg=Avg('gpa'))['avg'] or 0,
            'average_percentage': grades.aggregate(avg=Avg('overall_percentage'))['avg'] or 0,
            'passing_count': grades.filter(is_passing=True).count(),
            'honor_roll_count': grades.filter(is_honor_roll=True).count(),
            'grade_distribution': self.get_grade_distribution(grades)
        })
    
    def get_grade_distribution(self, grades):
        """Calculate grade distribution"""
        distribution = {
            'A': grades.filter(overall_grade__in=['A+', 'A', 'A-']).count(),
            'B': grades.filter(overall_grade__in=['B+', 'B', 'B-']).count(),
            'C': grades.filter(overall_grade__in=['C+', 'C', 'C-']).count(),
            'D': grades.filter(overall_grade__in=['D+', 'D', 'D-']).count(),
            'F': grades.filter(overall_grade='F').count(),
        }
        return distribution


class SubjectPerformanceViewSet(viewsets.ModelViewSet):
    """ViewSet for subject performance"""
    serializer_class = SubjectPerformanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'subject', 'classroom', 'academic_year', 'trend']
    ordering = ['-academic_year', 'subject']
    
    def get_queryset(self):
        """Filter subject performance based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return SubjectPerformance.objects.none()
        
        if user.role == 'teacher':
            return SubjectPerformance.objects.filter(classroom__teacher=user)
        
        elif user.role == 'student':
            return SubjectPerformance.objects.filter(student=user)
        
        elif user.role == 'parent':
            children = user.children_relationships.values_list('student_id', flat=True)
            return SubjectPerformance.objects.filter(student_id__in=children)
        
        elif user.role == 'admin':
            return SubjectPerformance.objects.all()
        
        return SubjectPerformance.objects.none()
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get performance trends for student"""
        student_id = request.query_params.get('student_id')
        
        if not student_id:
            if request.user.role == 'student':
                student_id = request.user.id
            else:
                return Response(
                    {'error': 'student_id required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        performances = self.get_queryset().filter(student_id=student_id).order_by('academic_year', 'subject')
        
        return Response({
            'improving_subjects': performances.filter(trend='improving').count(),
            'stable_subjects': performances.filter(trend='stable').count(),
            'declining_subjects': performances.filter(trend='declining').count(),
            'subject_details': SubjectPerformanceSerializer(performances, many=True).data
        })


class ProgressReportViewSet(viewsets.ModelViewSet):
    """ViewSet for progress reports"""
    serializer_class = ProgressReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'classroom', 'report_type', 'academic_year']
    ordering = ['-generated_at']
    
    def get_queryset(self):
        """Filter reports based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return ProgressReport.objects.none()
        
        if user.role == 'teacher':
            return ProgressReport.objects.filter(classroom__teacher=user)
        
        elif user.role == 'student':
            return ProgressReport.objects.filter(student=user)
        
        elif user.role == 'parent':
            children = user.children_relationships.values_list('student_id', flat=True)
            return ProgressReport.objects.filter(student_id__in=children)
        
        elif user.role == 'admin':
            return ProgressReport.objects.all()
        
        return ProgressReport.objects.none()
    
    def perform_create(self, serializer):
        """Generate progress report"""
        serializer.save(generated_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def share_with_parent(self, request, pk=None):
        """Share report with parent"""
        report = self.get_object()
        report.shared_with_parent = True
        report.save()
        
        # TODO: Send notification to parent
        
        return Response({'message': 'Report shared with parent'})
    
    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """Generate PDF version of report"""
        report = self.get_object()
        
        # TODO: Implement PDF generation
        
        return Response({
            'message': 'PDF generation coming soon',
            'status': 'not_implemented'
        })


class PerformanceMetricViewSet(viewsets.ModelViewSet):
    """ViewSet for performance metrics"""
    serializer_class = PerformanceMetricSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'metric_type', 'is_achieved']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter metrics based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return PerformanceMetric.objects.none()
        
        if user.role in ['teacher', 'admin']:
            return PerformanceMetric.objects.all()
        
        elif user.role == 'student':
            return PerformanceMetric.objects.filter(student=user)
        
        elif user.role == 'parent':
            children = user.children_relationships.values_list('student_id', flat=True)
            return PerformanceMetric.objects.filter(student_id__in=children)
        
        return PerformanceMetric.objects.none()
    
    def perform_create(self, serializer):
        """Create metric with tracker"""
        serializer.save(tracked_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update metric progress"""
        metric = self.get_object()
        new_value = request.data.get('current_value')
        
        if new_value is None:
            return Response(
                {'error': 'current_value required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        metric.current_value = new_value
        
        # Calculate progress
        if metric.target_value > 0:
            metric.progress_percentage = min(100, (float(new_value) / float(metric.target_value)) * 100)
        
        # Check if achieved
        if metric.current_value >= metric.target_value and not metric.is_achieved:
            metric.is_achieved = True
            metric.achieved_at = timezone.now()
        
        metric.save()
        
        return Response(PerformanceMetricSerializer(metric).data)
