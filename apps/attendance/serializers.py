"""
Serializers for attendance app
"""

from rest_framework import serializers
from .models import AttendanceSession, AttendanceRecord, AttendanceStatistics


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'parent_notified_at']


class AttendanceSessionSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    records = AttendanceRecordSerializer(many=True, read_only=True)
    present_count = serializers.SerializerMethodField()
    absent_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceSession
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'teacher', 'finalized_at']
    
    def get_present_count(self, obj):
        return obj.records.filter(status='present').count()
    
    def get_absent_count(self, obj):
        return obj.records.filter(status='absent').count()


class AttendanceStatisticsSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    
    class Meta:
        model = AttendanceStatistics
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_updated']
