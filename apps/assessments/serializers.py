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
