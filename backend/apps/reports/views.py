"""
Views for reports app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.utils import timezone
from django.http import FileResponse
import os

from .models import ReportTemplate, Report, ReportSchedule, DataExport
from .serializers import (
    ReportTemplateSerializer, ReportSerializer,
    ReportScheduleSerializer, DataExportSerializer
)
from apps.core.permissions import IsTeacher


class ReportTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for report templates"""
    serializer_class = ReportTemplateSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['report_type', 'is_active', 'is_default']
    
    def get_queryset(self):
        return ReportTemplate.objects.filter(is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet for reports"""
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['report_type', 'status', 'student', 'classroom', 'file_format']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter reports based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return Report.objects.none()
        
        if user.role == 'teacher':
            # Teachers see reports for their classrooms
            return Report.objects.filter(classroom__teacher=user)
        
        elif user.role == 'student':
            # Students see their own reports
            return Report.objects.filter(student=user)
        
        elif user.role == 'parent':
            # Parents see their children's reports
            children = user.children_relationships.values_list('student_id', flat=True)
            return Report.objects.filter(student_id__in=children)
        
        elif user.role == 'admin':
            # Admins see all reports
            return Report.objects.all()
        
        return Report.objects.none()
    
    def perform_create(self, serializer):
        """Create report request"""
        serializer.save(generated_by=self.request.user)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def generate(self, request):
        """
        Generate a report
        
        Payload:
        {
            "report_type": "student_report_card",
            "student_id": "uuid",
            "template_id": "uuid" (optional),
            "file_format": "pdf",
            "parameters": {
                "academic_year": "2025-2026",
                "semester": "semester1"
            }
        }
        """
        report_type = request.data.get('report_type')
        student_id = request.data.get('student_id')
        classroom_id = request.data.get('classroom_id')
        template_id = request.data.get('template_id')
        file_format = request.data.get('file_format', 'pdf')
        parameters = request.data.get('parameters', {})
        
        if not report_type:
            return Response(
                {'error': 'report_type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get template
        template = None
        if template_id:
            try:
                template = ReportTemplate.objects.get(id=template_id)
            except ReportTemplate.DoesNotExist:
                pass
        
        # Create report record
        report = Report.objects.create(
            report_type=report_type,
            template=template,
            student_id=student_id,
            classroom_id=classroom_id,
            file_format=file_format,
            parameters=parameters,
            generated_by=request.user,
            status='pending'
        )
        
        # TODO: Trigger async report generation with Celery
        # generate_report_task.delay(report.id)
        
        # For now, mark as processing
        report.status = 'processing'
        report.save()
        
        return Response({
            'message': 'Report generation started',
            'report_id': str(report.id),
            'status': 'processing'
        }, status=status.HTTP_202_ACCEPTED)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download generated report"""
        report = self.get_object()
        
        if report.status != 'completed':
            return Response(
                {'error': f'Report is {report.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not report.file:
            return Response(
                {'error': 'Report file not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return FileResponse(
            report.file.open('rb'),
            as_attachment=True,
            filename=os.path.basename(report.file.name)
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def share(self, request, pk=None):
        """Share report with users"""
        report = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        if not user_ids:
            return Response(
                {'error': 'user_ids required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.accounts.models import User
        users = User.objects.filter(id__in=user_ids)
        report.shared_with.set(users)
        report.is_shared = True
        report.save()
        
        return Response({
            'message': f'Report shared with {users.count()} users'
        })


class ReportScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for report schedules"""
    serializer_class = ReportScheduleSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['frequency', 'is_active', 'classroom']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return ReportSchedule.objects.all()
        elif user.role == 'teacher':
            return ReportSchedule.objects.filter(created_by=user)
        
        return ReportSchedule.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def run_now(self, request, pk=None):
        """Run scheduled report immediately"""
        schedule = self.get_object()
        
        # TODO: Trigger report generation
        # run_scheduled_report.delay(schedule.id)
        
        return Response({
            'message': 'Report generation triggered',
            'schedule_id': str(schedule.id)
        })


class DataExportViewSet(viewsets.ModelViewSet):
    """ViewSet for data exports"""
    serializer_class = DataExportSerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['export_type', 'file_format']
    ordering = ['-exported_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return DataExport.objects.all()
        elif user.role == 'teacher':
            return DataExport.objects.filter(exported_by=user)
        
        return DataExport.objects.none()
    
    @action(detail=False, methods=['post'])
    def export_grades(self, request):
        """
        Export grades to Excel/CSV
        
        Payload:
        {
            "classroom_id": "uuid",
            "file_format": "excel",
            "filters": {
                "academic_year": "2025-2026",
                "semester": "semester1"
            }
        }
        """
        classroom_id = request.data.get('classroom_id')
        file_format = request.data.get('file_format', 'excel')
        filters = request.data.get('filters', {})
        
        if not classroom_id:
            return Response(
                {'error': 'classroom_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create export record
        export = DataExport.objects.create(
            export_type='grades',
            name=f'Grades Export - {timezone.now().strftime("%Y-%m-%d")}',
            file_format=file_format,
            filters=filters,
            exported_by=request.user
        )
        
        # TODO: Implement actual export logic with pandas/openpyxl
        # export_grades_to_file.delay(export.id)
        
        return Response({
            'message': 'Export started',
            'export_id': str(export.id)
        }, status=status.HTTP_202_ACCEPTED)
    
    @action(detail=False, methods=['post'])
    def export_attendance(self, request):
        """Export attendance data"""
        classroom_id = request.data.get('classroom_id')
        file_format = request.data.get('file_format', 'excel')
        filters = request.data.get('filters', {})
        
        if not classroom_id:
            return Response(
                {'error': 'classroom_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        export = DataExport.objects.create(
            export_type='attendance',
            name=f'Attendance Export - {timezone.now().strftime("%Y-%m-%d")}',
            file_format=file_format,
            filters=filters,
            exported_by=request.user
        )
        
        # TODO: Implement export
        
        return Response({
            'message': 'Export started',
            'export_id': str(export.id)
        }, status=status.HTTP_202_ACCEPTED)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download export file"""
        export = self.get_object()
        
        if not export.file:
            return Response(
                {'error': 'Export file not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return FileResponse(
            export.file.open('rb'),
            as_attachment=True,
            filename=os.path.basename(export.file.name)
        )
