"""
Views for lectures app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db.models import Avg, Count, Q, Sum
from django.db import models
from django.http import FileResponse

from .models import Lecture, LectureBookmark, LectureView, LectureResource
from .serializers import (
    LectureSerializer, LectureListSerializer, LectureBookmarkSerializer,
    LectureViewSerializer, LectureResourceSerializer
)
from apps.core.permissions import IsTeacher, IsStudent
from apps.schools.models import ClassroomEnrollment


class LectureViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing lectures
    
    Teachers can create, update, and delete their own lectures.
    Students can view shared lectures from enrolled classrooms.
    Parents can view lectures their children have access to.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['classroom', 'chapter', 'topic', 'status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'scheduled_date', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter lectures based on user role"""
        user = self.request.user
        
        # Return empty queryset for unauthenticated users
        if not user.is_authenticated:
            return Lecture.objects.none()
        
        if user.role == 'teacher':
            # Teachers see their own lectures
            return Lecture.objects.filter(
                teacher=user,
                is_deleted=False
            ).select_related('classroom', 'teacher')
        
        elif user.role == 'student':
            # Students see shared lectures from enrolled classrooms
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user,
                is_active=True
            ).values_list('classroom_id', flat=True)
            
            return Lecture.objects.filter(
                classroom_id__in=enrolled_classrooms,
                is_shared_with_students=True,
                status='completed',
                is_deleted=False
            ).select_related('classroom', 'teacher')
        
        elif user.role == 'parent':
            # Parents see lectures their children can access
            children = user.children_relationships.values_list('student_id', flat=True)
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student_id__in=children,
                is_active=True
            ).values_list('classroom_id', flat=True)
            
            return Lecture.objects.filter(
                classroom_id__in=enrolled_classrooms,
                is_shared_with_students=True,
                status='completed',
                is_deleted=False
            ).select_related('classroom', 'teacher')
        
        elif user.role == 'admin':
            # Admins see all lectures
            return Lecture.objects.filter(
                is_deleted=False
            ).select_related('classroom', 'teacher')
        
        return Lecture.objects.none()
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return LectureListSerializer
        return LectureSerializer
    
    def perform_create(self, serializer):
        """Auto-set teacher to current user"""
        serializer.save(teacher=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def share(self, request, pk=None):
        """
        Share lecture with students
        
        Sets is_shared_with_students=True and shared_at timestamp.
        Optionally sends notifications to students.
        """
        lecture = self.get_object()
        
        # Ensure teacher owns this lecture
        if lecture.teacher != request.user:
            return Response(
                {'error': 'You can only share your own lectures'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        lecture.is_shared_with_students = True
        lecture.shared_at = timezone.now()
        lecture.save()
        
        # TODO: Send notifications to students if notify_students=True
        # if lecture.notify_students:
        #     send_lecture_shared_notifications(lecture)
        
        serializer = self.get_serializer(lecture)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def upload(self, request, pk=None):
        """
        Upload audio/video file or thumbnail for lecture
        
        Accepts: audio_file, video_file, or thumbnail
        Sets status to 'processing' after upload
        """
        lecture = self.get_object()
        
        # Ensure teacher owns this lecture
        if lecture.teacher != request.user:
            return Response(
                {'error': 'You can only upload files to your own lectures'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check which file is being uploaded
        if 'audio_file' in request.FILES:
            lecture.audio_file = request.FILES['audio_file']
            lecture.recording_type = 'audio'
        elif 'video_file' in request.FILES:
            lecture.video_file = request.FILES['video_file']
            lecture.recording_type = 'video'
        elif 'thumbnail' in request.FILES:
            lecture.thumbnail = request.FILES['thumbnail']
        else:
            return Response(
                {'error': 'No file provided. Send audio_file, video_file, or thumbnail'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lecture.status = 'processing'
        lecture.save()
        
        # TODO: Trigger async transcription task
        # transcribe_lecture.delay(lecture.id)
        
        serializer = self.get_serializer(lecture)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher])
    def analytics(self, request, pk=None):
        """
        Get viewing analytics for a lecture
        
        Returns:
        - Total views
        - Unique students who watched
        - Average completion percentage
        - Average watch time
        - Completion rate
        - Students who haven't watched
        - Top bookmark timestamps
        """
        lecture = self.get_object()
        
        # Ensure teacher owns this lecture
        if lecture.teacher != request.user:
            return Response(
                {'error': 'You can only view analytics for your own lectures'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all views for this lecture
        views = LectureView.objects.filter(lecture=lecture)
        
        # Get enrolled students
        enrolled_students = ClassroomEnrollment.objects.filter(
            classroom=lecture.classroom,
            is_active=True
        ).select_related('student')
        
        # Calculate analytics
        total_views = views.count()
        unique_students = views.values('student').distinct().count()
        
        # Average completion and watch time
        avg_stats = views.aggregate(
            avg_completion=Avg('completion_percentage'),
            avg_watch_time=Avg('watch_time')
        )
        
        # Completion rate
        completed_count = views.filter(completed_at__isnull=False).count()
        total_enrolled = enrolled_students.count()
        completion_rate = (completed_count / total_enrolled * 100) if total_enrolled > 0 else 0
        
        # Students who haven't watched
        watched_student_ids = views.values_list('student_id', flat=True)
        students_not_watched = enrolled_students.exclude(
            student_id__in=watched_student_ids
        ).values('student__id', 'student__first_name', 'student__last_name', 'student__email')
        
        # Top bookmarks (most common timestamps)
        top_bookmarks = LectureBookmark.objects.filter(
            lecture=lecture
        ).values('timestamp', 'title').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'total_views': total_views,
            'unique_students': unique_students,
            'avg_completion': round(avg_stats['avg_completion'] or 0, 2),
            'avg_watch_time': int(avg_stats['avg_watch_time'] or 0),
            'completion_rate': round(completion_rate, 2),
            'completed_count': completed_count,
            'total_enrolled': total_enrolled,
            'students_not_watched': list(students_not_watched),
            'top_bookmarks': list(top_bookmarks)
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def start(self, request, pk=None):
        """
        Student starts watching a lecture
        
        Creates or updates LectureView record
        """
        lecture = self.get_object()
        
        # Get or create lecture view
        lecture_view, created = LectureView.objects.get_or_create(
            lecture=lecture,
            student=request.user,
            defaults={'started_at': timezone.now()}
        )
        
        serializer = LectureViewSerializer(lecture_view)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated, IsStudent])
    def progress(self, request, pk=None):
        """
        Update student's watch progress
        
        Accepts: last_position (int), completion_percentage (int)
        """
        lecture = self.get_object()
        
        try:
            lecture_view = LectureView.objects.get(lecture=lecture, student=request.user)
        except LectureView.DoesNotExist:
            return Response(
                {'error': 'You must start watching the lecture first'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update progress
        last_position = request.data.get('last_position')
        completion_percentage = request.data.get('completion_percentage')
        
        if last_position is not None:
            lecture_view.last_position = last_position
        
        if completion_percentage is not None:
            lecture_view.completion_percentage = completion_percentage
        
        # Increment watch time (simple increment, can be improved)
        lecture_view.watch_time += 1
        
        lecture_view.save()
        
        serializer = LectureViewSerializer(lecture_view)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def complete(self, request, pk=None):
        """
        Mark lecture as completed
        
        Sets completed_at and completion_percentage=100
        """
        lecture = self.get_object()
        
        try:
            lecture_view = LectureView.objects.get(lecture=lecture, student=request.user)
        except LectureView.DoesNotExist:
            return Response(
                {'error': 'You must start watching the lecture first'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lecture_view.completed_at = timezone.now()
        lecture_view.completion_percentage = 100
        lecture_view.save()
        
        # TODO: Trigger XP reward for completing lecture
        # award_xp(request.user, lecture, 'lecture_completed')
        
        serializer = LectureViewSerializer(lecture_view)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def generate_transcript(self, request, pk=None):
        """
        Generate transcript from lecture audio/video using AI
        
        Endpoint: POST /api/v1/lectures/{id}/generate_transcript/
        
        Request Body (optional):
        {
            "force_regenerate": false,  // Regenerate even if exists
            "language_code": "en"       // ISO language code
        }
        
        Response (Success - Sync):
        {
            "status": "success",
            "message": "Transcript generated successfully",
            "data": {
                "transcript": "Full transcript text...",
                "word_count": 1234,
                "language": "en",
                "processing_time": 45.2
            }
        }
        
        Response (Processing - Async):
        {
            "status": "processing",
            "message": "Transcription started. Check back in a few minutes.",
            "task_id": "abc123..."
        }
        
        Response (Error):
        {
            "status": "error",
            "message": "No audio/video file found for this lecture",
            "code": "NO_MEDIA_FILE"
        }
        """
        from .serializers import TranscriptionSerializer
        from .ai_services.transcription import TranscriptionService
        from .ai_services.config import AIConfig
        from .tasks import transcribe_lecture_async
        
        lecture = self.get_object()
        
        # Ensure teacher owns this lecture
        if lecture.teacher != request.user:
            return Response(
                {
                    'status': 'error',
                    'message': 'You can only generate transcripts for your own lectures',
                    'code': 'PERMISSION_DENIED'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate request
        serializer = TranscriptionSerializer(data=request.data, context={'lecture': lecture})
        serializer.is_valid(raise_exception=True)
        
        force_regenerate = serializer.validated_data.get('force_regenerate', False)
        
        # Check if transcript already exists
        if lecture.transcript and not force_regenerate:
            word_count = len(lecture.transcript.split())
            return Response({
                'status': 'success',
                'message': 'Transcript already exists. Use force_regenerate=true to regenerate.',
                'data': {
                    'transcript': lecture.transcript,
                    'word_count': word_count,
                    'language': 'en',
                    'processing_time': 0
                }
            })
        
        # Check if media file exists
        if not lecture.audio_file and not lecture.video_file:
            return Response(
                {
                    'status': 'error',
                    'message': 'No audio or video file found for this lecture',
                    'code': 'NO_MEDIA_FILE'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get file size
        media_file = lecture.audio_file or lecture.video_file
        file_size = media_file.size
        
        # Check file size limits
        if file_size > AIConfig.MAX_FILE_SIZE:
            max_size_mb = AIConfig.MAX_FILE_SIZE / (1024 * 1024)
            return Response(
                {
                    'status': 'error',
                    'message': f'File size exceeds maximum limit of {max_size_mb:.0f} MB',
                    'code': 'FILE_TOO_LARGE'
                },
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
            )
        
        # Decide: sync or async processing (based on compute load, not API limits)
        # Short files (<30 min): process synchronously
        # Long files (>=30 min): queue async task to avoid blocking
        duration_threshold = 30 * 60  # 30 minutes
        use_async = lecture.duration and lecture.duration >= duration_threshold
        
        if not use_async:
            # Process synchronously (quick response)
            try:
                lecture.transcript_status = 'processing'
                lecture.save(update_fields=['transcript_status'])
                
                service = TranscriptionService()
                result = service.transcribe_lecture(lecture)
                
                if result['success']:
                    lecture.transcript = result['transcript']
                    lecture.has_auto_generated_transcript = True
                    lecture.transcript_status = 'completed'
                    lecture.transcript_approved_by_teacher = False  # CRITICAL: Requires approval
                    lecture.save(update_fields=[
                        'transcript', 'has_auto_generated_transcript',
                        'transcript_status', 'transcript_approved_by_teacher'
                    ])
                    
                    return Response({
                        'status': 'success',
                        'message': 'Transcript generated successfully. Please review and approve before using AI features.',
                        'data': {
                            'transcript': result['transcript'],
                            'word_count': result['word_count'],
                            'language': result['language'],
                            'processing_time': result['processing_time'],
                            'mode': 'local',
                            'cost': 0.00,
                            'approved': False
                        }
                    })
                else:
                    lecture.transcript_status = 'failed'
                    lecture.save(update_fields=['transcript_status'])
                    
                    return Response(
                        {
                            'status': 'error',
                            'message': f'Local transcription failed: {result["error"]}',
                            'code': 'TRANSCRIPTION_FAILED'
                        },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            
            except Exception as e:
                lecture.transcript_status = 'failed'
                lecture.save(update_fields=['transcript_status'])
                
                return Response(
                    {
                        'status': 'error',
                        'message': f'Transcription error: {str(e)}',
                        'code': 'TRANSCRIPTION_ERROR'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Queue async task for long files (compute-heavy)
            lecture.transcript_status = 'pending'
            lecture.save(update_fields=['transcript_status'])
            
            task = transcribe_lecture_async.delay(str(lecture.id))
            
            return Response({
                'status': 'processing',
                'message': 'Local transcription started. This may take several minutes for long files.',
                'task_id': task.id,
                'check_status_url': f'/api/v1/lectures/{lecture.id}/transcript_status/',
                'mode': 'local',
                'cost': 0.00
            }, status=status.HTTP_202_ACCEPTED)
    
    @action(detail=True, methods=['get'])
    def transcript_status(self, request, pk=None):
        """
        Check transcription status
        
        Endpoint: GET /api/v1/lectures/{id}/transcript_status/
        
        Response:
        {
            "status": "completed",  // not_started, pending, processing, completed, failed
            "has_transcript": true,
            "word_count": 1234,
            "generated_at": "2024-01-15T10:30:00Z",
            "error": null,  // or error message if failed
            "transcript_preview": "First 200 characters..."
        }
        """
        from .serializers import TranscriptStatusSerializer
        
        lecture = self.get_object()
        
        # Determine status
        if not lecture.audio_file and not lecture.video_file:
            transcript_status = 'not_started'
        elif lecture.transcript:
            transcript_status = 'completed'
        elif lecture.transcript_status:
            transcript_status = lecture.transcript_status
        else:
            transcript_status = 'pending'
        
        # Calculate word count
        word_count = len(lecture.transcript.split()) if lecture.transcript else 0
        
        # Get preview
        transcript_preview = None
        if lecture.transcript:
            transcript_preview = lecture.transcript[:200] + ('...' if len(lecture.transcript) > 200 else '')
        
        data = {
            'status': transcript_status,
            'has_transcript': bool(lecture.transcript),
            'word_count': word_count,
            'generated_at': lecture.updated_at if lecture.transcript else None,
            'error': None,  # TODO: Store error messages
            'transcript_preview': transcript_preview,
            'approved': lecture.transcript_approved_by_teacher,
            'approved_at': lecture.transcript_approved_at
        }
        
        serializer = TranscriptStatusSerializer(data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def approve_transcript(self, request, pk=None):
        """
        Approve transcript for AI processing
        
        Endpoint: POST /api/v1/lectures/{id}/approve_transcript/
        
        CRITICAL: This must be called before Gemini can process the transcript.
        Teacher reviews and approves the auto-generated transcript.
        
        Response:
        {
            "status": "success",
            "message": "Transcript approved. AI features (notes, flashcards, quizzes) are now available.",
            "approved_at": "2024-01-15T10:30:00Z"
        }
        """
        lecture = self.get_object()
        
        # Ensure teacher owns this lecture
        if lecture.teacher != request.user:
            return Response(
                {
                    'status': 'error',
                    'message': 'You can only approve transcripts for your own lectures',
                    'code': 'PERMISSION_DENIED'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if transcript exists
        if not lecture.transcript:
            return Response(
                {
                    'status': 'error',
                    'message': 'No transcript available to approve. Generate transcript first.',
                    'code': 'NO_TRANSCRIPT'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Approve transcript
        lecture.transcript_approved_by_teacher = True
        lecture.transcript_approved_at = timezone.now()
        lecture.save(update_fields=['transcript_approved_by_teacher', 'transcript_approved_at'])
        
        return Response({
            'status': 'success',
            'message': 'Transcript approved. AI features (notes, flashcards, quizzes) are now available.',
            'approved_at': lecture.transcript_approved_at,
            'word_count': len(lecture.transcript.split())
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def generate_notes(self, request, pk=None):
        """
        Generate AI-powered lecture notes from approved transcript
        
        Endpoint: POST /api/v1/lectures/{id}/generate_notes/
        
        Request Body:
        {
            "note_format": "comprehensive",  // or bullet_point, cornell, study_guide
            "force_regenerate": false,
            "auto_publish": false
        }
        
        Response (Success):
        {
            "success": true,
            "message": "Notes generated successfully!",
            "note_id": "uuid-here",
            "title": "Generated title",
            "format": "comprehensive",
            "word_count": 1234,
            "preview": "First 500 characters of notes..."
        }
        
        Response (Error):
        {
            "success": false,
            "message": "Transcript not approved yet",
            "error_code": "TRANSCRIPT_NOT_APPROVED"
        }
        """
        from apps.notes.models import LectureNote
        from apps.notes.ai_services.notes_generator import NotesGeneratorService
        from apps.notes.serializers import NotesGenerationRequestSerializer
        
        lecture = self.get_object()
        
        # Validate permissions (only teacher who owns lecture)
        if lecture.teacher != request.user:
            return Response(
                {
                    'success': False,
                    'message': 'You can only generate notes for your own lectures',
                    'error_code': 'PERMISSION_DENIED'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate request data
        serializer = NotesGenerationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'message': 'Invalid request data',
                    'error_code': 'INVALID_REQUEST',
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validated_data = serializer.validated_data
        note_format = validated_data.get('note_format', 'comprehensive')
        force_regenerate = validated_data.get('force_regenerate', False)
        auto_publish = validated_data.get('auto_publish', False)
        
        # Check prerequisites
        if not lecture.transcript:
            return Response(
                {
                    'success': False,
                    'message': 'No transcript available. Please add lecture content first.',
                    'error_code': 'EMPTY_TRANSCRIPT'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not lecture.transcript_approved_by_teacher:
            return Response(
                {
                    'success': False,
                    'message': 'Transcript must be approved before generating notes. Use the approve_transcript endpoint first.',
                    'error_code': 'TRANSCRIPT_NOT_APPROVED'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if notes already exist
        try:
            existing_note = LectureNote.objects.get(lecture=lecture)
            if not force_regenerate:
                return Response(
                    {
                        'success': False,
                        'message': 'Notes already exist for this lecture. Use force_regenerate=true to regenerate.',
                        'error_code': 'NOTES_EXIST',
                        'note_id': str(existing_note.id)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except LectureNote.DoesNotExist:
            existing_note = None
        
        # Generate notes using AI service
        try:
            service = NotesGeneratorService()
            result = service.generate_notes(
                lecture=lecture,
                note_format=note_format
            )
            
            if not result['success']:
                return Response(
                    {
                        'success': False,
                        'message': result.get('error', 'Failed to generate notes'),
                        'error_code': 'GENERATION_FAILED'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Save to database
            if existing_note:
                # Update existing note
                note = existing_note
                note.content = result['notes_content']
                note.title = result['title']
                note.summary = result['summary']
                note.note_format = note_format
                note.is_auto_generated = True
                note.auto_generated_at = timezone.now()
            else:
                # Create new note
                note = LectureNote.objects.create(
                    lecture=lecture,
                    classroom=lecture.classroom,
                    teacher=lecture.teacher,
                    title=result['title'],
                    content=result['notes_content'],
                    summary=result['summary'],
                    note_format=note_format,
                    is_auto_generated=True,
                    auto_generated_at=timezone.now(),
                    is_published=auto_publish
                )
            
            # Optionally publish
            if auto_publish:
                note.is_published = True
                note.published_at = timezone.now()
            
            note.save()
            
            logger.info(f"✅ Notes generated for lecture {lecture.id}: {result['word_count']} words")
            
            # Return success response
            return Response({
                'success': True,
                'message': 'Notes generated successfully! Review and publish when ready.',
                'note_id': str(note.id),
                'title': note.title,
                'format': note.note_format,
                'word_count': result['word_count'],
                'preview': note.summary or note.content[:500]
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Notes generation error: {str(e)}", exc_info=True)
            return Response(
                {
                    'success': False,
                    'message': f'An error occurred while generating notes: {str(e)}',
                    'error_code': 'GENERATION_ERROR'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class LectureBookmarkViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing lecture bookmarks
    
    Students can create, update, and delete their own bookmarks.
    Teachers can view bookmarks on their lectures (read-only).
    """
    serializer_class = LectureBookmarkSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['lecture', 'created_by']
    ordering_fields = ['timestamp', 'created_at']
    ordering = ['timestamp']
    
    def get_queryset(self):
        """Filter bookmarks based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return LectureBookmark.objects.none()
        
        if user.role == 'student':
            # Students see their own bookmarks
            return LectureBookmark.objects.filter(created_by=user)
        
        elif user.role == 'teacher':
            # Teachers see bookmarks on their lectures
            return LectureBookmark.objects.filter(lecture__teacher=user)
        
        return LectureBookmark.objects.none()
    
    def get_permissions(self):
        """Teachers can only read bookmarks, students can CRUD their own"""
        if self.request.user.role == 'teacher' and self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsStudent()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Auto-set created_by to current user"""
        serializer.save(created_by=self.request.user)


class LectureViewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing lecture watch history
    
    Read-only: Views are created/updated through lecture actions
    Students see their own views
    Teachers see views for their lectures
    Parents see their children's views
    """
    serializer_class = LectureViewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['lecture', 'student']
    ordering_fields = ['started_at', 'completion_percentage']
    ordering = ['-started_at']
    
    def get_queryset(self):
        """Filter views based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return LectureView.objects.none()
        
        if user.role == 'student':
            # Students see their own views
            return LectureView.objects.filter(student=user).select_related('lecture', 'student')
        
        elif user.role == 'teacher':
            # Teachers see views for their lectures
            return LectureView.objects.filter(lecture__teacher=user).select_related('lecture', 'student')
        
        elif user.role == 'parent':
            # Parents see their children's views
            children = user.children_relationships.values_list('student_id', flat=True)
            return LectureView.objects.filter(student_id__in=children).select_related('lecture', 'student')
        
        return LectureView.objects.none()
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get aggregated viewing statistics for current user
        
        Returns total lectures watched, watch time, completion stats
        """
        user = request.user
        
        if user.role == 'student':
            views = LectureView.objects.filter(student=user)
        elif user.role == 'parent':
            # For parents, show summary of all children
            children = user.children_relationships.values_list('student_id', flat=True)
            views = LectureView.objects.filter(student_id__in=children)
        else:
            return Response(
                {'error': 'Summary is only available for students and parents'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Calculate stats
        total_lectures_watched = views.count()
        completed_count = views.filter(completed_at__isnull=False).count()
        in_progress_count = views.filter(completed_at__isnull=True).count()
        
        stats = views.aggregate(
            total_watch_time=models.Sum('watch_time'),
            avg_completion=Avg('completion_percentage')
        )
        
        return Response({
            'total_lectures_watched': total_lectures_watched,
            'total_watch_time': int(stats['total_watch_time'] or 0),
            'avg_completion': round(stats['avg_completion'] or 0, 2),
            'completed_count': completed_count,
            'in_progress_count': in_progress_count
        })


class LectureResourceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing lecture resources
    
    Teachers can create, update, and delete resources for their lectures.
    Students and parents can view and download resources.
    """
    serializer_class = LectureResourceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['lecture', 'file_type']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter resources based on user role"""
        user = self.request.user
        
        if not user.is_authenticated:
            return LectureResource.objects.none()
        
        if user.role == 'teacher':
            # Teachers see resources for their lectures
            return LectureResource.objects.filter(
                lecture__teacher=user,
                is_deleted=False
            ).select_related('lecture')
        
        elif user.role == 'student':
            # Students see resources for accessible lectures
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user,
                is_active=True
            ).values_list('classroom_id', flat=True)
            
            return LectureResource.objects.filter(
                lecture__classroom_id__in=enrolled_classrooms,
                lecture__is_shared_with_students=True,
                lecture__status='completed',
                is_deleted=False
            ).select_related('lecture')
        
        elif user.role == 'parent':
            # Parents see resources their children can access
            children = user.children_relationships.values_list('student_id', flat=True)
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student_id__in=children,
                is_active=True
            ).values_list('classroom_id', flat=True)
            
            return LectureResource.objects.filter(
                lecture__classroom_id__in=enrolled_classrooms,
                lecture__is_shared_with_students=True,
                lecture__status='completed',
                is_deleted=False
            ).select_related('lecture')
        
        return LectureResource.objects.none()
    
    def get_permissions(self):
        """Only teachers can create/update/delete resources"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsTeacher()]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download resource file
        
        Increments download count and returns file
        """
        resource = self.get_object()
        
        # Increment lecture's download count
        resource.lecture.download_count += 1
        resource.lecture.save(update_fields=['download_count'])
        
        # TODO: Track download in analytics
        # log_resource_download(resource, request.user)
        
        # Return file response
        response = FileResponse(resource.file.open('rb'))
        response['Content-Disposition'] = f'attachment; filename="{resource.file.name}"'
        return response
