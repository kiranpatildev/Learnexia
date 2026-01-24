"""
Scoring Service for Games

Handles score calculation, XP rewards, and leaderboard updates
"""

import logging
from typing import Dict, Any
from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from ..models import GameAttempt, GameLeaderboard, LectureGame
from apps.gamification.models import Badge
from apps.accounts.models import User

logger = logging.getLogger(__name__)


class ScoringService:
    """Service for calculating scores and managing leaderboards"""
    
    # XP Configuration
    BASE_XP = 50
    ACCURACY_XP_MULTIPLIER = 30  # Max 30 XP for 100% accuracy
    COMBO_XP_PER_LEVEL = 5
    SPEED_BONUS_MAX = 20
    
    # Difficulty Multipliers
    DIFFICULTY_MULTIPLIERS = {
        'EASY': Decimal('1.0'),
        'MEDIUM': Decimal('1.5'),
        'HARD': Decimal('2.0'),
    }
    
    @classmethod
    def calculate_xp(cls, attempt: GameAttempt) -> int:
        """
        Calculate XP earned for a game attempt
        
        Args:
            attempt: GameAttempt instance
        
        Returns:
            int: XP earned
        """
        # Base XP
        xp = cls.BASE_XP
        
        # Accuracy bonus (0-30 XP)
        accuracy_bonus = int(
            float(attempt.accuracy_percentage) * cls.ACCURACY_XP_MULTIPLIER / 100
        )
        xp += accuracy_bonus
        
        # Combo bonus
        combo_bonus = attempt.max_combo_achieved * cls.COMBO_XP_PER_LEVEL
        xp += combo_bonus
        
        # Speed bonus (faster completion = more XP)
        if attempt.time_taken > 0 and attempt.questions_answered > 0:
            avg_time_per_question = attempt.time_taken / attempt.questions_answered
            if avg_time_per_question < 5:
                speed_bonus = cls.SPEED_BONUS_MAX
            elif avg_time_per_question < 8:
                speed_bonus = cls.SPEED_BONUS_MAX // 2
            else:
                speed_bonus = 0
            xp += speed_bonus
        
        # Difficulty multiplier
        difficulty = attempt.lecture_game.difficulty
        multiplier = cls.DIFFICULTY_MULTIPLIERS.get(difficulty, Decimal('1.0'))
        xp = int(Decimal(xp) * multiplier)
        
        logger.info(
            f"[SCORING] XP calculation for attempt {attempt.id}: "
            f"base={cls.BASE_XP}, accuracy={accuracy_bonus}, "
            f"combo={combo_bonus}, difficulty_mult={multiplier}, total={xp}"
        )
        
        return xp
    
    @classmethod
    def calculate_score(
        cls,
        correct_answers: int,
        combo_multiplier: float,
        base_points: int = 100
    ) -> int:
        """
        Calculate game score
        
        Args:
            correct_answers: Number of correct answers
            combo_multiplier: Combo multiplier achieved
            base_points: Base points per correct answer
        
        Returns:
            int: Total score
        """
        return int(correct_answers * base_points * combo_multiplier)
    
    @classmethod
    def calculate_match_pairs_score(cls, pair_count, flips_made, time_taken, matches_found):
        """
        Calculate score for Match the Pairs game.
        """
        # Base points per match
        base_points = matches_found * 100
        
        # Perfect flips bonus
        # Perfect = 2 flips per pair (flip both cards once)
        perfect_flips = pair_count * 2
        extra_flips = max(0, flips_made - perfect_flips)
        flip_penalty = extra_flips * 10
        efficiency_bonus = max(0, (perfect_flips - extra_flips) * 10)
        
        # Memory performance bonus
        # Based on how close to perfect they got
        # Avoid division by zero
        denom = max(flips_made, perfect_flips)
        if denom == 0:
            memory_efficiency = 1.0
        else:
            memory_efficiency = perfect_flips / denom
            
        memory_bonus = int(memory_efficiency * 200)
        
        # Time bonus (optional - can disable)
        # Faster completion = more points
        # Expected: 2 seconds per pair
        expected_time = pair_count * 2
        
        if time_taken < expected_time and matches_found == pair_count:
            # Only award time bonus if completed
            time_bonus = int((expected_time - time_taken) * 5)
        else:
            time_bonus = 0
        
        if time_bonus < 0:
            time_bonus = 0
            
        # Calculate final score
        final_score = base_points + efficiency_bonus + memory_bonus + time_bonus - flip_penalty
        final_score = max(0, final_score)  # No negative scores
        
        return {
            'base_points': base_points,
            'efficiency_bonus': efficiency_bonus,
            'memory_bonus': memory_bonus,
            'time_bonus': time_bonus,
            'flip_penalty': flip_penalty,
            'final_score': final_score,
            'perfect_game': flips_made == perfect_flips and matches_found == pair_count,
            'memory_efficiency': round(memory_efficiency * 100, 1)
        }
    
    @classmethod
    @transaction.atomic
    def update_leaderboard(cls, attempt: GameAttempt) -> Dict[str, Any]:
        """
        Update leaderboard after game completion
        
        Args:
            attempt: Completed GameAttempt instance
        
        Returns:
            dict: {
                'rank': int,
                'rank_change': int,
                'total_players': int,
                'percentile': float
            }
        """
        if not attempt.is_completed:
            logger.warning(f"Attempt {attempt.id} is not completed")
            return {
                'rank': None,
                'rank_change': 0,
                'total_players': 0,
                'percentile': 0.0
            }
        
        lecture_game = attempt.lecture_game
        student = attempt.student
        
        # Get or create leaderboard entry
        entry, created = GameLeaderboard.objects.get_or_create(
            lecture_game=lecture_game,
            student=student,
            defaults={
                'rank': 0,  # Will be calculated
                'best_score': attempt.final_score,
                'best_attempt': attempt,
                'total_plays': 1,
                'last_played': attempt.completed_at or timezone.now()
            }
        )
        
        # Track previous rank
        previous_rank = entry.rank if not created else None
        
        # Update entry if this is a better score
        if attempt.final_score > entry.best_score:
            entry.best_score = attempt.final_score
            entry.best_attempt = attempt
        
        entry.total_plays += 1 if not created else 0
        entry.last_played = attempt.completed_at or timezone.now()
        entry.save()
        
        # Recalculate all ranks for this game
        cls._recalculate_ranks(lecture_game)
        
        # Refresh entry to get updated rank
        entry.refresh_from_db()
        
        # Calculate rank change
        rank_change = 0
        if previous_rank and entry.rank:
            rank_change = previous_rank - entry.rank  # Positive = moved up
        
        # Calculate percentile
        total_players = GameLeaderboard.objects.filter(
            lecture_game=lecture_game
        ).count()
        
        percentile = 0.0
        if total_players > 1 and entry.rank:
            percentile = ((total_players - entry.rank) / total_players) * 100
        
        # Update attempt with rank
        attempt.rank_achieved = entry.rank
        attempt.save(update_fields=['rank_achieved'])
        
        logger.info(
            f"[LEADERBOARD] Updated for attempt {attempt.id}: "
            f"rank={entry.rank}, change={rank_change}, percentile={percentile:.1f}%"
        )
        
        return {
            'rank': entry.rank,
            'rank_change': rank_change,
            'total_players': total_players,
            'percentile': round(percentile, 2)
        }
    
    @classmethod
    def _recalculate_ranks(cls, lecture_game: LectureGame) -> None:
        """
        Recalculate ranks for all players in a game
        
        Args:
            lecture_game: LectureGame instance
        """
        entries = GameLeaderboard.objects.filter(
            lecture_game=lecture_game
        ).order_by('-best_score', 'last_played')
        
        for rank, entry in enumerate(entries, start=1):
            if entry.rank != rank:
                entry.rank = rank
                entry.save(update_fields=['rank'])
    
    @classmethod
    @transaction.atomic
    def update_game_analytics(cls, lecture_game: LectureGame) -> None:
        """
        Update game analytics after an attempt
        
        Args:
            lecture_game: LectureGame instance
        """
        attempts = GameAttempt.objects.filter(
            lecture_game=lecture_game,
            is_completed=True
        )
        
        total_attempts = attempts.count()
        
        if total_attempts == 0:
            return
        
        # Calculate averages
        total_score = sum(a.final_score for a in attempts)
        total_time = sum(a.time_taken for a in attempts)
        
        avg_score = Decimal(total_score) / Decimal(total_attempts)
        avg_time = total_time // total_attempts
        
        # Get highest score
        highest_attempt = attempts.order_by('-final_score').first()
        
        # Update lecture game
        lecture_game.total_completions = total_attempts
        lecture_game.average_score = avg_score
        lecture_game.average_completion_time = avg_time
        
        if highest_attempt and highest_attempt.final_score > lecture_game.highest_score:
            lecture_game.highest_score = highest_attempt.final_score
            lecture_game.highest_scorer = highest_attempt.student
        
        lecture_game.save(update_fields=[
            'total_completions',
            'average_score',
            'average_completion_time',
            'highest_score',
            'highest_scorer'
        ])
        
        logger.info(
            f"[ANALYTICS] Updated for game {lecture_game.id}: "
            f"completions={total_attempts}, avg_score={avg_score:.2f}"
        )
    
    @classmethod
    def award_xp_to_student(cls, attempt: GameAttempt) -> None:
        """Add XP to student profile"""
        try:
            from apps.gamification.models import StudentXP, XPTransaction
            
            xp = attempt.xp_earned
            if xp <= 0:
                return
                
            student_xp, created = StudentXP.objects.get_or_create(student=attempt.student)
            student_xp.total_xp += xp
            # Simple level scaling: 1000 XP per level
            student_xp.current_level = 1 + (student_xp.total_xp // 1000)
            student_xp.save()
            
            # Log transaction
            XPTransaction.objects.create(
                student=attempt.student,
                transaction_type='earned',
                source='game_completed',
                amount=xp,
                balance_after=student_xp.total_xp,
                description=f"Earned from game: {attempt.lecture_game.title}",
                reference_type='game_attempt',
                reference_id=str(attempt.id)
            )
            logger.info(f"[XP] Awarded {xp} XP to user {attempt.student.id}. Total: {student_xp.total_xp}")
        except Exception as e:
            logger.error(f"[XP] Failed to award XP: {str(e)}")

    @classmethod
    def check_badge_triggers(cls, attempt: GameAttempt) -> list:
        """
        Check if attempt triggers any badges
        """
        earned_badges = []
        student = attempt.student
        
        # Perfect Score Badge
        if attempt.is_perfect_score:
            badge_name = 'Perfect Game Score'
            if not cls._has_badge(student, badge_name):
                badge = cls._award_badge(student, badge_name, attempt)
                if badge:
                    earned_badges.append(badge)
        
        # Speed Demon Badge (completed in under 60 seconds)
        if attempt.time_taken < 60:
            badge_name = 'Speed Demon'
            if not cls._has_badge(student, badge_name):
                badge = cls._award_badge(student, badge_name, attempt)
                if badge:
                    earned_badges.append(badge)
        
        # Combo Master Badge (10+ combo)
        if attempt.max_combo_achieved >= 10:
            badge_name = 'Combo Master'
            if not cls._has_badge(student, badge_name):
                badge = cls._award_badge(student, badge_name, attempt)
                if badge:
                    earned_badges.append(badge)
        
        # First Game Badge
        total_games = GameAttempt.objects.filter(
            student=student,
            is_completed=True
        ).count()
        
        if total_games == 1:
            badge_name = 'First Game Complete'
            if not cls._has_badge(student, badge_name):
                badge = cls._award_badge(student, badge_name, attempt)
                if badge:
                    earned_badges.append(badge)
        
        return earned_badges
    
    @classmethod
    def _has_badge(cls, user: User, badge_name: str) -> bool:
        """Check if user has a specific badge"""
        return user.earned_badges.filter(badge__name=badge_name).exists()
    
    @classmethod
    def _award_badge(cls, user: User, badge_name: str, attempt: GameAttempt = None):
        """Award a badge to user"""
        try:
            badge = Badge.objects.get(name=badge_name)
            from apps.gamification.models import StudentBadge
            
            StudentBadge.objects.create(
                student=user,
                badge=badge,
                earned_for='Game achievement',
                reference_type='game_attempt',
                reference_id=str(attempt.id) if attempt else ''
            )
            logger.info(f"[BADGES] Awarded '{badge.name}' to user {user.id}")
            return badge
        except Badge.DoesNotExist:
            logger.warning(f"[BADGES] Badge '{badge_name}' not found")
            return None
        except Exception as e:
            logger.error(f"[BADGES] Error awarding badge: {str(e)}")
            return None
