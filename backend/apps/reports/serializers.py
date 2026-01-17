"""
Serializers for reports app
"""

from rest_framework import serializers
from .models import ReportTemplate, Report, ReportSchedule, DataExport


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for report templates"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    
    class Meta:
        model = ReportTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for reports"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    file_format_display = serializers.CharField(source='get_file_format_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'generated_by',
            'generated_at', 'status', 'file', 'file_size', 'error_message'
        ]
    
    def get_download_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class ReportScheduleSerializer(serializers.ModelSerializer):
    """Serializer for report schedules"""
    template_name = serializers.CharField(source='template.name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    
    class Meta:
        model = ReportSchedule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'last_run_date']


class DataExportSerializer(serializers.ModelSerializer):
    """Serializer for data exports"""
    exported_by_name = serializers.CharField(source='exported_by.get_full_name', read_only=True)
    export_type_display = serializers.CharField(source='get_export_type_display', read_only=True)
    file_format_display = serializers.CharField(source='get_file_format_display', read_only=True)
    
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = DataExport
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'exported_by',
            'exported_at', 'file', 'file_size', 'row_count'
        ]
    
    def get_download_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None
