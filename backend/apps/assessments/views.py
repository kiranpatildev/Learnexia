"""
Views for assessments app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db.models import Avg

from .models import Quiz, Question, QuizAttempt
from .serializers import QuizSerializer, QuestionSerializer, QuizAttemptSerializer
from apps.core.permissions import IsTeacher, IsStudent
from apps.schools.models import ClassroomEnrollment


class QuizViewSet(viewsets.ModelViewSet):
    """ViewSet for managing quizzes"""
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['classroom', 'is_published', 'difficulty_level', 'is_ai_generated']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Quiz.objects.none()
        
        if user.role == 'teacher':
            return Quiz.objects.filter(teacher=user, is_deleted=False)
        elif user.role == 'student':
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user, is_active=True
            ).values_list('classroom_id', flat=True)
            return Quiz.objects.filter(
                classroom_id__in=enrolled_classrooms,
                is_published=True,
                is_deleted=False
            )
        elif user.role == 'admin':
            return Quiz.objects.filter(is_deleted=False)
        
        return Quiz.objects.none()
    
    
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """Override list to add error handling and debugging"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"[Quizzes] User: {request.user.email}, Role: {request.user.role}")
            logger.info(f"[Quizzes] Queryset count: {queryset.count()}")
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"[Quizzes] Returning {len(serializer.data)} quizzes")
            return Response(serializer.data)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': str(e),
                'detail': 'Failed to load quizzes'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def publish(self, request, pk=None):
        """Publish quiz"""
        quiz = self.get_object()
        quiz.is_published = True
        quiz.save()
        return Response(self.get_serializer(quiz).data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def generate_ai_questions(self, request, pk=None):
        """AI generate questions - Placeholder"""
        quiz = self.get_object()
        # TODO: Implement AI question generation
        return Response({
            'message': 'AI question generation coming soon',
            'status': 'not_implemented'
        })
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher])
    def analytics(self, request, pk=None):
        """Get quiz analytics"""
        quiz = self.get_object()
        attempts = quiz.attempts.filter(status='graded')
        
        return Response({
            'total_attempts': attempts.count(),
            'unique_students': attempts.values('student').distinct().count(),
            'average_score': attempts.aggregate(avg=Avg('percentage'))['avg'] or 0,
            'pass_rate': attempts.filter(percentage__gte=quiz.passing_percentage).count() / max(attempts.count(), 1) * 100
        })


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing questions"""
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['quiz', 'question_type']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Question.objects.none()
        
        if user.role == 'teacher':
            return Question.objects.filter(quiz__teacher=user, is_deleted=False)
        elif user.role == 'student':
            # Students can see questions from published quizzes in enrolled classrooms
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user,
                is_active=True
            ).values_list('classroom_id', flat=True)
            return Question.objects.filter(
                quiz__classroom_id__in=enrolled_classrooms,
                quiz__is_published=True,
                is_deleted=False
            ).select_related('quiz').prefetch_related('options')
        elif user.role == 'admin':
            return Question.objects.filter(is_deleted=False)
        
        return Question.objects.none()


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """ViewSet for managing quiz attempts"""
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['quiz', 'student', 'status']
    ordering = ['-started_at']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return QuizAttempt.objects.none()
        
        if user.role == 'student':
            return QuizAttempt.objects.filter(student=user)
        elif user.role == 'teacher':
            return QuizAttempt.objects.filter(quiz__teacher=user)
        elif user.role == 'admin':
            return QuizAttempt.objects.all()
        
        return QuizAttempt.objects.none()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def submit(self, request, pk=None):
        """Submit quiz attempt"""
        attempt = self.get_object()
        attempt.submitted_at = timezone.now()
        attempt.status = 'submitted'
        # TODO: Calculate score
        attempt.save()
        
        return Response(self.get_serializer(attempt).data)
