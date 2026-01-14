"""
Views for notes app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db.models import Count, Avg, Q
from django.http import FileResponse

from .models import (
    NoteTemplate, LectureNote, StudentNoteBookmark,
    StudentNoteView, StudentPersonalNote
)
from .serializers import (
    NoteTemplateSerializer, LectureNoteSerializer, LectureNoteListSerializer,
    StudentNoteBookmarkSerializer, StudentNoteViewSerializer,
    StudentPersonalNoteSerializer
)
from apps.core.permissions import IsTeacher, IsStudent
from apps.schools.models import ClassroomEnrollment


class NoteTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing note templates
    
    Teachers can create and manage templates.
    """
    serializer_class = NoteTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter templates based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return NoteTemplate.objects.none()
        
        if user.role == 'teacher':
            # Teachers see their own templates
            return NoteTemplate.objects.filter(created_by=user)
        elif user.role == 'admin':
            # Admins see all templates
            return NoteTemplate.objects.all()
        
        return NoteTemplate.objects.none()
    
    def perform_create(self, serializer):
        """Auto-set created_by to current user"""
        serializer.save(created_by=self.request.user)


class LectureNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing lecture notes
    
    Teachers can create, update, and delete their own notes.
    Students can view published notes from enrolled classrooms.
    Parents can view notes their children have access to.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['classroom', 'lecture', 'is_published', 'is_auto_generated']
    search_fields = ['title', 'content', 'summary']
    ordering_fields = ['created_at', 'updated_at', 'title', 'view_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter notes based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return LectureNote.objects.none()
        
        if user.role == 'teacher':
            # Teachers see their own notes
            return LectureNote.objects.filter(
                teacher=user,
                is_deleted=False
            ).select_related('classroom', 'teacher', 'lecture')
        
        elif user.role == 'student':
            # Students see published notes from enrolled classrooms
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user,
                is_active=True
            ).values_list('classroom_id', flat=True)
            
            return LectureNote.objects.filter(
                classroom_id__in=enrolled_classrooms,
                is_published=True,
                is_deleted=False
            ).select_related('classroom', 'teacher', 'lecture')
        
        elif user.role == 'parent':
            # Parents see notes their children can access
            children = user.children_relationships.values_list('student_id', flat=True)
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student_id__in=children,
                is_active=True
            ).values_list('classroom_id', flat=True)
            
            return LectureNote.objects.filter(
                classroom_id__in=enrolled_classrooms,
                is_published=True,
                is_deleted=False
            ).select_related('classroom', 'teacher', 'lecture')
        
        elif user.role == 'admin':
            # Admins see all notes
            return LectureNote.objects.filter(
                is_deleted=False
            ).select_related('classroom', 'teacher', 'lecture')
        
        return LectureNote.objects.none()
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return LectureNoteListSerializer
        return LectureNoteSerializer
    
    def perform_create(self, serializer):
        """Auto-set teacher to current user"""
        serializer.save(teacher=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def publish(self, request, pk=None):
        """
        Publish note to students
        
        Sets is_published=True and published_at timestamp.
        """
        note = self.get_object()
        
        # Ensure teacher owns this note
        if note.teacher != request.user:
            return Response(
                {'error': 'You can only publish your own notes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        note.is_published = True
        note.published_at = timezone.now()
        note.save()
        
        # TODO: Send notifications to students
        # notify_students_about_note(note)
        
        serializer = self.get_serializer(note)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def unpublish(self, request, pk=None):
        """
        Unpublish note
        
        Sets is_published=False
        """
        note = self.get_object()
        
        if note.teacher != request.user:
            return Response(
                {'error': 'You can only unpublish your own notes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        note.is_published = False
        note.save()
        
        serializer = self.get_serializer(note)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def duplicate(self, request, pk=None):
        """
        Create a copy of the note
        """
        note = self.get_object()
        
        if note.teacher != request.user:
            return Response(
                {'error': 'You can only duplicate your own notes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create duplicate
        note.pk = None
        note.title = f"{note.title} (Copy)"
        note.is_published = False
        note.published_at = None
        note.view_count = 0
        note.download_count = 0
        note.bookmark_count = 0
        note.save()
        
        serializer = self.get_serializer(note)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher])
    def analytics(self, request, pk=None):
        """
        Get reading analytics for a note
        
        Returns view stats, bookmark stats, and student engagement
        """
        note = self.get_object()
        
        if note.teacher != request.user:
            return Response(
                {'error': 'You can only view analytics for your own notes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all views for this note
        views = StudentNoteView.objects.filter(note=note)
        
        # Get enrolled students
        enrolled_students = ClassroomEnrollment.objects.filter(
            classroom=note.classroom,
            is_active=True
        ).select_related('student')
        
        # Calculate analytics
        total_views = views.count()
        unique_students = views.values('student').distinct().count()
        
        # Average time spent
        avg_time = views.aggregate(avg_time=Avg('time_spent'))['avg_time'] or 0
        
        # Bookmark stats
        total_bookmarks = StudentNoteBookmark.objects.filter(note=note).count()
        
        # Annotation stats
        total_annotations = StudentPersonalNote.objects.filter(
            lecture_note=note,
            is_deleted=False
        ).count()
        
        # Students who haven't viewed
        viewed_student_ids = views.values_list('student_id', flat=True)
        students_not_viewed = enrolled_students.exclude(
            student_id__in=viewed_student_ids
        ).values('student__id', 'student__first_name', 'student__last_name', 'student__email')
        
        # Completion rate
        total_enrolled = enrolled_students.count()
        completion_rate = (total_views / total_enrolled * 100) if total_enrolled > 0 else 0
        
        return Response({
            'total_views': total_views,
            'unique_students': unique_students,
            'avg_time_spent': int(avg_time),
            'total_bookmarks': total_bookmarks,
            'total_annotations': total_annotations,
            'completion_rate': round(completion_rate, 2),
            'total_enrolled': total_enrolled,
            'students_not_viewed': list(students_not_viewed)
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def bookmark(self, request, pk=None):
        """
        Student bookmarks a note
        """
        note = self.get_object()
        
        # Create or get bookmark
        bookmark, created = StudentNoteBookmark.objects.get_or_create(
            note=note,
            student=request.user
        )
        
        # Increment bookmark count
        if created:
            note.bookmark_count += 1
            note.save(update_fields=['bookmark_count'])
        
        serializer = StudentNoteBookmarkSerializer(bookmark)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsStudent])
    def unbookmark(self, request, pk=None):
        """
        Student removes bookmark
        """
        note = self.get_object()
        
        try:
            bookmark = StudentNoteBookmark.objects.get(note=note, student=request.user)
            bookmark.delete()
            
            # Decrement bookmark count
            note.bookmark_count = max(0, note.bookmark_count - 1)
            note.save(update_fields=['bookmark_count'])
            
            return Response({'message': 'Bookmark removed'}, status=status.HTTP_204_NO_CONTENT)
        except StudentNoteBookmark.DoesNotExist:
            return Response(
                {'error': 'Bookmark not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsStudent])
    def my_bookmarks(self, request):
        """
        List student's bookmarked notes
        """
        bookmarks = StudentNoteBookmark.objects.filter(
            student=request.user
        ).select_related('note__lecture', 'note__classroom').order_by('-created_at')
        
        serializer = StudentNoteBookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def track_view(self, request, pk=None):
        """
        Track when student views a note
        
        Creates or updates StudentNoteView record
        """
        note = self.get_object()
        
        # Get or create view record
        view, created = StudentNoteView.objects.get_or_create(
            note=note,
            student=request.user
        )
        
        # Update time spent if provided
        time_spent = request.data.get('time_spent', 0)
        if time_spent:
            view.time_spent += int(time_spent)
            view.save()
        
        # Increment view count
        if created:
            note.view_count += 1
            note.save(update_fields=['view_count'])
        
        serializer = StudentNoteViewSerializer(view)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def generate_pdf(self, request, pk=None):
        """
        Generate PDF from note
        
        Placeholder for PDF generation
        """
        note = self.get_object()
        
        if note.teacher != request.user:
            return Response(
                {'error': 'You can only generate PDF for your own notes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # TODO: Implement PDF generation
        # pdf_file = generate_note_pdf(note)
        # note.pdf_file = pdf_file
        # note.pdf_generated_at = timezone.now()
        # note.save()
        
        return Response({
            'message': 'PDF generation coming soon',
            'status': 'not_implemented'
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def from_template(self, request):
        """
        Create note from template
        """
        template_id = request.data.get('template_id')
        
        if not template_id:
            return Response(
                {'error': 'template_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            template = NoteTemplate.objects.get(id=template_id, created_by=request.user)
        except NoteTemplate.DoesNotExist:
            return Response(
                {'error': 'Template not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create note from template
        note_data = {
            'title': request.data.get('title', template.name),
            'content': template.content,
            'classroom': request.data.get('classroom'),
            'lecture': request.data.get('lecture'),
            'template': template.id,
            'teacher': request.user.id
        }
        
        serializer = LectureNoteSerializer(data=note_data, context={'request': request})
        if serializer.is_valid():
            serializer.save(teacher=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentNoteBookmarkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing bookmarks
    
    Read-only: Bookmarks are created/deleted through note actions
    """
    serializer_class = StudentNoteBookmarkSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['note', 'student']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter bookmarks based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return StudentNoteBookmark.objects.none()
        
        if user.role == 'student':
            # Students see their own bookmarks
            return StudentNoteBookmark.objects.filter(student=user).select_related('note')
        elif user.role == 'teacher':
            # Teachers see bookmarks on their notes
            return StudentNoteBookmark.objects.filter(note__teacher=user).select_related('note', 'student')
        
        return StudentNoteBookmark.objects.none()


class StudentPersonalNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for student personal notes/annotations
    
    Students can create, update, and delete their own annotations.
    Teachers can view annotations on their notes (read-only).
    """
    serializer_class = StudentPersonalNoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['lecture_note', 'student']
    search_fields = ['content', 'highlighted_text']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter annotations based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return StudentPersonalNote.objects.none()
        
        if user.role == 'student':
            # Students see their own annotations
            return StudentPersonalNote.objects.filter(
                student=user,
                is_deleted=False
            ).select_related('lecture_note')
        elif user.role == 'teacher':
            # Teachers see annotations on their notes
            return StudentPersonalNote.objects.filter(
                lecture_note__teacher=user,
                is_deleted=False
            ).select_related('lecture_note', 'student')
        
        return StudentPersonalNote.objects.none()
    
    def get_permissions(self):
        """Teachers can only read annotations"""
        if self.request.user.role == 'teacher' and self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsStudent()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Auto-set student to current user"""
        serializer.save(student=self.request.user)
