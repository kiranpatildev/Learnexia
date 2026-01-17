"""
Serializers for accounts app
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, StudentProfile, TeacherProfile, ParentProfile, ParentStudentRelationship


class UserSerializer(serializers.ModelSerializer):
    """
    Basic user serializer
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone_number', 'avatar', 'is_verified',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']


class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Student profile serializer
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_xp', 'current_level']


class TeacherProfileSerializer(serializers.ModelSerializer):
    """
    Teacher profile serializer
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TeacherProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ParentProfileSerializer(serializers.ModelSerializer):
    """
    Parent profile serializer
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ParentProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    """
    User registration serializer
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name', 'role', 'phone_number']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """
    Change password serializer
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


class ParentStudentRelationshipSerializer(serializers.ModelSerializer):
    """
    Parent-student relationship serializer
    """
    parent_name = serializers.CharField(source='parent.get_full_name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = ParentStudentRelationship
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
