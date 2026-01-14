"""
Serializers for behavior app
"""

from rest_framework import serializers
from django.utils import timezone
from .models import BehaviorIncident, BehaviorNote, BehaviorStatistics


class BehaviorIncidentSerializer(serializers.ModelSerializer):
    """
    Serializer for behavior incidents
    
    Supports both manual and AI-generated incidents
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    lecture_title = serializers.CharField(source='lecture.title', read_only=True)
    
    # Display fields
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    class Meta:
        model = BehaviorIncident
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'reported_by',
            'student_notified', 'student_notified_at',
            'parent_notified', 'parent_notified_at',
            'resolved_at', 'resolved_by',
            # AI fields (will be set by AI system later)
            'is_ai_generated', 'ai_confidence_score',
            'ai_transcript_snippet', 'lecture_timestamp'
        ]
    
    def validate(self, data):
        """Validate incident data"""
        # If linked to lecture, ensure lecture belongs to classroom
        if data.get('lecture') and data.get('classroom'):
            if data['lecture'].classroom != data['classroom']:
                raise serializers.ValidationError({
                    'lecture': 'Lecture must belong to the specified classroom'
                })
        
        # Ensure student is enrolled in classroom
        from apps.schools.models import ClassroomEnrollment
        if data.get('student') and data.get('classroom'):
            if not ClassroomEnrollment.objects.filter(
                student=data['student'],
                classroom=data['classroom'],
                is_active=True
            ).exists():
                raise serializers.ValidationError({
                    'student': 'Student must be enrolled in the specified classroom'
                })
        
        return data


class BehaviorNoteSerializer(serializers.ModelSerializer):
    """
    Serializer for behavior notes
    
    Supports both manual and AI-generated notes
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    lecture_title = serializers.CharField(source='lecture.title', read_only=True)
    
    note_type_display = serializers.CharField(source='get_note_type_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    class Meta:
        model = BehaviorNote
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'teacher',
            # AI fields (will be set by AI system later)
            'is_ai_generated', 'ai_transcript_snippet', 'lecture_timestamp'
        ]


class BehaviorStatisticsSerializer(serializers.ModelSerializer):
    """Serializer for behavior statistics"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    
    class Meta:
        model = BehaviorStatistics
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_updated']
