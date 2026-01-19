"""
Views for flashcards app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django.utils import timezone
from django.db.models import Q, Count, Avg

from .models import (
    FlashcardSet, Flashcard, StudentFlashcardProgress,
    StudentFlashcardSetView
)
from .serializers import (
    FlashcardSetSerializer, FlashcardSerializer,
    StudentFlashcardProgressSerializer
)
from apps.core.permissions import IsTeacher, IsStudent
from apps.schools.models import ClassroomEnrollment


class FlashcardSetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing flashcard sets
    
    Teachers can create, update, and delete their own sets.
    Students can view published sets from enrolled classrooms.
    """
    serializer_class = FlashcardSetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['classroom', 'lecture', 'is_published', 'teacher']
    search_fields = ['title', 'description', 'lecture__title']
    ordering_fields = ['created_at', 'published_at', 'title', 'view_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter flashcard sets based on user role"""
        user = self.request.user
        
        if user.role == 'teacher':
            # Teachers see their own flashcard sets
            return FlashcardSet.objects.filter(
                teacher=user
            ).select_related('lecture', 'classroom', 'teacher').prefetch_related('flashcards')
        
        elif user.role == 'student':
            # Students see published flashcard sets from enrolled classrooms
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user,
                is_active=True
            ).values_list('classroom_id', flat=True)
            
            return FlashcardSet.objects.filter(
                classroom_id__in=enrolled_classrooms,
                is_published=True
            ).select_related('lecture', 'classroom', 'teacher').prefetch_related('flashcards')
        
        return FlashcardSet.objects.none()
    
    def perform_create(self, serializer):
        """Auto-set teacher to current user"""
        serializer.save(teacher=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """Override list to add error handling"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': str(e),
                'detail': 'Failed to load flashcard sets'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def publish(self, request, pk=None):
        """
        Publish flashcard set to students
        
        Sets is_published=True and published_at timestamp.
        """
        flashcard_set = self.get_object()
        
        if flashcard_set.teacher != request.user:
            return Response(
                {'error': 'You can only publish your own flashcard sets'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        flashcard_set.is_published = True
        flashcard_set.published_at = timezone.now()
        flashcard_set.save()
        
        return Response({
            'message': 'Flashcard set published successfully',
            'published_at': flashcard_set.published_at
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def unpublish(self, request, pk=None):
        """
        Unpublish flashcard set
        
        Sets is_published=False
        """
        flashcard_set = self.get_object()
        
        if flashcard_set.teacher != request.user:
            return Response(
                {'error': 'You can only unpublish your own flashcard sets'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        flashcard_set.is_published = False
        flashcard_set.save()
        
        return Response({'message': 'Flashcard set unpublished successfully'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def track_study(self, request, pk=None):
        """
        Track when student studies a flashcard set
        
        Creates or updates StudentFlashcardSetView record
        """
        flashcard_set = self.get_object()
        
        # Create or update view record
        view, created = StudentFlashcardSetView.objects.get_or_create(
            flashcard_set=flashcard_set,
            student=request.user,
            defaults={'time_spent': 0, 'cards_studied': 0}
        )
        
        # Update time spent and cards studied if provided
        time_spent = request.data.get('time_spent', 0)
        cards_studied = request.data.get('cards_studied', 0)
        
        view.time_spent += time_spent
        view.cards_studied += cards_studied
        view.viewed_at = timezone.now()
        view.save()
        
        # Increment study count on flashcard set
        flashcard_set.study_count += 1
        flashcard_set.save(update_fields=['study_count'])
        
        return Response({
            'message': 'Study session tracked',
            'total_time_spent': view.time_spent,
            'total_cards_studied': view.cards_studied
        })
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsStudent])
    def progress(self, request, pk=None):
        """
        Get student's progress on this flashcard set
        """
        flashcard_set = self.get_object()
        
        # Get all flashcards in set
        flashcards = flashcard_set.flashcards.all()
        total_cards = flashcards.count()
        
        # Get student's progress
        progress_records = StudentFlashcardProgress.objects.filter(
            flashcard__flashcard_set=flashcard_set,
            student=request.user
        )
        
        # Calculate stats
        mastered = progress_records.filter(confidence_level='mastered').count()
        studied = progress_records.exclude(confidence_level='not_studied').count()
        
        return Response({
            'total_cards': total_cards,
            'studied': studied,
            'mastered': mastered,
            'not_studied': total_cards - studied,
            'progress_percentage': (mastered / total_cards * 100) if total_cards > 0 else 0
        })


class FlashcardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing individual flashcards
    
    Teachers can CRUD flashcards in their sets.
    Students can view flashcards and track progress.
    """
    serializer_class = FlashcardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['flashcard_set']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    
    def get_queryset(self):
        """Filter flashcards based on user role"""
        user = self.request.user
        
        if user.role == 'teacher':
            # Teachers see flashcards from their own sets
            return Flashcard.objects.filter(
                flashcard_set__teacher=user
            ).select_related('flashcard_set')
        
        elif user.role == 'student':
            # Students see flashcards from published sets in enrolled classrooms
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user,
                is_active=True
            ).values_list('classroom_id', flat=True)
            
            return Flashcard.objects.filter(
                flashcard_set__classroom_id__in=enrolled_classrooms,
                flashcard_set__is_published=True
            ).select_related('flashcard_set')
        
        return Flashcard.objects.none()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def update_progress(self, request, pk=None):
        """
        Update student's progress on a flashcard
        
        Expects: confidence_level, is_correct (optional)
        """
        flashcard = self.get_object()
        confidence_level = request.data.get('confidence_level')
        is_correct = request.data.get('is_correct')
        
        if not confidence_level:
            return Response(
                {'error': 'confidence_level is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create progress record
        progress, created = StudentFlashcardProgress.objects.get_or_create(
            flashcard=flashcard,
            student=request.user,
            defaults={'confidence_level': confidence_level}
        )
        
        # Update progress
        progress.confidence_level = confidence_level
        progress.times_studied += 1
        
        if is_correct is not None:
            if is_correct:
                progress.times_correct += 1
            else:
                progress.times_incorrect += 1
        
        progress.last_studied_at = timezone.now()
        
        # Calculate next review date based on confidence
        if confidence_level == 'mastered':
            progress.next_review_at = timezone.now() + timezone.timedelta(days=7)
        elif confidence_level == 'easy':
            progress.next_review_at = timezone.now() + timezone.timedelta(days=3)
        elif confidence_level == 'medium':
            progress.next_review_at = timezone.now() + timezone.timedelta(days=1)
        else:  # hard or not_studied
            progress.next_review_at = timezone.now() + timezone.timedelta(hours=4)
        
        progress.save()
        
        serializer = StudentFlashcardProgressSerializer(progress)
        return Response(serializer.data)
