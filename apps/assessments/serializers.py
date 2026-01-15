"""
Serializers for assessments app
"""

from rest_framework import serializers
from .models import Quiz, Question, QuestionOption, QuizAttempt, QuizAnswer


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuizSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    question_count = serializers.SerializerMethodField()
    attempt_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'teacher', 'ai_generated_at']
    
    def get_question_count(self, obj):
        return obj.questions.filter(is_deleted=False).count()
    
    def get_attempt_count(self, obj):
        return obj.attempts.count()


class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'is_ai_graded', 'ai_feedback']


class QuizAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    answers = QuizAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'student', 'started_at', 'submitted_at', 'is_ai_graded']


# ============================================================================
# AI QUIZ GENERATION SERIALIZERS
# ============================================================================

class QuizGenerationRequestSerializer(serializers.Serializer):
    """
    Serializer for AI quiz generation request
    """
    
    difficulty = serializers.ChoiceField(
        choices=['EASY', 'MEDIUM', 'HARD'],
        default='MEDIUM',
        help_text='Quiz difficulty level (EASY: recall, MEDIUM: application, HARD: analysis)'
    )
    
    length = serializers.ChoiceField(
        choices=[5, 10, 15],
        default=10,
        help_text='Number of questions to generate'
    )
    
    force_regenerate = serializers.BooleanField(
        default=False,
        help_text='Regenerate quiz even if one already exists'
    )
    
    auto_publish = serializers.BooleanField(
        default=False,
        help_text='Automatically publish quiz after generation (not recommended - review first)'
    )
    
    def validate(self, data):
        """Validate generation request"""
        # Convert length to int if it's a string
        if 'length' in data:
            data['length'] = int(data['length'])
        return data


class QuizGenerationResponseSerializer(serializers.Serializer):
    """
    Serializer for AI quiz generation response
    """
    
    success = serializers.BooleanField()
    message = serializers.CharField()
    
    # Data fields (only if success=True)
    quiz_id = serializers.UUIDField(required=False)
    title = serializers.CharField(required=False)
    difficulty = serializers.CharField(required=False)
    question_count = serializers.IntegerField(required=False)
    preview = serializers.CharField(required=False, help_text='First 500 characters')
    
    # Error field (only if success=False)
    error_code = serializers.CharField(required=False)
