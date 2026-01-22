from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.games.models import GameTemplate, LectureGame, GameAttempt, GameLeaderboard
from apps.lectures.models import Lecture
from apps.schools.models import Classroom, School, AcademicYear, Subject
from apps.games.services.scoring_service import ScoringService

User = get_user_model()


class GameLogicTests(TestCase):
    def setUp(self):
        # Create users
        self.teacher = User.objects.create_user(
            email='teacher@example.com', password='password', role='teacher'
        )
        self.student = User.objects.create_user(
            email='student@example.com', password='password', role='student'
        )
        
        # Create school dependencies
        self.school = School.objects.create(
            name='Test School', code='TEST01',
            city='Test City', state='Test State', pincode='123456',
            email='school@test.com', principal_name='Principal', established_year=2000
        )
        self.academic_year = AcademicYear.objects.create(
            school=self.school, name='2025-2026',
            start_date='2025-01-01', end_date='2026-01-01'
        )
        self.subject = Subject.objects.create(
            name='Test Subject', code='SUBJ001', grade=5
        )
        
        # Create classroom
        self.classroom = Classroom.objects.create(
            school=self.school,
            academic_year=self.academic_year,
            subject=self.subject,
            grade=5,
            section='A',
            class_code='TESTCLASS01',
            teacher=self.teacher
        )
        
        self.lecture = Lecture.objects.create(
            title='Test Lecture',
            teacher=self.teacher,
            classroom=self.classroom
        )
        
        # Create template
        self.template = GameTemplate.objects.create(
            code='fall_drop',
            name='Fall Drop',
            game_type='REACTION'
        )
        
        # Create game
        self.game = LectureGame.objects.create(
            lecture=self.lecture,
            template=self.template,
            generated_by=self.teacher,
            title='Test Game',
            difficulty='MEDIUM',
            question_count=5,
            game_data={
                'game_config': {'lives': 3},
                'questions': [
                    {'id': 'q1', 'correct_index': 0},
                    {'id': 'q2', 'correct_index': 1},
                ]
            }
        )

    def test_xp_calculation(self):
        """Test XP calculation logic"""
        attempt = GameAttempt.objects.create(
            student=self.student,
            lecture_game=self.game,
            final_score=1000,
            correct_answers=10,
            questions_answered=10,
            time_taken=50,
            max_combo_achieved=5,
            is_completed=True
        )
        
        # Manually calculate accuracy for test
        attempt.accuracy_percentage = 100
        attempt.save()
        
        xp = ScoringService.calculate_xp(attempt)
        
        # Base (50) + Accuracy (30) + Combo (5*5=25) + Speed (50/10=5s avg -> <8s -> 10)
        # = 115 * 1.5 (Medium difficulty) = 172.5 -> 172
        
        self.assertTrue(xp > 100, f"XP should be substantial, got {xp}")
        self.assertEqual(xp, 172)

    def test_leaderboard_update(self):
        """Test leaderboard ranking logic"""
        # Create attempts for multiple students
        student2 = User.objects.create_user(email='student2@example.com', password='password', role='student')
        
        # Student 1 attempt (Score 1000)
        attempt1 = GameAttempt.objects.create(
            student=self.student,
            lecture_game=self.game,
            final_score=1000,
            is_completed=True,
            completed_at=timezone.now()
        )
        ScoringService.update_leaderboard(attempt1)
        
        # Student 2 attempt (Score 2000)
        attempt2 = GameAttempt.objects.create(
            student=student2,
            lecture_game=self.game,
            final_score=2000,
            is_completed=True,
            completed_at=timezone.now()
        )
        ScoringService.update_leaderboard(attempt2)
        
        # Check ranks
        lb1 = GameLeaderboard.objects.get(student=self.student, lecture_game=self.game)
        lb2 = GameLeaderboard.objects.get(student=student2, lecture_game=self.game)
        
        self.assertEqual(lb2.rank, 1, "Higher score should be rank 1")
        self.assertEqual(lb1.rank, 2, "Lower score should be rank 2")
        
        # Student 1 plays again and beats Student 2 (Score 3000)
        attempt3 = GameAttempt.objects.create(
            student=self.student,
            lecture_game=self.game,
            final_score=3000,
            is_completed=True,
            completed_at=timezone.now()
        )
        ScoringService.update_leaderboard(attempt3)
        
        lb1.refresh_from_db()
        lb2.refresh_from_db()
        
        self.assertEqual(lb1.rank, 1, "Student 1 should now be rank 1")
        self.assertEqual(lb1.best_score, 3000)

    def test_analytics_update(self):
        """Test game analytics aggregation"""
        attempt = GameAttempt.objects.create(
            student=self.student,
            lecture_game=self.game,
            final_score=1000,
            time_taken=60,
            is_completed=True
        )
        ScoringService.update_game_analytics(self.game)
        
        self.game.refresh_from_db()
        self.assertEqual(self.game.total_completions, 1)
        self.assertEqual(self.game.average_score, 1000)
        self.assertEqual(self.game.average_completion_time, 60)
