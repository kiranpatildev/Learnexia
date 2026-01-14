"""
Serializers for assignments app
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Assignment, AssignmentAttachment, AssignmentSubmission, SubmissionFile
from apps.schools.models import Classroom


class AssignmentSerializer(serializers.ModelSerializer):
    """Serializer for assignments"""
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    submission_count = serializers.SerializerMethodField()
    graded_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'teacher', 'assigned_date', 'ai_generated_at']
    
    def get_submission_count(self, obj):
        return obj.submissions.filter(status__in=['submitted', 'graded']).count()
    
    def get_graded_count(self, obj):
        return obj.submissions.filter(status='graded').count()


class AssignmentAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for assignment attachments"""
    class Meta:
        model = AssignmentAttachment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'file_type', 'file_size']


class SubmissionFileSerializer(serializers.ModelSerializer):
    """Serializer for submission files"""
    class Meta:
        model = SubmissionFile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'file_type', 'file_size']


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for assignment submissions"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    files = SubmissionFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'student', 'submitted_at',
            'graded_at', 'graded_by', 'is_ai_graded', 'ai_feedback', 'ai_confidence_score'
        ]
