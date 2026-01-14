"""
Serializers for performance app
"""

from rest_framework import serializers
from .models import StudentGrade, SubjectPerformance, ProgressReport, PerformanceMetric


class StudentGradeSerializer(serializers.ModelSerializer):
    """Serializer for student grades"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    rank_display = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentGrade
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'overall_percentage',
            'overall_grade', 'gpa', 'class_rank', 'is_passing', 'is_honor_roll'
        ]
    
    def get_rank_display(self, obj):
        if obj.class_rank and obj.total_students:
            return f"{obj.class_rank}/{obj.total_students}"
        return None


class SubjectPerformanceSerializer(serializers.ModelSerializer):
    """Serializer for subject performance"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    completion_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = SubjectPerformance
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'assignment_average',
            'quiz_average', 'overall_score', 'letter_grade', 'is_improving', 'trend'
        ]
    
    def get_completion_rate(self, obj):
        total = obj.total_assignments + obj.total_quizzes
        completed = obj.completed_assignments + obj.completed_quizzes
        if total == 0:
            return 0
        return round((completed / total) * 100, 2)


class ProgressReportSerializer(serializers.ModelSerializer):
    """Serializer for progress reports"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProgressReport
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'generated_at',
            'generated_by', 'parent_viewed_at'
        ]


class PerformanceMetricSerializer(serializers.ModelSerializer):
    """Serializer for performance metrics"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    tracked_by_name = serializers.CharField(source='tracked_by.get_full_name', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = PerformanceMetric
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'progress_percentage',
            'is_achieved', 'achieved_at'
        ]
    
    def get_days_remaining(self, obj):
        from django.utils import timezone
        if obj.is_achieved:
            return 0
        delta = obj.target_date - timezone.now().date()
        return max(0, delta.days)
