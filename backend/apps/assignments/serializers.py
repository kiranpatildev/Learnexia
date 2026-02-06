"""
Serializers for assignments app - Production Grade
"""

from rest_framework import serializers
from django.utils import timezone
from .models import (
    Assignment,
    AssignmentQuestion,
    RubricCriterion,
    AssignmentSubmission,
    AssignmentGrade,
    RubricScore,
    GradingAuditLog
)


class AssignmentQuestionSerializer(serializers.ModelSerializer):
    """Serializer for assignment questions"""
    
    class Meta:
        model = AssignmentQuestion
        fields = [
            'id',
            'question_number',
            'question_text',
            'expected_answer_keywords',
            'expected_answer_length',
            'grading_notes',
            'marks',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RubricCriterionSerializer(serializers.ModelSerializer):
    """Serializer for rubric criteria"""
    
    class Meta:
        model = RubricCriterion
        fields = [
            'id',
            'criterion_name',
            'description',
            'weight_percentage',
            'order'
        ]
        read_only_fields = ['id']


class AssignmentSerializer(serializers.ModelSerializer):
    """Serializer for assignments with nested questions and rubric"""
    
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    questions = AssignmentQuestionSerializer(many=True, read_only=True)
    rubric_criteria = RubricCriterionSerializer(many=True, read_only=True)
    submission_stats = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'instructions',
            'created_by',
            'created_by_name',
            'classroom',
            'classroom_name',
            'source_lecture',
            'submission_type',
            'difficulty',
            'assignment_format',
            'total_marks',
            'pass_marks',
            'grading_method',
            'grading_type',
            'is_ai_generated',
            'ai_generation_prompt',
            'ai_generation_cost',
            'generation_tokens',
            'ai_generated_at',
            'due_date',
            'allow_late_submission',
            'late_penalty_per_day',
            'is_published',
            'published_at',
            'created_at',
            'updated_at',
            'questions',
            'rubric_criteria',
            'submission_stats',
            'is_overdue'
        ]
        read_only_fields = [
            'id',
            'created_by',
            'ai_generation_cost',
            'generation_tokens',
            'ai_generated_at',
            'published_at',
            'created_at',
            'updated_at'
        ]
    
    def get_submission_stats(self, obj):
        return obj.submission_stats

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Add submission type flag for frontend as requested
        data['requires_pdf_upload'] = (instance.submission_type == 'offline')
        data['requires_text_input'] = (instance.submission_type == 'online')
        
        return data


class AssignmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating assignments with questions and rubric"""
    
    questions = AssignmentQuestionSerializer(many=True, required=False)
    rubric_criteria = RubricCriterionSerializer(many=True, required=False)
    
    class Meta:
        model = Assignment
        fields = [
            'title',
            'description',
            'instructions',
            'classroom',
            'source_lecture',
            'submission_type',
            'difficulty',
            'assignment_format',
            'total_marks',
            'pass_marks',
            'grading_method',
            'grading_type',
            'due_date',
            'allow_late_submission',
            'late_penalty_per_day',
            'is_published',
            'questions',
            'rubric_criteria'
        ]
    
    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        rubric_data = validated_data.pop('rubric_criteria', [])
        
        assignment = Assignment.objects.create(**validated_data)
        
        # Create questions
        for question_data in questions_data:
            AssignmentQuestion.objects.create(assignment=assignment, **question_data)
        
        # Create rubric criteria
        for criterion_data in rubric_data:
            RubricCriterion.objects.create(assignment=assignment, **criterion_data)
        
        return assignment


class RubricScoreSerializer(serializers.ModelSerializer):
    """Serializer for rubric scores"""
    
    criterion_name = serializers.CharField(source='criterion.criterion_name', read_only=True)
    weight_percentage = serializers.IntegerField(source='criterion.weight_percentage', read_only=True)
    weighted_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = RubricScore
        fields = [
            'id',
            'criterion',
            'criterion_name',
            'score',
            'ai_suggested_score',
            'feedback',
            'weight_percentage',
            'weighted_score',
            'created_at'
        ]
        read_only_fields = ['id', 'ai_suggested_score', 'created_at']


class AssignmentGradeSerializer(serializers.ModelSerializer):
    """Serializer for assignment grades"""
    
    student_name = serializers.CharField(source='submission.student.get_full_name', read_only=True)
    assignment_title = serializers.CharField(source='submission.assignment.title', read_only=True)
    rubric_scores = RubricScoreSerializer(many=True, read_only=True)
    passed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = AssignmentGrade
        fields = [
            'id',
            'submission',
            'student_name',
            'assignment_title',
            'score',
            'max_score',
            'percentage',
            'overall_feedback',
            'teacher_comments',
            'ai_suggested_score',
            'ai_feedback',
            'ai_grading_data',
            'ai_grading_cost',
            'ai_grading_tokens',
            'graded_by',
            'teacher_modified_ai_score',
            'is_published',
            'published_at',
            'created_at',
            'updated_at',
            'rubric_scores',
            'passed'
        ]
        read_only_fields = [
            'id',
            'percentage',
            'ai_suggested_score',
            'ai_feedback',
            'ai_grading_data',
            'ai_grading_cost',
            'ai_grading_tokens',
            'published_at',
            'created_at',
            'updated_at'
        ]


import json

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for assignment submissions"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    assignment_total_marks = serializers.IntegerField(source='assignment.total_marks', read_only=True)
    grade = AssignmentGradeSerializer(read_only=True)
    file_size_mb = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = [
            'id',
            'assignment',
            'assignment_title',
            'assignment_total_marks',
            'student',
            'student_name',
            'answers',
            'uploaded_file',
            'submission_method',
            'file_size_bytes',
            'file_size_mb',
            'status',
            'submitted_at',
            'graded_at',
            'is_late',
            'days_late',
            'created_at',
            'updated_at',
            'grade'
        ]
        read_only_fields = [
            'id',
            'student',
            'submitted_at',
            'graded_at',
            'is_late',
            'days_late',
            'created_at',
            'created_at',
            'updated_at'
        ]

    def to_internal_value(self, data):
        # Handle JSON fields when sent as strings (multipart/form-data)
        if hasattr(data, '_mutable'):
            data._mutable = True
            
        if 'answers' in data and isinstance(data['answers'], str):
            try:
                # Only parse if it looks like JSON
                if data['answers'].strip().startswith('{'):
                    data['answers'] = json.loads(data['answers'])
            except json.JSONDecodeError:
                pass
                
        if 'ai_grading_data' in data and isinstance(data['ai_grading_data'], str):
            try:
                if data['ai_grading_data'].strip().startswith('{'):
                    data['ai_grading_data'] = json.loads(data['ai_grading_data'])
            except json.JSONDecodeError:
                pass
                
        if hasattr(data, '_mutable'):
            data._mutable = False
            
        return super().to_internal_value(data)
    
    def validate_uploaded_file(self, value):
        """Validate PDF file size (max 5MB)"""
        if value:
            if value.size > 5 * 1024 * 1024:  # 5MB
                raise serializers.ValidationError("File size cannot exceed 5MB")
            if not value.name.lower().endswith('.pdf'):
                raise serializers.ValidationError("Only PDF files are allowed")
        return value


class GradingAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for grading audit logs"""
    
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = GradingAuditLog
        fields = [
            'id',
            'grade',
            'action',
            'performed_by',
            'performed_by_name',
            'old_score',
            'new_score',
            'notes',
            'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


# Simplified serializers for list views
class AssignmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for assignment lists"""
    
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    submission_count = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'classroom',
            'classroom_name',
            'submission_type',
            'total_marks',
            'due_date',
            'is_published',
            'is_overdue',
            'submission_count',
            'created_at'
        ]
    
    def get_submission_count(self, obj):
        stats = obj.submission_stats
        return {
            'submitted': stats['submitted'],
            'total': stats['total_students']
        }


class SubmissionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for submission lists"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    has_grade = serializers.SerializerMethodField()
    
    class Meta:
        model = AssignmentSubmission
        fields = [
            'id',
            'assignment',
            'assignment_title',
            'student',
            'student_name',
            'status',
            'submitted_at',
            'is_late',
            'has_grade',
            'created_at'
        ]
    
    def get_has_grade(self, obj):
        return hasattr(obj, 'grade')
