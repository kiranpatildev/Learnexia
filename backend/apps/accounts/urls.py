"""
URL Configuration for accounts app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserViewSet, StudentProfileViewSet,
    TeacherProfileViewSet, ParentProfileViewSet,
    ParentStudentRelationshipViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'students', StudentProfileViewSet, basename='student')
router.register(r'teachers', TeacherProfileViewSet, basename='teacher')
router.register(r'parents', ParentProfileViewSet, basename='parent')
router.register(r'relationships', ParentStudentRelationshipViewSet, basename='relationship')

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Router URLs
    path('', include(router.urls)),
]
