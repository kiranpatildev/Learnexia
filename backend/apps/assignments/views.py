"""
Views for assignments app - Production Grade with AI Integration
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
from datetime import datetime

from .models import (
    Assignment,
    AssignmentQuestion,
    RubricCriterion,
    AssignmentSubmission,
    AssignmentGrade,
    RubricScore,
    GradingAuditLog
)
from .serializers import (
    AssignmentSerializer,
    AssignmentListSerializer,
    AssignmentCreateSerializer,
    AssignmentSubmissionSerializer,
    SubmissionListSerializer,
    AssignmentGradeSerializer
)
from .services import ai_assignment_service
from apps.core.permissions import IsTeacher, IsStudent, IsAdmin
from apps.schools.models import ClassroomEnrollment
from apps.lectures.models import Lecture

import logging

logger = logging.getLogger(__name__)


class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing assignments with AI generation support"""
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['classroom', 'is_ai_generated', 'submission_type', 'grading_method']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'title']
    ordering = ['-due_date']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Assignment.objects.none()
        
        if user.role == 'teacher':
            return Assignment.objects.filter(created_by=user)
        elif user.role == 'student':
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user, is_active=True
            ).values_list('classroom_id', flat=True)
            return Assignment.objects.filter(
                classroom_id__in=enrolled_classrooms,
                is_published=True
            )
        elif user.role == 'admin':
            return Assignment.objects.all()
        
        return Assignment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AssignmentListSerializer
        elif self.action == 'create':
            return AssignmentCreateSerializer
        return AssignmentSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher | IsAdmin])
    def generate_with_ai(self, request):
        """
        Generate assignment questions using AI from lecture transcript.
        
        Request body:
        {
            "lecture_id": "uuid",
            "title": "Assignment Title",
            "description": "Description",
            "classroom": "classroom_id",
            "difficulty": "easy|medium|hard",
            "num_questions": 5,
            "assignment_format": "essay|short_answer|case_study",
            "submission_type": "online|offline",
            "grading_method": "manual|ai_assisted|automated",
            "total_marks": 10,
            "due_date": "2024-12-31T23:59:59Z"
        }
        """
        
        try:
            # Extract parameters
            lecture_id = request.data.get('lecture_id')
            title = request.data.get('title')
            description = request.data.get('description', '')
            classroom_id = request.data.get('classroom')
            difficulty = request.data.get('difficulty', 'medium')
            num_questions = int(request.data.get('num_questions', 5))
            assignment_format = request.data.get('assignment_format', 'short_answer')
            submission_type = request.data.get('submission_type', 'online')
            grading_method = request.data.get('grading_method', 'ai_assisted')
            total_marks = int(request.data.get('total_marks', 10))
            due_date_str = request.data.get('due_date')
            
            # Parse due_date from string to datetime
            if not due_date_str:
                return Response(
                    {'error': 'due_date is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # Parse datetime-local format: "2026-02-06T01:42"
                due_date = datetime.fromisoformat(due_date_str)
                # Make it timezone-aware
                due_date = timezone.make_aware(due_date)
            except (ValueError, TypeError) as e:
                return Response(
                    {'error': f'Invalid due_date format: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate
            if not lecture_id:
                return Response(
                    {'error': 'lecture_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get lecture
            try:
                lecture = Lecture.objects.get(id=lecture_id, teacher=request.user)
            except Lecture.DoesNotExist:
                return Response(
                    {'error': 'Lecture not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if lecture has transcript
            if not lecture.transcript:
                return Response(
                    {'error': 'Lecture must have a transcript to generate assignment'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"Generating AI assignment from lecture: {lecture.title}")
            
            # Generate with AI
            ai_result = ai_assignment_service.generate_assignment(
                lecture_transcript=lecture.transcript,
                lecture_title=lecture.title,
                difficulty=difficulty,
                num_questions=num_questions,
                assignment_format=assignment_format,
                subject=lecture.classroom.subject if lecture.classroom else 'General'
            )
            
            # Create assignment with transaction
            with transaction.atomic():
                # Create assignment
                assignment = Assignment.objects.create(
                    title=title,
                    description=description,
                    created_by=request.user,
                    classroom_id=classroom_id,
                    source_lecture=lecture,
                    submission_type=submission_type,
                    difficulty=difficulty,
                    assignment_format=assignment_format,
                    total_marks=total_marks,
                    grading_method=grading_method,
                    due_date=due_date,
                    is_ai_generated=True,
                    is_published=False,  # Draft mode until teacher reviews and publishes
                    ai_generation_cost=ai_result['cost'],
                    generation_tokens=ai_result['tokens_used'],
                    ai_generated_at=timezone.now()
                )
                
                # Create questions
                for question_data in ai_result['questions']:
                    AssignmentQuestion.objects.create(
                        assignment=assignment,
                        question_number=question_data['question_number'],
                        question_text=question_data['question_text'],
                        expected_answer_keywords=question_data.get('expected_answer_keywords', []),
                        expected_answer_length=question_data.get('expected_answer_length', ''),
                        grading_notes=question_data.get('grading_notes', ''),
                        marks=question_data.get('marks')
                    )
                
                logger.info(f"[OK] Created AI assignment: {assignment.title} (Cost: ${ai_result['cost']})")
            
            return Response({
                'message': 'Assignment generated successfully',
                'assignment': AssignmentSerializer(assignment).data,
                'ai_metadata': {
                    'tokens_used': ai_result['tokens_used'],
                    'cost': str(ai_result['cost']),
                    'metadata': ai_result['metadata']
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"AI generation failed: {e}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def publish(self, request, pk=None):
        """Publish assignment to students"""
        assignment = self.get_object()
        assignment.is_published = True
        assignment.published_at = timezone.now()
        assignment.save()
        
        # Create draft submissions for all students in classroom
        students = ClassroomEnrollment.objects.filter(
            classroom=assignment.classroom,
            is_active=True
        ).values_list('student', flat=True)
        
        for student_id in students:
            AssignmentSubmission.objects.get_or_create(
                assignment=assignment,
                student_id=student_id,
                defaults={'status': 'draft'}
            )
        
        logger.info(f"Published assignment: {assignment.title} to {len(students)} students")
        
        return Response({
            'message': 'Assignment published successfully',
            'published_at': assignment.published_at,
            'students_count': len(students)
        })
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsTeacher | IsAdmin])
    def analytics(self, request, pk=None):
        """Get assignment analytics"""
        assignment = self.get_object()
        
        return Response(assignment.submission_stats)


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing submissions with AI grading support"""
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['assignment', 'student', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AssignmentSubmission.objects.none()
        
        if user.role == 'student':
            return AssignmentSubmission.objects.filter(student=user)
        elif user.role == 'teacher':
            return AssignmentSubmission.objects.filter(assignment__created_by=user)
        elif user.role == 'admin':
            return AssignmentSubmission.objects.all()
        
        return AssignmentSubmission.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SubmissionListSerializer
        return AssignmentSubmissionSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            print("VALIDATION ERROR:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsStudent])
    def submit(self, request, pk=None):
        """Submit assignment"""
        submission = self.get_object()
        
        if submission.status == 'submitted':
            return Response(
                {'error': 'Assignment already submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        submission.submitted_at = timezone.now()
        submission.status = 'submitted'
        submission.is_late = timezone.now() > submission.assignment.due_date
        
        if submission.is_late:
            submission.days_late = submission.calculate_days_late()
        
        submission.save()
        
        logger.info(f"Student {submission.student.get_full_name()} submitted assignment: {submission.assignment.title}")
        
        return Response(self.get_serializer(submission).data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def grade_manually(self, request, pk=None):
        """Manually grade submission (teacher override)"""
        submission = self.get_object()
        
        score = request.data.get('score')
        feedback = request.data.get('feedback', '')
        teacher_comments = request.data.get('teacher_comments', '')
        
        if score is None:
            return Response(
                {'error': 'Score is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Create or update grade
            grade, created = AssignmentGrade.objects.update_or_create(
                submission=submission,
                defaults={
                    'score': Decimal(str(score)),
                    'max_score': submission.assignment.total_marks,
                    'overall_feedback': feedback,
                    'teacher_comments': teacher_comments,
                    'graded_by': request.user
                }
            )
            
            # Create audit log
            GradingAuditLog.objects.create(
                grade=grade,
                action='teacher_reviewed',
                performed_by=request.user,
                new_score=score,
                notes='Manual grading by teacher'
            )
            
            submission.status = 'graded'
            submission.graded_at = timezone.now()
            submission.save()
        
        logger.info(f"Teacher manually graded submission: {submission.id} - Score: {score}/{submission.assignment.total_marks}")
        
        return Response(AssignmentGradeSerializer(grade).data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def grade_with_ai(self, request, pk=None):
        """Grade submission using AI (Supports Text & PDF)"""
        submission = self.get_object()
        assignment = submission.assignment
        
        try:
            logger.info(f"AI grading submission: {submission.id}")
            
            # Determine submission type and route to appropriate grading method
            if submission.uploaded_file:  # PDF submission
                logger.info(f"Grading PDF submission: {submission.id}")
                
                ai_result = ai_assignment_service.grade_pdf_submission(
                    assignment=assignment,
                    pdf_file_path=submission.uploaded_file.path,
                    questions=list(assignment.questions.all()),
                    grading_type=assignment.grading_type
                )
                
            else:  # Text submission
                logger.info(f"Grading text submission: {submission.id}")
                
                ai_result = ai_assignment_service.grade_submission(
                    assignment=assignment,
                    submission=submission,
                    grading_type=assignment.grading_type
                )
            
            with transaction.atomic():
                # Create or update grade
                grade, created = AssignmentGrade.objects.update_or_create(
                    submission=submission,
                    defaults={
                        'ai_suggested_score': ai_result['suggested_score'],
                        'score': ai_result['suggested_score'],  # Default to AI score
                        'max_score': ai_result['max_score'],
                        'ai_feedback': ai_result['feedback'],
                        'overall_feedback': ai_result['feedback'],
                        'ai_grading_data': ai_result['detailed_analysis'],
                        'ai_grading_cost': ai_result['cost'],
                        'ai_grading_tokens': ai_result['tokens_used'],
                        'graded_by': request.user
                    }
                )
                
                # If rubric-based (only for text currently or if PDF matches format)
                # Note: grade_pdf grading result might differ in structure slightly regarding rubrics
                # For now assuming PDF grading returns broadly compatible dict
                if 'rubric_scores' in ai_result:
                    for rubric_score_data in ai_result['rubric_scores']:
                        criterion = assignment.rubric_criteria.get(
                            criterion_name=rubric_score_data['criterion_name']
                        )
                        RubricScore.objects.update_or_create(
                            grade=grade,
                            criterion=criterion,
                            defaults={
                                'score': Decimal(str(rubric_score_data['score'])),
                                'ai_suggested_score': Decimal(str(rubric_score_data['score'])),
                                'feedback': rubric_score_data['feedback']
                            }
                        )
                
                # Create audit log
                GradingAuditLog.objects.create(
                    grade=grade,
                    action='ai_graded',
                    performed_by=request.user,
                    new_score=ai_result['suggested_score'],
                    notes=f"AI grading (Cost: ${ai_result['cost']})"
                )
                
                submission.status = 'graded'
                submission.graded_at = timezone.now()
                submission.save()
            
            logger.info(f"[OK] AI graded submission: {submission.id} - Score: {ai_result['suggested_score']}/{ai_result['max_score']} (Cost: ${ai_result['cost']})")
            
            return Response({
                'message': 'Submission graded with AI',
                'grade': AssignmentGradeSerializer(grade).data,
                'ai_metadata': {
                    'tokens_used': ai_result['tokens_used'],
                    'cost': str(ai_result['cost']),
                    'handwriting_detected': ai_result.get('handwriting_detected', False)
                }
            })
            
        except Exception as e:
            logger.error(f"AI grading failed: {e}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def batch_grade_with_ai(self, request):
        """
        Batch grade multiple submissions using AI.
        Handles both Text and PDF submissions properly.
        """
        
        submission_ids = request.data.get('submission_ids', [])
        
        if not submission_ids:
            return Response(
                {'error': 'submission_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use select_related to efficiently get assignment data
        submissions = AssignmentSubmission.objects.filter(
            id__in=submission_ids,
            assignment__created_by=request.user
        ).select_related('assignment')
        
        if not submissions.exists():
            return Response(
                {'error': 'No valid submissions found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # All submissions should be for same assignment typically, but code handles list
        # For simplicity/correctness, we assume first assignment is the target if multiple involved (batch usually per assignment)
        assignment = submissions.first().assignment
        
        logger.info(f"Batch grading {len(submissions)} submissions for: {assignment.title}")
        
        try:
            # Group by submission type
            pdf_submissions = []
            text_submissions = []
            
            for sub in submissions:
                if sub.uploaded_file:
                    pdf_submissions.append((str(sub.id), sub.uploaded_file.path))
                else:
                    text_submissions.append(sub)
            
            results = []
            
            # Process PDF submissions in batch
            if pdf_submissions:
                pdf_results = ai_assignment_service.batch_grade_pdf_submissions(
                    assignment=assignment,
                    pdf_submissions=pdf_submissions
                )
                results.extend(pdf_results)
            
            # Process text submissions
            if text_submissions:
                text_results = ai_assignment_service.batch_grade_submissions(
                    assignment=assignment,
                    submissions=text_submissions
                )
                results.extend(text_results)
            
            # Process results
            success_count = 0
            failed_count = 0
            total_cost = Decimal('0')
            
            for result in results:
                if result['success']:
                    success_count += 1
                    ai_result = result['result']
                    total_cost += ai_result['cost']
                    
                    # Save grade
                    try:
                        submission = submissions.get(id=result['submission_id'])
                        
                        with transaction.atomic():
                            grade, _ = AssignmentGrade.objects.update_or_create(
                                submission=submission,
                                defaults={
                                    'ai_suggested_score': ai_result['suggested_score'],
                                    'score': ai_result['suggested_score'],
                                    'max_score': ai_result['max_score'],
                                    'ai_feedback': ai_result['feedback'],
                                    'overall_feedback': ai_result['feedback'],
                                    'ai_grading_data': ai_result['detailed_analysis'],
                                    'ai_grading_cost': ai_result['cost'],
                                    'ai_grading_tokens': ai_result['tokens_used'],
                                    'graded_by': request.user
                                }
                            )
                            
                            GradingAuditLog.objects.create(
                                grade=grade,
                                action='ai_graded',
                                performed_by=request.user,
                                new_score=ai_result['suggested_score'],
                                notes=f"Batch AI grading (Cost: ${ai_result['cost']})"
                            )
                            
                            submission.status = 'graded'
                            submission.graded_at = timezone.now()
                            submission.save()
                    except AssignmentSubmission.DoesNotExist:
                        failed_count += 1
                        continue
                else:
                    failed_count += 1
            
            logger.info(f"[OK] Batch grading complete: {success_count} success, {failed_count} failed. Total cost: ${total_cost}")
            
            return Response({
                'message': 'Batch grading complete',
                'success_count': success_count,
                'failed_count': failed_count,
                'total_cost': str(total_cost),
                'results': results
            })
            
        except Exception as e:
            logger.error(f"Batch grading failed: {e}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AssignmentGradeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing and publishing grades"""
    
    serializer_class = AssignmentGradeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['submission__assignment', 'is_published']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AssignmentGrade.objects.none()
        
        if user.role == 'student':
            return AssignmentGrade.objects.filter(
                submission__student=user,
                is_published=True
            )
        elif user.role == 'teacher':
            return AssignmentGrade.objects.filter(
                submission__assignment__created_by=user
            )
        elif user.role == 'admin':
            return AssignmentGrade.objects.all()
        
        return AssignmentGrade.objects.none()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def publish(self, request, pk=None):
        """Publish grade to student"""
        grade = self.get_object()
        
        with transaction.atomic():
            grade.is_published = True
            grade.published_at = timezone.now()
            grade.save()
            
            # Create audit log
            GradingAuditLog.objects.create(
                grade=grade,
                action='published',
                performed_by=request.user,
                notes='Grade published to student'
            )
        
        logger.info(f"Published grade to student: {grade.submission.student.get_full_name()}")
        
        return Response({
            'message': 'Grade published successfully',
            'published_at': grade.published_at
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def modify_score(self, request, pk=None):
        """Modify AI-suggested score (teacher override)"""
        grade = self.get_object()
        
        new_score = request.data.get('score')
        teacher_comments = request.data.get('teacher_comments', '')
        
        if new_score is None:
            return Response(
                {'error': 'Score is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_score = grade.score
        
        with transaction.atomic():
            grade.score = Decimal(str(new_score))
            grade.teacher_comments = teacher_comments
            grade.teacher_modified_ai_score = True
            grade.save()
            
            # Create audit log
            GradingAuditLog.objects.create(
                grade=grade,
                action='score_modified',
                performed_by=request.user,
                old_score=old_score,
                new_score=new_score,
                notes='Teacher modified AI-suggested score'
            )
        
        logger.info(f"Teacher modified score: {old_score} → {new_score}")
        
        return Response(AssignmentGradeSerializer(grade).data)
