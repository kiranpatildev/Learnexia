"""
Serializers for notes app
"""

from rest_framework import serializers
from django.utils import timezone
from .models import (
    NoteTemplate, LectureNote, StudentNoteBookmark,
    StudentNoteView, StudentPersonalNote
)
from apps.accounts.models import User
from apps.schools.models import Classroom
from apps.lectures.models import Lecture


class ClassroomBasicSerializer(serializers.ModelSerializer):
    """Basic classroom info"""
    class Meta:
        model = Classroom
        fields = ['id', 'grade', 'section', 'subject']
        read_only_fields = fields


class TeacherBasicSerializer(serializers.ModelSerializer):
    """Basic teacher info"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email']
        read_only_fields = fields


class LectureBasicSerializer(serializers.ModelSerializer):
    """Basic lecture info"""
    class Meta:
        model = Lecture
        fields = ['id', 'title', 'chapter', 'topic']
        read_only_fields = fields


class NoteTemplateSerializer(serializers.ModelSerializer):
    """Serializer for note templates"""
    usage_count = serializers.SerializerMethodField()
    
    class Meta:
        model = NoteTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by']
    
    def get_usage_count(self, obj):
        """Count how many notes use this template"""
        return LectureNote.objects.filter(template=obj, is_deleted=False).count()


class LectureNoteSerializer(serializers.ModelSerializer):
    """
    Full serializer for lecture notes
    """
    classroom_detail = ClassroomBasicSerializer(source='classroom', read_only=True)
    teacher_detail = TeacherBasicSerializer(source='teacher', read_only=True)
    lecture_detail = LectureBasicSerializer(source='lecture', read_only=True)
    
    is_bookmarked = serializers.SerializerMethodField()
    student_annotations_count = serializers.SerializerMethodField()
    has_ai_content = serializers.SerializerMethodField()
    
    class Meta:
        model = LectureNote
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'teacher',
            'view_count', 'download_count', 'bookmark_count',
            'published_at', 'auto_generated_at', 'pdf_generated_at',
            'classroom_detail', 'teacher_detail', 'lecture_detail'
        ]
    
    def get_is_bookmarked(self, obj):
        """Check if current student has bookmarked this note"""
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return StudentNoteBookmark.objects.filter(note=obj, student=request.user).exists()
        return None
    
    def get_student_annotations_count(self, obj):
        """Count of student annotations (for teachers)"""
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'teacher':
            return StudentPersonalNote.objects.filter(lecture_note=obj, is_deleted=False).count()
        return None
    
    def get_has_ai_content(self, obj):
        """Check if note has AI-generated content"""
        return obj.is_auto_generated
    
    def validate(self, data):
        """Validate note data"""
        # Ensure title is not empty
        if 'title' in data and not data['title'].strip():
            raise serializers.ValidationError({'title': 'Title cannot be empty'})
        
        # If lecture is provided, verify teacher has access
        lecture = data.get('lecture')
        if lecture:
            request = self.context.get('request')
            if request and request.user.role == 'teacher':
                if lecture.teacher != request.user:
                    raise serializers.ValidationError({
                        'lecture': 'You can only create notes for your own lectures'
                    })
        
        return data


class LectureNoteListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views
    """
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    is_bookmarked = serializers.SerializerMethodField()
    
    class Meta:
        model = LectureNote
        fields = [
            'id', 'title', 'summary', 'classroom', 'lecture',
            'teacher_name', 'is_published', 'is_auto_generated',
            'created_at', 'updated_at', 'view_count', 'bookmark_count',
            'is_bookmarked'
        ]
        read_only_fields = fields
    
    def get_is_bookmarked(self, obj):
        """Check if current student has bookmarked"""
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return StudentNoteBookmark.objects.filter(note=obj, student=request.user).exists()
        return None


class StudentNoteBookmarkSerializer(serializers.ModelSerializer):
    """Serializer for student bookmarks"""
    note_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentNoteBookmark
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'student']
    
    def get_note_detail(self, obj):
        """Get basic note info"""
        return {
            'id': obj.note.id,
            'title': obj.note.title,
            'lecture_title': obj.note.lecture.title if obj.note.lecture else None
        }


class StudentNoteViewSerializer(serializers.ModelSerializer):
    """Serializer for note view tracking"""
    note_detail = serializers.SerializerMethodField()
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = StudentNoteView
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'viewed_at', 'student']
    
    def get_note_detail(self, obj):
        """Get basic note info"""
        return {
            'id': obj.note.id,
            'title': obj.note.title
        }


class StudentPersonalNoteSerializer(serializers.ModelSerializer):
    """Serializer for student personal notes/annotations"""
    note_title = serializers.CharField(source='lecture_note.title', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = StudentPersonalNote
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'student']
