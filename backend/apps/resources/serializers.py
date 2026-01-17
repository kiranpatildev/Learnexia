"""
Serializers for resources app
"""

from rest_framework import serializers
from .models import Resource, ResourceCategory, ResourceDownload


class ResourceCategorySerializer(serializers.ModelSerializer):
    """Serializer for resource categories"""
    resource_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ResourceCategory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_resource_count(self, obj):
        return obj.resources.filter(is_deleted=False).count()


class ResourceSerializer(serializers.ModelSerializer):
    """Serializer for resources"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    file_icon = serializers.SerializerMethodField()
    is_accessible = serializers.SerializerMethodField()
    has_downloaded = serializers.SerializerMethodField()
    
    class Meta:
        model = Resource
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'uploaded_by',
            'download_count', 'view_count', 'file_size', 'file_type'
        ]
    
    def get_file_icon(self, obj):
        """Return icon based on file type"""
        if not obj.file_type:
            return 'file'
        
        icons = {
            'pdf': 'file-pdf',
            'doc': 'file-word', 'docx': 'file-word',
            'xls': 'file-excel', 'xlsx': 'file-excel',
            'ppt': 'file-powerpoint', 'pptx': 'file-powerpoint',
            'jpg': 'file-image', 'jpeg': 'file-image', 'png': 'file-image', 'gif': 'file-image',
            'mp4': 'file-video', 'avi': 'file-video',
            'mp3': 'file-audio',
            'zip': 'file-archive',
        }
        return icons.get(obj.file_type.lower(), 'file')
    
    def get_is_accessible(self, obj):
        """Check if current user can access this resource"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Admins can access all
        if user.role == 'admin':
            return True
        
        # Uploader can access
        if obj.uploaded_by == user:
            return True
        
        # Public resources
        if obj.access_level == 'public':
            return True
        
        # Teachers only
        if obj.access_level == 'teachers_only' and user.role == 'teacher':
            return True
        
        # Classroom-specific
        if obj.access_level == 'classroom_only' and obj.classroom:
            from apps.schools.models import ClassroomEnrollment
            if user.role == 'student':
                return ClassroomEnrollment.objects.filter(
                    classroom=obj.classroom, student=user, is_active=True
                ).exists()
            elif user.role == 'parent':
                children = user.children_relationships.values_list('student_id', flat=True)
                return ClassroomEnrollment.objects.filter(
                    classroom=obj.classroom, student_id__in=children, is_active=True
                ).exists()
        
        return False
    
    def get_has_downloaded(self, obj):
        """Check if current user has downloaded"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        return ResourceDownload.objects.filter(
            resource=obj, user=request.user
        ).exists()
    
    def validate(self, data):
        """Validate resource data"""
        # Either file or external_link required
        if not data.get('file') and not data.get('external_link'):
            raise serializers.ValidationError({
                'file': 'Either file or external_link is required'
            })
        
        # Cannot have both
        if data.get('file') and data.get('external_link'):
            raise serializers.ValidationError({
                'file': 'Cannot have both file and external_link'
            })
        
        # Validate file size
        if data.get('file') and data['file'].size > 100 * 1024 * 1024:  # 100MB
            raise serializers.ValidationError({
                'file': 'File size cannot exceed 100MB'
            })
        
        return data


class ResourceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_icon = serializers.SerializerMethodField()
    
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'resource_type', 'category_name',
            'uploaded_by_name', 'created_at', 'download_count', 'file_size',
            'file_icon', 'thumbnail'
        ]
    
    def get_file_icon(self, obj):
        if not obj.file_type:
            return 'file'
        icons = {
            'pdf': 'file-pdf', 'doc': 'file-word', 'docx': 'file-word',
            'xls': 'file-excel', 'xlsx': 'file-excel',
            'jpg': 'file-image', 'png': 'file-image',
            'mp4': 'file-video', 'mp3': 'file-audio',
        }
        return icons.get(obj.file_type.lower(), 'file')


class ResourceDownloadSerializer(serializers.ModelSerializer):
    """Serializer for download tracking"""
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = ResourceDownload
        fields = '__all__'
        read_only_fields = ['id', 'user', 'downloaded_at', 'ip_address']
