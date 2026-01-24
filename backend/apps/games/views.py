"""
Views for games app
"""

import logging
from typing import Dict, Any
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django.utils import timezone
from django.db.models import Q, Prefetch
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import GameTemplate, LectureGame, GameAttempt, GameLeaderboard
from .serializers import (
    GameTemplateSerializer,
    GameGenerationRequestSerializer,
    LectureGameListSerializer,
    LectureGameDetailSerializer,
    GameStartResponseSerializer,
    AnswerSubmissionSerializer,
    AnswerValidationResponseSerializer,
    GameAttemptSerializer,
    GameResultsSerializer,
    GameLeaderboardSerializer,
)
from .permissions import (
    IsTeacher,
    IsGamePublished,
    IsOwnAttempt,
    CanGenerateGames,
    CanPublishGames,
)
from .services.game_generator import GameGeneratorService
from .services.scoring_service import ScoringService
from apps.lectures.models import Lecture
from apps.schools.models import ClassroomEnrollment

logger = logging.getLogger(__name__)


class GameTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for game templates (read-only)
    Lists available game types
    """
    queryset = GameTemplate.objects.filter(is_active=True)
    serializer_class = GameTemplateSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['name']


class LectureGameViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing lecture games
    
    Teachers can generate, edit, and publish games
    Students can view published games from enrolled classrooms
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['lecture', 'template', 'difficulty', 'is_published']
    search_fields = ['title', 'lecture__title']
    ordering_fields = ['created_at', 'published_at', 'total_plays', 'average_score']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter games based on user role"""
        user = self.request.user
        
        if user.role == 'teacher':
            # Teachers see all games they created
            return LectureGame.objects.filter(
                generated_by=user,
                is_deleted=False
            ).select_related(
                'lecture',
                'template',
                'classroom',
                'generated_by'
            )
        
        elif user.role == 'student':
            # Students see published games from enrolled classrooms
            enrolled_classrooms = ClassroomEnrollment.objects.filter(
                student=user,
                is_active=True
            ).values_list('classroom_id', flat=True)
            
            return LectureGame.objects.filter(
                Q(classroom_id__in=enrolled_classrooms) | Q(classroom__isnull=True),
                is_published=True,
                is_deleted=False
            ).select_related(
                'lecture',
                'template',
                'classroom'
            )
        
        return LectureGame.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return LectureGameDetailSerializer
        return LectureGameListSerializer
    
    @action(detail=False, methods=['post'], permission_classes=[CanGenerateGames])
    def generate(self, request):
        """
        Generate a new game from lecture transcript
        
        POST /api/v1/games/generate/
        """
        serializer = GameGenerationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"[GAME GEN] Validation failed: {serializer.errors}")
            return Response({
                'error': 'VALIDATION_ERROR',
                'detail': f"Validation failed: {serializer.errors}"
            }, status=status.HTTP_400_BAD_REQUEST)
        # serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        lecture_id = data['lecture_id']
        game_type = data['game_type']
        difficulty = data['difficulty']
        question_count = data['question_count']
        force_regenerate = data['force_regenerate']
        auto_publish = data['auto_publish']
        
        try:
            # Get lecture and template
            lecture = get_object_or_404(Lecture, id=lecture_id)
            template = get_object_or_404(GameTemplate, code=game_type, is_active=True)
            
            # Check if game already exists
            if not force_regenerate:
                existing_game = LectureGame.objects.filter(
                    lecture=lecture,
                    template=template,
                    difficulty=difficulty,
                    is_deleted=False
                ).first()
                
                if existing_game:
                    return Response({
                        'error': 'GAME_EXISTS',
                        'detail': 'Game already exists. Use force_regenerate=true to override',
                        'existing_game_id': existing_game.id
                    }, status=status.HTTP_409_CONFLICT)
            
            # Generate game content
            generator = GameGeneratorService()
            
            if game_type == 'hot_potato':
                result = generator.generate_hot_potato_game(
                    lecture=lecture,
                    difficulty=difficulty,
                    question_count=question_count
                )
                
                game_config = {
                    'starting_time': 15,
                    'time_decrement': 1.5,
                    'minimum_time': 6,
                    'lives': 3,
                    'base_points_per_second': 50,
                    'combo_multiplier': 1.2
                }
                game_config = {
                    'lives': 3,
                    'base_speed': 1.5,
                    'time_limit_per_question': 10,
                    'points_per_correct': 100,
                    'combo_multiplier': 1.5,
                }
            elif game_type == 'match_pairs':
                result = generator.generate_match_pairs(
                    lecture=lecture,
                    difficulty=difficulty,
                    pair_count=question_count
                )
                
                game_config = {
                    'pair_count': len(result.get('pairs', [])),
                    'perfect_flips': len(result.get('pairs', [])) * 2,
                    'points_per_match': 100,
                    'flip_penalty': 10,
                    'lives': 999
                }
            elif game_type == 'crossword':
                result = generator.generate_crossword_game(
                    lecture=lecture,
                    difficulty=difficulty,
                    word_count=question_count
                )
                game_config = {
                    'hints_allowed': 3,
                    'reveal_letter_cost': 25,
                    'reveal_word_cost': 100,
                    'check_enabled': True,
                    'lives': 999 
                }
            else:
                # Default to quick_drop
                result = generator.generate_quick_drop_game(
                    lecture=lecture,
                    difficulty=difficulty,
                    question_count=question_count
                )
                
                game_config = {
                    'lives': 3,
                    'base_speed': 1.5,
                    'time_limit_per_question': 10,
                    'points_per_correct': 100,
                    'combo_multiplier': 1.5,
                }
            
            if not result['success']:
                return Response({
                    'error': 'GENERATION_FAILED',
                    'detail': result.get('error', 'Failed to generate game')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Determine content key (questions or pairs)
            if game_type == 'crossword':
                content_key = 'grid_data'
            elif game_type == 'match_pairs':
                content_key = 'pairs'
            else:
                content_key = 'questions'
                
            game_content = result.get(content_key, [])
            
            # For crossword, content is a dict, not list. We need a way to count questions.
            if game_type == 'crossword':
                question_count_val = result.get('metadata', {}).get('total_words', 0)
            else:
                question_count_val = len(game_content)
            
            # Create game record
            with transaction.atomic():
                game = LectureGame.objects.create(
                    lecture=lecture,
                    template=template,
                    classroom=lecture.classroom if hasattr(lecture, 'classroom') else None,
                    title=f"{lecture.title} - {template.name}",
                    difficulty=difficulty,
                    question_count=question_count_val,
                    game_data={
                        'version': '1.0',
                        'game_config': game_config,
                        content_key: game_content,
                        'metadata': result.get('metadata', {})
                    },
                    generated_by=request.user,
                    ai_generation_cost=result.get('cost', {}).get('total_cost', 0),
                    prompt_tokens=result.get('cost', {}).get('input_tokens', 0),
                    completion_tokens=result.get('cost', {}).get('output_tokens', 0),
                    is_published=auto_publish,
                    published_at=timezone.now() if auto_publish else None,
                    published_by=request.user if auto_publish else None,
                )
            
            logger.info(
                f"[GAME] Generated game {game.id} for lecture {lecture.id} "
                f"by user {request.user.id}"
            )
            
            serializer = LectureGameDetailSerializer(game, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"[GAME] Generation error: {str(e)}", exc_info=True)
            return Response({
                'error': 'GENERATION_ERROR',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['patch'], permission_classes=[CanPublishGames])
    def publish(self, request, pk=None):
        """
        Publish or unpublish a game
        
        PATCH /api/v1/games/{id}/publish/
        """
        game = self.get_object()
        is_published = request.data.get('is_published', True)
        
        game.is_published = is_published
        if is_published and not game.published_at:
            game.published_at = timezone.now()
            game.published_by = request.user
        
        game.save()
        
        message = 'Game is now visible to students' if is_published else 'Game is now hidden from students'
        
        logger.info(f"[GAME] Game {game.id} published status changed to {is_published}")
        
        return Response({
            'id': game.id,
            'is_published': game.is_published,
            'published_at': game.published_at,
            'message': message
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def start(self, request, pk=None):
        """
        Start a game session
        
        POST /api/v1/games/{id}/start/
        """
        game = self.get_object()
        
        # Check if game is published (for students)
        if request.user.role == 'student' and not game.is_published:
            return Response({
                'error': 'GAME_NOT_PUBLISHED',
                'detail': 'This game is not available yet'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check for active session
        active_attempt = GameAttempt.objects.filter(
            student=request.user,
            lecture_game=game,
            is_completed=False
        ).first()
        
        if active_attempt:
            # Restart the existing attempt (Reset state)
            logger.info(f"[GAME] Restarting active attempt {active_attempt.id} for user {request.user.id}")
            attempt = active_attempt
            attempt.questions_answered = 0
            attempt.correct_answers = 0
            attempt.wrong_answers = 0
            attempt.final_score = 0
            attempt.lives_remaining = game.game_data.get('game_config', {}).get('lives', 3)
            attempt.max_combo_achieved = 0
            attempt.detailed_results = {'answers': []}
            attempt.started_at = timezone.now() # Restart timer
            attempt.save()
        else:
            # Create new attempt
            # Determine count for score calculation
            if game.template.code == 'crossword':
                grid_data = game.game_data.get('grid_data', {})
                content_count = grid_data.get('total_words', 20)
            elif game.template.code == 'match_pairs':
                content_count = len(game.game_data.get('pairs', []))
            else:
                content_count = len(game.game_data.get('questions', []))
            
            attempt = GameAttempt.objects.create(
                student=request.user,
                lecture_game=game,
                max_possible_score=content_count * 100, # Approx base score
                lives_remaining=game.game_data.get('game_config', {}).get('lives', 3)
            )
            
            # Increment play count
            game.total_plays += 1
            game.save(update_fields=['total_plays'])
        
        # Prepare content based on game type
        response_data = {
            'attempt_id': attempt.id,
            'game': {
                'id': game.id,
                'title': game.title,
                'difficulty': game.difficulty,
                'config': game.game_data.get('game_config', {})
            },
            'started_at': attempt.started_at,
            'expires_at': attempt.started_at + timezone.timedelta(minutes=15)
        }

        if game.template.code == 'match_pairs':
            response_data['pairs'] = game.game_data.get('pairs', [])
            
        elif game.template.code == 'crossword':
            # Send sanitized grid data (remove answers from clues)
            import copy
            full_data = game.game_data.get('grid_data', game.game_data)
            sanitized_data = copy.deepcopy(full_data)
            
            # Allow 'game_data' to be the top level container for frontend compatibility
            response_data['game_data'] = sanitized_data
            
            # Sanitize clues to remove 'answer' (cheat prevention)
            # Frontend uses length, so keep that.
            for key in ['across_clues', 'down_clues']:
                if key in sanitized_data:
                    for clue in sanitized_data[key]:
                        if 'answer' in clue:
                            del clue['answer']

        else:
            # Standard Quiz/Game
            content = []
            if 'questions' in game.game_data:
                for q in game.game_data['questions']:
                    content.append({
                        'id': q['id'],
                        'question': q['question'],
                        'options': q['options'],
                        'time_limit': q.get('time_limit', 10),
                        'order': len(content) + 1
                    })
            response_data['questions'] = content
        
        logger.info(f"[GAME] Started game {game.id} for user {request.user.id}, attempt {attempt.id}")
        
        return Response(response_data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def leaderboard(self, request, pk=None):
        """
        Get leaderboard for a game
        
        GET /api/v1/games/{id}/leaderboard/
        """
        game = self.get_object()
        scope = request.query_params.get('scope', 'global')
        limit = int(request.query_params.get('limit', 50))
        
        # Get leaderboard entries
        entries = GameLeaderboard.objects.filter(
            lecture_game=game
        ).select_related('student').order_by('rank')[:limit]
        
        serializer = GameLeaderboardSerializer(
            entries,
            many=True,
            context={'request': request}
        )
        
        # Get current user's rank
        current_user_rank = None
        if request.user.role == 'student':
            user_entry = GameLeaderboard.objects.filter(
                lecture_game=game,
                student=request.user
            ).first()
            
            if user_entry:
                total_players = GameLeaderboard.objects.filter(
                    lecture_game=game
                ).count()
                
                percentile = 0.0
                if total_players > 1:
                    percentile = ((total_players - user_entry.rank) / total_players) * 100
                
                current_user_rank = {
                    'rank': user_entry.rank,
                    'score': user_entry.best_score,
                    'percentile': round(percentile, 2)
                }
        
        return Response({
            'game': {
                'id': game.id,
                'title': game.title
            },
            'scope': scope,
            'total_players': GameLeaderboard.objects.filter(lecture_game=game).count(),
            'leaderboard': serializer.data,
            'current_user_rank': current_user_rank
        })


class GameAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for game attempts
    
    Students can view their own attempts
    Teachers can view all attempts for their games
    """
    serializer_class = GameAttemptSerializer
    permission_classes = [IsAuthenticated, IsOwnAttempt]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['lecture_game', 'is_completed']
    ordering_fields = ['started_at', 'completed_at', 'final_score']
    ordering = ['-completed_at']
    
    def get_queryset(self):
        """Filter attempts based on user role"""
        user = self.request.user
        
        if user.role == 'student':
            return GameAttempt.objects.filter(
                student=user
            ).select_related('lecture_game', 'student')
        
        elif user.role == 'teacher':
            # Teachers see attempts for their games
            return GameAttempt.objects.filter(
                lecture_game__generated_by=user
            ).select_related('lecture_game', 'student')
        
        return GameAttempt.objects.none()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOwnAttempt])
    def answer(self, request, pk=None):
        """
        Submit an answer for validation
        
        POST /api/v1/games/attempts/{id}/answer/
        """
        attempt = self.get_object()
        
        if attempt.is_completed:
            return Response({
                'error': 'ALREADY_COMPLETED',
                'detail': 'This game has already been completed'
            }, status=status.HTTP_409_CONFLICT)
        
        serializer = AnswerSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        question_id = data['question_id']
        selected_index = data['selected_index']
        time_taken = data['time_taken']
        
        # Find question in game data
        game_data = attempt.lecture_game.game_data
        question = next(
            (q for q in game_data['questions'] if q['id'] == question_id),
            None
        )
        
        if not question:
            return Response({
                'error': 'INVALID_QUESTION',
                'detail': 'Question not found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check answer
        is_correct = selected_index == question['correct_index']
        
        # Update attempt stats
        attempt.questions_answered += 1
        
        if is_correct:
            attempt.correct_answers += 1
            
            # SCORING LOGIC
            game_type = attempt.lecture_game.template.code
            
            if game_type == 'hot_potato':
                # Hot Potato Scoring
                base_points = 100
                time_remaining = float(data.get('time_remaining', 0))
                # Bonus: 50 points per second remaining (e.g. 5s = 250 extra)
                speed_bonus = int(time_remaining * 50)
                points = int((base_points + speed_bonus) * (1 + (attempt.max_combo_achieved * 0.2)))
            else:
                # Standard / Quick Drop logic
                points = int(100 * (1 + (attempt.max_combo_achieved * 0.5)))
                
            attempt.final_score += points
        else:
            attempt.wrong_answers += 1
            attempt.lives_remaining -= 1
            attempt.max_combo_achieved = 0  # Reset combo
        
        # Store detailed result
        if not attempt.detailed_results:
            attempt.detailed_results = {'answers': []}
        
        attempt.detailed_results['answers'].append({
            'question_id': question_id,
            'selected_index': selected_index,
            'is_correct': is_correct,
            'time_taken': time_taken,
            'points_earned': points if is_correct else 0
        })
        
        # Check if game is over
        game_over = (
            attempt.lives_remaining <= 0 or
            attempt.questions_answered >= len(game_data['questions'])
        )
        
        if game_over:
            attempt.is_completed = True
            attempt.completed_at = timezone.now()
            attempt.time_taken = int((attempt.completed_at - attempt.started_at).total_seconds())
            attempt.accuracy_percentage = (
                (attempt.correct_answers / attempt.questions_answered * 100)
                if attempt.questions_answered > 0 else 0
            )
            
            # Calculate XP
            attempt.xp_earned = ScoringService.calculate_xp(attempt)
            
            # Award XP to student account
            ScoringService.award_xp_to_student(attempt)
            
            # Update leaderboard
            leaderboard_info = ScoringService.update_leaderboard(attempt)
            
            # Update game analytics
            ScoringService.update_game_analytics(attempt.lecture_game)
            
            # Check badges
            badges_earned = ScoringService.check_badge_triggers(attempt)
        
        attempt.save()
        
        logger.info(
            f"[GAME] Answer submitted for attempt {attempt.id}: "
            f"correct={is_correct}, game_over={game_over}"
        )
        
        return Response({
            'is_correct': is_correct,
            'explanation': question['explanation'],
            'points_earned': points if is_correct else 0,
            'game_over': game_over,
            'current_score': attempt.final_score,
            'lives_remaining': attempt.lives_remaining
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOwnAttempt])
    def match_pair(self, request, pk=None):
        """
        Record a successful pair match
        """
        attempt = self.get_object()
        
        # Validate it's a match pairs game
        if attempt.lecture_game.template.code != 'match_pairs':
            return Response(
                {'error': 'This endpoint is for Match Pairs game only'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pair_id = request.data.get('pair_id')
        flips_so_far = request.data.get('flips_so_far', 0)
        
        # Get game data
        game_data = attempt.lecture_game.game_data
        pairs = game_data.get('pairs', [])
        
        # Find the matched pair
        matched_pair = next((p for p in pairs if p['id'] == pair_id), None)
        if not matched_pair:
            return Response(
                {'error': 'Invalid pair ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update attempt's detailed_results
        if not attempt.detailed_results:
            attempt.detailed_results = {'matches': [], 'total_flips': 0}
        
        attempt.detailed_results.setdefault('matches', [])
        
        # Check if pair already matched (idempotency)
        if any(m['pair_id'] == pair_id for m in attempt.detailed_results['matches']):
             return Response({
                'game_complete': False,
                'matches_remaining': len(pairs) - len(attempt.detailed_results['matches']),
                'current_score': len(attempt.detailed_results['matches']) * 100
            })

        attempt.detailed_results['matches'].append({
            'pair_id': pair_id,
            'flips_at_match': flips_so_far,
            'timestamp': timezone.now().isoformat()
        })
        attempt.detailed_results['total_flips'] = flips_so_far
        
        # Check if game complete
        total_pairs = len(pairs)
        matches_found = len(attempt.detailed_results['matches'])
        
        if matches_found == total_pairs:
            # Game complete! Calculate final score
            attempt.is_completed = True
            attempt.completed_at = timezone.now()
            
            time_taken = (attempt.completed_at - attempt.started_at).total_seconds()
            
            score_data = ScoringService.calculate_match_pairs_score(
                pair_count=total_pairs,
                flips_made=flips_so_far,
                time_taken=time_taken,
                matches_found=matches_found
            )
            
            attempt.final_score = score_data['final_score']
            attempt.correct_answers = matches_found
            attempt.time_taken = int(time_taken)
            attempt.accuracy_percentage = 100 # Always 100% on completion for match pairs? Or based on flips?
            # Let's say 100 if completed
            
            # Calculate XP
            attempt.xp_earned = ScoringService.calculate_xp(attempt)
            
            ScoringService.award_xp_to_student(attempt)
            ScoringService.update_leaderboard(attempt)
            ScoringService.update_game_analytics(attempt.lecture_game)
            ScoringService.check_badge_triggers(attempt)
            
            attempt.save()
            
            return Response({
                'game_complete': True,
                'score_breakdown': score_data,
                'xp_earned': attempt.xp_earned,
                'rank': attempt.rank_achieved
            })
        
        # Intermediate Save
        attempt.save()
        
        return Response({
            'game_complete': False,
            'matches_remaining': total_pairs - matches_found,
            'current_score': matches_found * 100
        })
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsOwnAttempt])
    def results(self, request, pk=None):
        """
        Get detailed results for a completed game
        
        GET /api/v1/games/attempts/{id}/results/
        """
        attempt = self.get_object()
        
        if not attempt.is_completed:
            return Response({
                'error': 'NOT_COMPLETED',
                'detail': 'Game is not yet completed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get badges earned
        badges_earned = []
        try:
            from apps.gamification.models import StudentBadge
            badges = StudentBadge.objects.filter(
                student=attempt.student,
                reference_type='game_attempt',
                reference_id=str(attempt.id)
            ).select_related('badge')
            
            for b in badges:
                badges_earned.append({
                    'name': b.badge.name,
                    'icon': b.badge.icon,
                    'description': b.badge.description,
                    'xp_reward': b.badge.xp_reward
                })
        except ImportError:
            pass
        
        # Get question feedback
        game_data = attempt.lecture_game.game_data
        question_feedback = []
        
        for answer in attempt.detailed_results.get('answers', []):
            question = next(
                (q for q in game_data['questions'] if q['id'] == answer['question_id']),
                None
            )
            
            if question:
                question_feedback.append({
                    'question_id': answer['question_id'],
                    'question_text': question['question'],
                    'your_answer': question['options'][answer['selected_index']],
                    'correct_answer': question['options'][question['correct_index']],
                    'is_correct': answer['is_correct'],
                    'explanation': question['explanation'],
                    'time_taken': answer['time_taken'],
                    'points_earned': answer['points_earned']
                })
        
        # Generate insights
        insights = {
            'strengths': [],
            'improvements': [],
            'suggested_topics': []
        }
        
        if attempt.accuracy_percentage >= 80:
            insights['strengths'].append('High accuracy')
        if attempt.max_combo_achieved >= 5:
            insights['strengths'].append('Great combo streak')
        if attempt.accuracy_percentage < 60:
            insights['improvements'].append('Focus on accuracy over speed')
        
        return Response({
            'attempt_id': attempt.id,
            'final_score': attempt.final_score,
            'max_possible_score': attempt.max_possible_score,
            'accuracy': attempt.accuracy_percentage,
            'correct_answers': attempt.correct_answers,
            'wrong_answers': attempt.wrong_answers,
            'time_taken': attempt.time_taken,
            'max_combo': attempt.max_combo_achieved,
            'xp_earned': attempt.xp_earned,
            'badges_earned': badges_earned,
            'rank': attempt.rank_achieved,
            'rank_change': None,  # TODO: Calculate from previous attempts
            'percentile': None,  # TODO: Calculate from leaderboard
            'question_feedback': question_feedback,
            'insights': insights,
            'completed_at': attempt.completed_at
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOwnAttempt])
    def check_crossword(self, request, pk=None):
        """
        Validate crossword answers.
        
        Request:
        {
            "answers": {
                "1-across": "INTERNET",
                "2-down": "SENSOR"
            }
        }
        """
        attempt = self.get_object()
        
        if attempt.lecture_game.template.code != 'crossword':
            return Response({'error': 'Not a crossword game'}, status=400)
        
        user_answers = request.data.get('answers', {})
        game_data_raw = attempt.lecture_game.game_data
        game_data = game_data_raw.get('grid_data', game_data_raw)
        
        correct = []
        incorrect = []
        
        # Check across clues
        # Check across clues
        for clue in game_data.get('across_clues', []):
            clue_key = f"{clue['number']}-across"
            raw_answer = user_answers.get(clue_key, '')
            # Normalize: remove spaces, uppercase
            answer_raw = clue.get('answer', '')
            user_answer = "".join(str(raw_answer).split()).upper()
            target_answer = "".join(answer_raw.split()).upper()
            
            if user_answer == target_answer and target_answer:
                correct.append(clue_key)
            elif raw_answer and raw_answer.strip():
                incorrect.append(clue_key)
        
        # Check down clues
        for clue in game_data.get('down_clues', []):
            clue_key = f"{clue['number']}-down"
            raw_answer = user_answers.get(clue_key, '')
            answer_raw = clue.get('answer', '')
            user_answer = "".join(str(raw_answer).split()).upper()
            target_answer = "".join(answer_raw.split()).upper()
            
            if user_answer == target_answer and target_answer:
                correct.append(clue_key)
            elif raw_answer and raw_answer.strip():
                incorrect.append(clue_key)
        
        total_clues = 0
        for clue in game_data.get('across_clues', []):
             if clue.get('answer'): total_clues += 1
        for clue in game_data.get('down_clues', []):
             if clue.get('answer'): total_clues += 1
        
        if total_clues == 0:
            completion = 0
            is_complete = False
        else:
            completion = (len(correct) / total_clues) * 100
            is_complete = len(correct) >= total_clues
        
        # If complete, finalize attempt
        if is_complete and not attempt.is_completed:
            attempt.is_completed = True
            attempt.completed_at = timezone.now()
            
            time_taken = (attempt.completed_at - attempt.started_at).total_seconds()
            hints_used = attempt.detailed_results.get('hints_used', 0) if attempt.detailed_results else 0
            
            # Calculate score
            base_score = len(correct) * 50
            hint_penalty = hints_used * 25
            time_bonus = max(0, int((300 - time_taken) / 10)) if time_taken < 300 else 0
            
            attempt.final_score = max(0, base_score - hint_penalty + time_bonus)
            attempt.correct_answers = len(correct)
            attempt.questions_answered = total_clues
            attempt.wrong_answers = max(0, total_clues - len(correct))
            
            if total_clues > 0:
                attempt.accuracy_percentage = (len(correct) / total_clues) * 100.0
            else:
                attempt.accuracy_percentage = 0.0
                
            attempt.time_taken = int(time_taken)
            attempt.xp_earned = ScoringService.calculate_xp(attempt)
            attempt.save()
            
            ScoringService.update_leaderboard(attempt)
            ScoringService.update_game_analytics(attempt.lecture_game)
        
        return Response({
            'correct': correct,
            'incorrect': incorrect,
            'completion_percentage': completion,
            'is_complete': is_complete,
            'stats': {'correct': len(correct), 'total': total_clues},
            'final_score': attempt.final_score if is_complete else None
        })


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOwnAttempt])
    def reveal_hint(self, request, pk=None):
        """
        Reveal a letter or word as a hint.
        
        Request:
        {
            "type": "letter" | "word",
            "clue_key": "1-across",
            "cell_index": 0  # For letter reveal only
        }
        """
        attempt = self.get_object()
        hint_type = request.data.get('type')
        clue_key = request.data.get('clue_key')
        
        game_data_raw = attempt.lecture_game.game_data
        game_data = game_data_raw.get('grid_data', game_data_raw)
        
        # Find the answer
        direction = 'across' if 'across' in clue_key else 'down'
        number = int(clue_key.split('-')[0])
        
        clues = game_data.get(f'{direction}_clues', [])
        clue = next((c for c in clues if c['number'] == number), None)
        
        if not clue:
            return Response({'error': 'Invalid clue'}, status=400)
        
        # Track hint usage
        if not attempt.detailed_results:
            attempt.detailed_results = {'hints_used': 0, 'hints': []}
        
        if 'hints_used' not in attempt.detailed_results:
            attempt.detailed_results['hints_used'] = 0
            attempt.detailed_results['hints'] = []
            
        attempt.detailed_results['hints_used'] += 1
        
        response_data = {'clue_key': clue_key}
        if hint_type == 'letter':
            cell_index = request.data.get('cell_index', 0)
            if 0 <= cell_index < len(clue['answer']):
                response_data['letter'] = clue['answer'][cell_index]
                response_data['position'] = cell_index
            else:
                return Response({'error': 'Invalid cell index'}, status=400)
        else:  # word
            response_data['answer'] = clue['answer']
        
        attempt.detailed_results['hints'].append({
            'clue_key': clue_key,
            'type': hint_type,
            'timestamp': timezone.now().isoformat()
        })
        
        attempt.save()
        
        return Response(response_data)
