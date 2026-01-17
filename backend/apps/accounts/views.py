"""
Views for accounts app
"""

from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import update_session_auth_hash

from .models import User, StudentProfile, TeacherProfile, ParentProfile, ParentStudentRelationship
from .serializers import (
    UserSerializer, StudentProfileSerializer, TeacherProfileSerializer,
    ParentProfileSerializer, RegisterSerializer, ChangePasswordSerializer,
    ParentStudentRelationshipSerializer
)
from apps.core.permissions import IsTeacher, IsStudent, IsParent


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    User CRUD operations
    """
    queryset = User.objects.filter(is_deleted=False)
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return User.objects.filter(is_deleted=False)
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Wrong password.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            update_session_auth_hash(request, user)
            
            return Response({'message': 'Password updated successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentProfileViewSet(viewsets.ModelViewSet):
    """
    Student profile operations
    """
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return StudentProfile.objects.filter(user=user)
        elif user.role == 'teacher':
            # Teachers can view all students
            return StudentProfile.objects.all()
        elif user.role == 'parent':
            # Parents can view their children
            student_ids = user.children_relationships.values_list('student_id', flat=True)
            return StudentProfile.objects.filter(user_id__in=student_ids)
        return StudentProfile.objects.all()


class TeacherProfileViewSet(viewsets.ModelViewSet):
    """
    Teacher profile operations
    """
    queryset = TeacherProfile.objects.all()
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAuthenticated]


class ParentProfileViewSet(viewsets.ModelViewSet):
    """
    Parent profile operations
    """
    queryset = ParentProfile.objects.all()
    serializer_class = ParentProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            return ParentProfile.objects.filter(user=user)
        return ParentProfile.objects.all()


class ParentStudentRelationshipViewSet(viewsets.ModelViewSet):
    """
    Parent-student relationship operations
    """
    queryset = ParentStudentRelationship.objects.all()
    serializer_class = ParentStudentRelationshipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            return ParentStudentRelationship.objects.filter(parent=user)
        elif user.role == 'student':
            return ParentStudentRelationship.objects.filter(student=user)
        return ParentStudentRelationship.objects.all()
