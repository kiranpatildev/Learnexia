"""
Serializers for lectures app
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Lecture, LectureBookmark, LectureView, LectureResource
from apps.accounts.models import User
from apps.schools.models import Classroom


class ClassroomBasicSerializer(serializers.ModelSerializer):
    """Basic classroom info for nested serialization"""
    class Meta:
        model = Classroom
        fields = ['id', 'grade', 'section', 'subject']
        read_only_fields = fields


class TeacherBasicSerializer(serializers.ModelSerializer):
    """Basic teacher info for nested serialization"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email']
        read_only_fields = fields


class StudentBasicSerializer(serializers.ModelSerializer):
    """Basic student info for nested serialization"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email']
        read_only_fields = fields


class LectureSerializer(serializers.ModelSerializer):
    """
    Full lecture serializer with all fields
    """
    classroom_detail = ClassroomBasicSerializer(source='classroom', read_only=True)
    teacher_detail = TeacherBasicSerializer(source='teacher', read_only=True)
    student_progress = serializers.SerializerMethodField()
    has_watched = serializers.SerializerMethodField()
    
    class Meta:
        model = Lecture
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'teacher',
            'view_count', 'download_count', 'shared_at',
            'classroom_detail', 'teacher_detail', 'student_progress', 'has_watched'
        ]
    
    def get_student_progress(self, obj):
        """Get current student's completion percentage"""
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            try:
                view = LectureView.objects.get(lecture=obj, student=request.user)
                return view.completion_percentage
            except LectureView.DoesNotExist:
                return 0
        return None
    
    def get_has_watched(self, obj):
        """Check if current student has started watching"""
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return LectureView.objects.filter(lecture=obj, student=request.user).exists()
        return None
    
    def validate_scheduled_date(self, value):
        """Ensure scheduled date is not in the past for new lectures"""
        if not self.instance and value and value < timezone.now():
            raise serializers.ValidationError("Scheduled date cannot be in the past")
        return value
    
    def validate_audio_file(self, value):
        """Validate audio file type and size"""
        if value:
            # Max 100MB
            if value.size > 100 * 1024 * 1024:
                raise serializers.ValidationError("Audio file size cannot exceed 100MB")
            
            # Check file extension
            allowed_extensions = ['.mp3', '.wav', '.m4a', '.aac']
            if not any(value.name.lower().endswith(ext) for ext in allowed_extensions):
                raise serializers.ValidationError(
                    f"Audio file must be one of: {', '.join(allowed_extensions)}"
                )
        return value
    
    def validate_video_file(self, value):
        """Validate video file type and size"""
        if value:
            # Max 500MB
            if value.size > 500 * 1024 * 1024:
                raise serializers.ValidationError("Video file size cannot exceed 500MB")
            
            # Check file extension
            allowed_extensions = ['.mp4', '.webm', '.mov', '.avi']
            if not any(value.name.lower().endswith(ext) for ext in allowed_extensions):
                raise serializers.ValidationError(
                    f"Video file must be one of: {', '.join(allowed_extensions)}"
                )
        return value
    
    def validate_thumbnail(self, value):
        """Validate thumbnail image"""
        if value:
            # Max 5MB
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Thumbnail size cannot exceed 5MB")
            
            # Check file extension
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
            if not any(value.name.lower().endswith(ext) for ext in allowed_extensions):
                raise serializers.ValidationError(
                    f"Thumbnail must be one of: {', '.join(allowed_extensions)}"
                )
        return value


class LectureListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for lecture list views
    """
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    student_completion = serializers.SerializerMethodField()
    
    class Meta:
        model = Lecture
        fields = [
            'id', 'title', 'chapter', 'topic', 'duration', 'status',
            'is_shared_with_students', 'teacher_name', 'view_count',
            'student_completion', 'created_at', 'scheduled_date'
        ]
        read_only_fields = fields
    
    def get_student_completion(self, obj):
        """Get current student's completion percentage"""
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            try:
                view = LectureView.objects.get(lecture=obj, student=request.user)
                return view.completion_percentage
            except LectureView.DoesNotExist:
                return 0
        return None


class LectureBookmarkSerializer(serializers.ModelSerializer):
    """
    Serializer for lecture bookmarks
    """
    lecture_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = LectureBookmark
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by']
    
    def get_lecture_detail(self, obj):
        """Get basic lecture info"""
        return {
            'id': obj.lecture.id,
            'title': obj.lecture.title
        }
    
    def validate(self, data):
        """Validate bookmark timestamp against lecture duration"""
        lecture = data.get('lecture')
        timestamp = data.get('timestamp')
        
        if lecture and timestamp is not None:
            if timestamp < 0:
                raise serializers.ValidationError({
                    'timestamp': 'Timestamp cannot be negative'
                })
            
            if lecture.duration and timestamp > lecture.duration:
                raise serializers.ValidationError({
                    'timestamp': f'Timestamp cannot exceed lecture duration ({lecture.duration}s)'
                })
        
        return data


class LectureViewSerializer(serializers.ModelSerializer):
    """
    Serializer for lecture view tracking
    """
    student_detail = StudentBasicSerializer(source='student', read_only=True)
    lecture_detail = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = LectureView
        fields = '__all__'
        read_only_fields = ['id', 'started_at', 'completed_at', 'student']
    
    def get_lecture_detail(self, obj):
        """Get basic lecture info"""
        return {
            'id': obj.lecture.id,
            'title': obj.lecture.title
        }
    
    def get_is_completed(self, obj):
        """Check if lecture is completed"""
        return obj.completed_at is not None
    
    def validate_completion_percentage(self, value):
        """Ensure completion percentage is between 0-100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Completion percentage must be between 0 and 100")
        return value
    
    def validate_last_position(self, value):
        """Ensure last position is not negative"""
        if value < 0:
            raise serializers.ValidationError("Last position cannot be negative")
        return value


class LectureResourceSerializer(serializers.ModelSerializer):
    """
    Serializer for lecture resources
    """
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LectureResource
        fields = '__all__'
        read_only_fields = ['id', 'file_size', 'file_type', 'created_at']
    
    def get_download_url(self, obj):
        """Get full URL to download endpoint"""
        request = self.context.get('request')
        if request:
            from django.urls import reverse
            path = reverse('lecture-resource-download', kwargs={'pk': obj.pk})
            return request.build_absolute_uri(path)
        return None
    
    def validate_file(self, value):
        """Validate file type and size"""
        if value:
            # Determine max size based on file type
            file_ext = value.name.lower().split('.')[-1]
            
            # Video files: max 100MB
            video_extensions = ['mp4', 'webm', 'mov', 'avi']
            # Document files: max 50MB
            doc_extensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt']
            # Image files: max 10MB
            image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
            
            if file_ext in video_extensions:
                max_size = 100 * 1024 * 1024  # 100MB
                if value.size > max_size:
                    raise serializers.ValidationError("Video files cannot exceed 100MB")
            elif file_ext in doc_extensions:
                max_size = 50 * 1024 * 1024  # 50MB
                if value.size > max_size:
                    raise serializers.ValidationError("Document files cannot exceed 50MB")
            elif file_ext in image_extensions:
                max_size = 10 * 1024 * 1024  # 10MB
                if value.size > max_size:
                    raise serializers.ValidationError("Image files cannot exceed 10MB")
            else:
                # Default max 50MB for other files
                max_size = 50 * 1024 * 1024
                if value.size > max_size:
                    raise serializers.ValidationError("File size cannot exceed 50MB")
        
        return value
