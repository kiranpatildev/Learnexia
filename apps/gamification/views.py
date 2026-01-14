"""
Views for gamification app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import date

from .models import (
    StudentXP, XPTransaction, Badge, StudentBadge,
    Leaderboard, LeaderboardEntry, Achievement, StudentAchievement
)
from .serializers import (
    StudentXPSerializer, XPTransactionSerializer, BadgeSerializer,
    StudentBadgeSerializer, LeaderboardSerializer, LeaderboardEntrySerializer,
    AchievementSerializer, StudentAchievementSerializer
)
from apps.core.permissions import IsTeacher


class StudentXPViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for student XP (read-only, XP awarded through actions)"""
    serializer_class = StudentXPSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student']
    ordering = ['-total_xp']
    
    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return StudentXP.objects.none()
        
        if user.role == 'student':
            # Students see their own XP
            return StudentXP.objects.filter(student=user)
        
        elif user.role == 'parent':
            # Parents see children's XP
            children = user.children_relationships.values_list('student_id', flat=True)
            return StudentXP.objects.filter(student_id__in=children)
        
        elif user.role in ['teacher', 'admin']:
            # Teachers/admins see all
            return StudentXP.objects.all()
        
        return StudentXP.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_xp(self, request):
        """Get current user's XP (for students)"""
        if request.user.role != 'student':
            return Response(
                {'error': 'This endpoint is only for students'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        xp, created = StudentXP.objects.get_or_create(student=request.user)
        serializer = self.get_serializer(xp)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def award_xp(self, request):
        """
        Award XP to student manually
        
        Used by teachers for special achievements
        """
        student_id = request.data.get('student_id')
        amount = request.data.get('amount')
        description = request.data.get('description', 'Manual XP award')
        
        if not student_id or not amount:
            return Response(
                {'error': 'student_id and amount required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from apps.accounts.models import User
            student = User.objects.get(id=student_id, role='student')
        except User.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Award XP
        xp_data = self.add_xp(
            student=student,
            amount=int(amount),
            source='manual',
            description=description,
            awarded_by=request.user
        )
        
        return Response(xp_data)
    
    def add_xp(self, student, amount, source, description, awarded_by=None):
        """Helper method to add XP to student"""
        # Get or create StudentXP
        student_xp, created = StudentXP.objects.get_or_create(student=student)
        
        # Add XP
        student_xp.total_xp += amount
        
        # Check for level up
        while student_xp.total_xp >= student_xp.xp_to_next_level:
            student_xp.current_level += 1
            student_xp.xp_to_next_level = 100 * student_xp.current_level  # Simple formula
        
        # Update streak
        today = date.today()
        if student_xp.last_activity_date:
            days_diff = (today - student_xp.last_activity_date).days
            if days_diff == 1:
                # Consecutive day
                student_xp.current_streak += 1
                if student_xp.current_streak > student_xp.longest_streak:
                    student_xp.longest_streak = student_xp.current_streak
            elif days_diff > 1:
                # Streak broken
                student_xp.current_streak = 1
        else:
            student_xp.current_streak = 1
        
        student_xp.last_activity_date = today
        student_xp.save()
        
        # Create transaction record
        transaction = XPTransaction.objects.create(
            student=student,
            transaction_type='earned',
            source=source,
            amount=amount,
            balance_after=student_xp.total_xp,
            description=description,
            awarded_by=awarded_by
        )
        
        # Check for achievements
        self.check_achievements(student, student_xp)
        
        return {
            'student': student.get_full_name(),
            'amount': amount,
            'new_total': student_xp.total_xp,
            'current_level': student_xp.current_level,
            'leveled_up': student_xp.current_level > (student_xp.total_xp - amount) // 100 + 1
        }
    
    def check_achievements(self, student, student_xp):
        """Check if student unlocked any achievements"""
        achievements = Achievement.objects.filter(is_active=True)
        
        for achievement in achievements:
            # Check if already unlocked
            if StudentAchievement.objects.filter(student=student, achievement=achievement).exists():
                continue
            
            # Check requirements
            unlocked = False
            if achievement.requirement_type == 'xp_milestone':
                unlocked = student_xp.total_xp >= achievement.requirement_value
            elif achievement.requirement_type == 'level_reached':
                unlocked = student_xp.current_level >= achievement.requirement_value
            elif achievement.requirement_type == 'badges_collected':
                unlocked = student_xp.total_badges_earned >= achievement.requirement_value
            elif achievement.requirement_type == 'streak_milestone':
                unlocked = student_xp.longest_streak >= achievement.requirement_value
            
            if unlocked:
                # Unlock achievement
                StudentAchievement.objects.create(student=student, achievement=achievement)
                student_xp.total_achievements += 1
                student_xp.save()
                
                # Award XP
                if achievement.xp_reward > 0:
                    self.add_xp(
                        student=student,
                        amount=achievement.xp_reward,
                        source='manual',
                        description=f'Achievement unlocked: {achievement.name}'
                    )


class XPTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for XP transaction history"""
    serializer_class = XPTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'transaction_type', 'source']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return XPTransaction.objects.none()
        
        if user.role == 'student':
            return XPTransaction.objects.filter(student=user)
        
        elif user.role == 'parent':
            children = user.children_relationships.values_list('student_id', flat=True)
            return XPTransaction.objects.filter(student_id__in=children)
        
        elif user.role in ['teacher', 'admin']:
            return XPTransaction.objects.all()
        
        return XPTransaction.objects.none()


class BadgeViewSet(viewsets.ModelViewSet):
    """ViewSet for badges"""
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['category', 'rarity', 'is_active']
    ordering = ['category', 'name']
    
    def get_queryset(self):
        user = self.request.user
        
        # Students see non-secret badges or badges they've earned
        if user.role == 'student':
            earned_badge_ids = StudentBadge.objects.filter(student=user).values_list('badge_id', flat=True)
            return Badge.objects.filter(
                Q(is_secret=False) | Q(id__in=earned_badge_ids),
                is_active=True
            )
        
        # Others see all active badges
        return Badge.objects.filter(is_active=True)


class StudentBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for student badges"""
    serializer_class = StudentBadgeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'badge']
    ordering = ['-earned_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return StudentBadge.objects.none()
        
        if user.role == 'student':
            return StudentBadge.objects.filter(student=user)
        
        elif user.role == 'parent':
            children = user.children_relationships.values_list('student_id', flat=True)
            return StudentBadge.objects.filter(student_id__in=children)
        
        elif user.role in ['teacher', 'admin']:
            return StudentBadge.objects.all()
        
        return StudentBadge.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_badges(self, request):
        """Get current user's badges (for students)"""
        if request.user.role != 'student':
            return Response(
                {'error': 'This endpoint is only for students'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        badges = self.get_queryset().filter(student=request.user)
        serializer = self.get_serializer(badges, many=True)
        return Response(serializer.data)


class LeaderboardViewSet(viewsets.ModelViewSet):
    """ViewSet for leaderboards"""
    serializer_class = LeaderboardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['leaderboard_type', 'scope', 'time_period', 'classroom']
    
    def get_queryset(self):
        return Leaderboard.objects.filter(is_active=True)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTeacher])
    def refresh(self, request, pk=None):
        """Refresh leaderboard rankings"""
        leaderboard = self.get_object()
        
        # Get students based on scope
        from apps.accounts.models import User
        students = User.objects.filter(role='student', is_active=True)
        
        if leaderboard.scope == 'classroom' and leaderboard.classroom:
            from apps.schools.models import ClassroomEnrollment
            student_ids = ClassroomEnrollment.objects.filter(
                classroom=leaderboard.classroom, is_active=True
            ).values_list('student_id', flat=True)
            students = students.filter(id__in=student_ids)
        
        elif leaderboard.scope == 'grade' and leaderboard.grade_level:
            students = students.filter(grade_level=leaderboard.grade_level)
        
        # Calculate scores
        entries = []
        for student in students:
            score = 0
            if leaderboard.leaderboard_type == 'xp':
                try:
                    score = student.student_xp.total_xp
                except:
                    score = 0
            elif leaderboard.leaderboard_type == 'level':
                try:
                    score = student.student_xp.current_level
                except:
                    score = 1
            elif leaderboard.leaderboard_type == 'badges':
                score = student.earned_badges.count()
            elif leaderboard.leaderboard_type == 'streak':
                try:
                    score = student.student_xp.current_streak
                except:
                    score = 0
            
            entries.append({'student': student, 'score': score})
        
        # Sort by score
        entries.sort(key=lambda x: x['score'], reverse=True)
        
        # Update leaderboard entries
        LeaderboardEntry.objects.filter(leaderboard=leaderboard).delete()
        
        for rank, entry in enumerate(entries[:leaderboard.max_entries], start=1):
            LeaderboardEntry.objects.create(
                leaderboard=leaderboard,
                student=entry['student'],
                rank=rank,
                score=entry['score']
            )
        
        leaderboard.last_updated = timezone.now()
        leaderboard.save()
        
        return Response({
            'message': f'Leaderboard refreshed with {len(entries[:leaderboard.max_entries])} entries',
            'last_updated': leaderboard.last_updated
        })


class AchievementViewSet(viewsets.ModelViewSet):
    """ViewSet for achievements"""
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['requirement_type', 'is_active']
    
    def get_queryset(self):
        return Achievement.objects.filter(is_active=True)


class StudentAchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for student achievements"""
    serializer_class = StudentAchievementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'achievement']
    ordering = ['-unlocked_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return StudentAchievement.objects.none()
        
        if user.role == 'student':
            return StudentAchievement.objects.filter(student=user)
        
        elif user.role == 'parent':
            children = user.children_relationships.values_list('student_id', flat=True)
            return StudentAchievement.objects.filter(student_id__in=children)
        
        elif user.role in ['teacher', 'admin']:
            return StudentAchievement.objects.all()
        
        return StudentAchievement.objects.none()
