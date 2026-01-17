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


# ============================================================================
# AI BEHAVIOR DETECTION SERIALIZERS
# ============================================================================

class BehaviorDetectionRequestSerializer(serializers.Serializer):
    """
    Serializer for AI behavior detection request
    """
    
    sensitivity = serializers.ChoiceField(
        choices=['LOW', 'MEDIUM', 'HIGH'],
        default='MEDIUM',
        help_text='Detection sensitivity (LOW: conservative, MEDIUM: balanced, HIGH: comprehensive)'
    )


class PendingBehaviorDetectionSerializer(serializers.ModelSerializer):
    """
    Serializer for pending behavior detections
    """
    
    lecture_title = serializers.CharField(source='lecture.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    
    class Meta:
        from .models import PendingBehaviorDetection
        model = PendingBehaviorDetection
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'lecture',
            'student_name', 'behavior_type', 'severity',
            'description', 'original_statement',
            'is_positive', 'ai_confidence', 'ai_confidence_score',
            'detection_sensitivity', 'reviewed_by', 'reviewed_at',
            'student_notified', 'parent_notified', 'notification_sent_at',
            'created_incident', 'created_note'
        ]


class BehaviorReviewRequestSerializer(serializers.Serializer):
    """
    Serializer for teacher review of detected behavior
    """
    
    action = serializers.ChoiceField(
        choices=['APPROVE', 'REJECT', 'MODIFY'],
        help_text='Action to take (APPROVE: accept as-is, REJECT: discard, MODIFY: edit before accepting)'
    )
    
    teacher_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Optional teacher comments'
    )
    
    # Modification fields (only for MODIFY action)
    modified_description = serializers.CharField(required=False, allow_blank=True)
    modified_severity = serializers.ChoiceField(
        choices=['minor', 'moderate', 'serious', 'critical'],
        required=False
    )
    modified_behavior_type = serializers.ChoiceField(
        choices=['disruption', 'disrespect', 'tardiness', 'incomplete_work', 'cheating', 'bullying', 'other'],
        required=False
    )
    
    # Notification options
    send_to_student = serializers.BooleanField(default=True)
    send_to_parent = serializers.BooleanField(default=True)
    
    def validate(self, data):
        """Validate review request"""
        action = data.get('action')
        
        # If MODIFY, at least one modification field should be provided
        if action == 'MODIFY':
            has_modification = any([
                data.get('modified_description'),
                data.get('modified_severity'),
                data.get('modified_behavior_type')
            ])
            if not has_modification:
                raise serializers.ValidationError(
                    'At least one modification field must be provided when action is MODIFY'
                )
        
        return data


class BehaviorDetectionResponseSerializer(serializers.Serializer):
    """
    Serializer for AI behavior detection response
    """
    
    success = serializers.BooleanField()
    message = serializers.CharField()
    
    # Data fields (only if success=True)
    detected_count = serializers.IntegerField(required=False)
    pending_behaviors = PendingBehaviorDetectionSerializer(many=True, required=False)
    
    # Error field (only if success=False)
    error_code = serializers.CharField(required=False)
