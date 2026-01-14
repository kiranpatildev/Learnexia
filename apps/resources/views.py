"""
Views for resources app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import FileResponse
from django.db.models import Count, Q
from django.utils import timezone
import os

from .models import Resource, ResourceCategory, ResourceDownload
from .serializers import (
    ResourceSerializer, ResourceListSerializer, ResourceCategorySerializer,
    ResourceDownloadSerializer
)
from apps.core.permissions import IsTeacher
from apps.schools.models import ClassroomEnrollment


class ResourceCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for resource categories"""
    serializer_class = ResourceCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['subject', 'grade_level', 'parent_category']
    ordering = ['name']
    
    def get_queryset(self):
        return ResourceCategory.objects.all()
    
    @action(detail=True, methods=['get'])
    def resources(self, request, pk=None):
        """List all resources in this category"""
        category = self.get_object()
        resources = Resource.objects.filter(
            category=category,
            is_deleted=False
        ).select_related('uploaded_by', 'category', 'classroom', 'subject')
        
        serializer = ResourceListSerializer(resources, many=True, context={'request': request})
        return Response(serializer.data)


class ResourceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing resources"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'subject', 'grade_level', 'classroom', 'resource_type', 'access_level']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'download_count', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter resources based on user role and access level"""
        user = self.request.user
        
        if not user.is_authenticated:
            return Resource.objects.none()
        
        if user.role == 'admin':
            # Admins see all resources
            return Resource.objects.filter(is_deleted=False)
        
        elif user.role == 'teacher':
            # Teachers see public resources + their own uploads + classroom resources
            return Resource.objects.filter(
                Q(access_level='public') |
                Q(uploaded_by=user) |
                Q(access_level='teachers_only') |
                Q(classroom__teacher=user),
                is_deleted=False
            ).distinct()
        
        elif user.role == 'student':
            # Students see public + classroom resources they're enrolled in
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user, is_active=True
            ).values_list('classroom_id', flat=True)
            
            return Resource.objects.filter(
                Q(access_level='public') |
                Q(classroom_id__in=enrolled_classrooms, access_level='classroom_only'),
                is_deleted=False
            ).distinct()
        
        elif user.role == 'parent':
            # Parents see public + classroom resources their children can access
            children = user.children_relationships.values_list('student_id', flat=True)
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student_id__in=children, is_active=True
            ).values_list('classroom_id', flat=True)
            
            return Resource.objects.filter(
                Q(access_level='public') |
                Q(classroom_id__in=enrolled_classrooms, access_level='classroom_only'),
                is_deleted=False
            ).distinct()
        
        return Resource.objects.none()
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return ResourceListSerializer
        return ResourceSerializer
    
    def perform_create(self, serializer):
        """Auto-set uploaded_by and extract file metadata"""
        resource = serializer.save(uploaded_by=self.request.user)
        
        # Extract file metadata
        if resource.file:
            resource.file_size = resource.file.size
            resource.file_type = os.path.splitext(resource.file.name)[1][1:].lower()
            resource.save()
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download resource file
        
        Tracks download and increments count
        """
        resource = self.get_object()
        
        # Check if file exists
        if not resource.file:
            return Response(
                {'error': 'This resource is an external link, not a file'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Track download
        ResourceDownload.objects.create(
            resource=resource,
            user=request.user,
            ip_address=self.get_client_ip(request)
        )
        
        # Increment download count
        resource.download_count += 1
        resource.save(update_fields=['download_count'])
        
        # Return file
        return FileResponse(resource.file.open('rb'), as_attachment=True, filename=os.path.basename(resource.file.name))
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher])
    def analytics(self, request, pk=None):
        """
        Get download analytics for resource
        
        Only uploader or admin can view
        """
        resource = self.get_object()
        
        if resource.uploaded_by != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'You can only view analytics for your own resources'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        downloads = resource.downloads.all()
        
        return Response({
            'total_downloads': downloads.count(),
            'unique_users': downloads.values('user').distinct().count(),
            'downloads_by_role': {
                'student': downloads.filter(user__role='student').count(),
                'parent': downloads.filter(user__role='parent').count(),
                'teacher': downloads.filter(user__role='teacher').count(),
            },
            'recent_downloads': ResourceDownloadSerializer(
                downloads[:10], many=True
            ).data
        })
    
    @action(detail=False, methods=['get'])
    def my_uploads(self, request):
        """Get resources uploaded by current user"""
        resources = self.get_queryset().filter(uploaded_by=request.user)
        serializer = self.get_serializer(resources, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recently added resources (last 30 days)"""
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        resources = self.get_queryset().filter(created_at__gte=thirty_days_ago)
        serializer = self.get_serializer(resources, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most downloaded resources"""
        resources = self.get_queryset().order_by('-download_count')[:20]
        serializer = self.get_serializer(resources, many=True)
        return Response(serializer.data)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ResourceDownloadViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing download history"""
    serializer_class = ResourceDownloadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['resource', 'user']
    ordering = ['-downloaded_at']
    
    def get_queryset(self):
        """Filter downloads based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return ResourceDownload.objects.none()
        
        if user.role == 'admin':
            # Admins see all downloads
            return ResourceDownload.objects.all()
        elif user.role == 'teacher':
            # Teachers see downloads for their resources
            return ResourceDownload.objects.filter(resource__uploaded_by=user)
        else:
            # Students/parents see only their own downloads
            return ResourceDownload.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def my_history(self, request):
        """Get current user's download history"""
        downloads = ResourceDownload.objects.filter(user=request.user).select_related('resource')
        serializer = self.get_serializer(downloads, many=True)
        return Response(serializer.data)
