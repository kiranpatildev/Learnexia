"""
Serializers for schools app
"""

from rest_framework import serializers
from .models import School, AcademicYear, Subject, Classroom, ClassroomEnrollment
from apps.accounts.serializers import UserSerializer


class SchoolSerializer(serializers.ModelSerializer):
    """
    School serializer
    """
    class Meta:
        model = School
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'code']


class AcademicYearSerializer(serializers.ModelSerializer):
    """
    Academic year serializer
    """
    school_name = serializers.CharField(source='school.name', read_only=True)
    
    class Meta:
        model = AcademicYear
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubjectSerializer(serializers.ModelSerializer):
    """
    Subject serializer
    """
    class Meta:
        model = Subject
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClassroomSerializer(serializers.ModelSerializer):
    """
    Classroom serializer
    """
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Classroom
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'class_code']
    
    def get_student_count(self, obj):
        return obj.enrollments.filter(is_active=True).count()


class ClassroomEnrollmentSerializer(serializers.ModelSerializer):
    """
    Classroom enrollment serializer
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    user = UserSerializer(source='student', read_only=True)  # Full student user object
    
    class Meta:
        model = ClassroomEnrollment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'enrollment_date']
