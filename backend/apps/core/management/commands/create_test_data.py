"""
Create comprehensive test data with proper behavior incidents
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

from apps.accounts.models import User
from apps.schools.models import Classroom, ClassroomEnrollment
from apps.behavior.models import BehaviorIncident, PendingBehaviorDetection
from apps.lectures.models import Lecture
from apps.attendance.models import AttendanceSession, AttendanceRecord
from apps.assignments.models import Assignment


class Command(BaseCommand):
    help = 'Create comprehensive realistic test data'

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 Creating comprehensive test data...\n")
        
        # Get existing data
        teachers = list(User.objects.filter(role='teacher', is_active=True))
        students = list(User.objects.filter(role='student', is_active=True))
        classrooms = list(Classroom.objects.all())
        
        if not teachers or not students or not classrooms:
            self.stdout.write(self.style.ERROR("Missing base data! Run enroll_students first."))
            return
        
        self.stdout.write(f"Found: {len(teachers)} teachers, {len(students)} students, {len(classrooms)} classrooms\n")
        
        # ============================================================================
        # 1. CREATE LECTURES
        # ============================================================================
        self.stdout.write("\n🎥 Creating Lectures...")
        lecture_count = 0
        lectures = []
        for classroom in classrooms[:3]:  # First 3 classrooms
            for i in range(5):
                lecture, created = Lecture.objects.get_or_create(
                    classroom=classroom,
                    teacher=classroom.teacher,
                    title=f"{classroom.subject.name} - Lesson {i+1}",
                    defaults={
                        'description': f"Introduction to {classroom.subject.name} concepts",
                        'chapter': f"Chapter {i+1}",
                        'topic': f"Topic {i+1}: Fundamentals",
                        'recording_type': 'audio',
                        'duration': random.randint(1800, 3600),
                        'status': 'completed',
                        'is_shared_with_students': True,
                        'transcript': f"This is a sample lecture transcript for {classroom.subject.name}."
                    }
                )
                if created:
                    lecture_count += 1
                    lectures.append(lecture)
        self.stdout.write(self.style.SUCCESS(f"✅ Created {lecture_count} lectures"))
        
        # ============================================================================
        # 2. CREATE ASSIGNMENTS
        # ============================================================================
        self.stdout.write("\n📋 Creating Assignments...")
        assignment_count = 0
        for classroom in classrooms[:3]:
            for i in range(3):
                _, created = Assignment.objects.get_or_create(
                    classroom=classroom,
                    teacher=classroom.teacher,
                    title=f"{classroom.subject.name} Assignment {i+1}",
                    defaults={
                        'description': f"Complete exercises on {classroom.subject.name}",
                        'instructions': f"Read chapter {i+1} and answer all questions",
                        'total_points': 100,
                        'due_date': timezone.now() + timedelta(days=7+i*7)
                    }
                )
                if created:
                    assignment_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Created {assignment_count} assignments"))
        
        # ============================================================================
        # 3. CREATE ATTENDANCE SESSIONS & RECORDS
        # ============================================================================
        self.stdout.write("\n✅ Creating Attendance...")
        attendance_count = 0
        for classroom in classrooms[:3]:
            enrolled = ClassroomEnrollment.objects.filter(classroom=classroom, is_active=True)
            for days_ago in range(15):
                date = (timezone.now() - timedelta(days=days_ago)).date()
                
                session, _ = AttendanceSession.objects.get_or_create(
                    classroom=classroom,
                    date=date,
                    defaults={
                        'teacher': classroom.teacher,
                        'session_type': 'full_day'
                    }
                )
                
                for enrollment in enrolled:
                    _, created = AttendanceRecord.objects.get_or_create(
                        session=session,
                        student=enrollment.student,
                        defaults={
                            'status': random.choices(
                                ['present', 'absent', 'late', 'excused'],
                                weights=[85, 5, 7, 3]
                            )[0]
                        }
                    )
                    if created:
                        attendance_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Created {attendance_count} attendance records"))
        
        # ============================================================================
        # 4. CREATE REAL BEHAVIOR INCIDENTS (APPROVED)
        # ============================================================================
        self.stdout.write("\n⚠️ Creating Approved Behavior Incidents...")
        incident_scenarios = [
            {
                'type': 'disruption',
                'title': 'Classroom Disruption',
                'description': 'Student was talking loudly during lecture and disrupting other students',
                'severity': 'moderate'
            },
            {
                'type': 'tardiness',
                'title': 'Late to Class',
                'description': 'Student arrived 15 minutes late without valid excuse',
                'severity': 'minor'
            },
            {
                'type': 'incomplete_work',
                'title': 'Incomplete Homework',
                'description': 'Student did not complete assigned homework for the third time this week',
                'severity': 'moderate'
            },
            {
                'type': 'disrespect',
                'title': 'Disrespectful Behavior',
                'description': 'Student was disrespectful to teacher when asked to follow instructions',
                'severity': 'serious'
            },
        ]
        
        incident_count = 0
        for _ in range(15):
            if students and classrooms:
                scenario = random.choice(incident_scenarios)
                student = random.choice(students)
                classroom = random.choice(classrooms[:3])
                
                _, created = BehaviorIncident.objects.get_or_create(
                    student=student,
                    classroom=classroom,
                    incident_type=scenario['type'],
                    title=scenario['title'],
                    incident_date=timezone.now() - timedelta(days=random.randint(0, 14)),
                    defaults={
                        'reported_by': classroom.teacher,
                        'description': scenario['description'],
                        'severity': scenario['severity'],
                        'source': 'manual',
                        'resolved': random.choice([True, False])
                    }
                )
                if created:
                    incident_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Created {incident_count} approved incidents"))
        
        # ============================================================================
        # 5. CREATE PENDING BEHAVIOR DETECTIONS (AI-DETECTED)
        # ============================================================================
        self.stdout.write("\n🤖 Creating Pending AI Detections...")
        pending_scenarios = [
            {
                'behavior_type': 'disruption',
                'severity': 'moderate',
                'description': 'Student was observed talking during lecture',
                'statement': 'I noticed the student having a conversation with their neighbor during the explanation',
                'is_positive': False
            },
            {
                'behavior_type': 'incomplete_work',
                'severity': 'minor',
                'description': 'Student did not complete the assigned reading',
                'statement': 'The student mentioned they did not finish the homework assignment',
                'is_positive': False
            },
            {
                'behavior_type': 'other',
                'severity': 'minor',
                'description': 'Student actively participated in class discussion',
                'statement': 'The student asked excellent questions and engaged thoughtfully',
                'is_positive': True
            },
        ]
        
        pending_count = 0
        if lectures:
            for _ in range(10):
                scenario = random.choice(pending_scenarios)
                lecture = random.choice(lectures)
                student = random.choice(students)
                
                _, created = PendingBehaviorDetection.objects.get_or_create(
                    lecture=lecture,
                    student_name=student.get_full_name(),
                    behavior_type=scenario['behavior_type'],
                    defaults={
                        'severity': scenario['severity'],
                        'description': scenario['description'],
                        'original_statement': scenario['statement'],
                        'is_positive': scenario['is_positive'],
                        'ai_confidence': random.choice(['LOW', 'MEDIUM', 'HIGH']),
                        'ai_confidence_score': random.uniform(65.0, 95.0),
                        'status': 'pending'
                    }
                )
                if created:
                    pending_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Created {pending_count} pending detections"))
        
        # ============================================================================
        # SUMMARY
        # ============================================================================
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("✅ COMPREHENSIVE DATA CREATED!"))
        self.stdout.write("="*60)
        self.stdout.write(f"""
📊 Summary:
   • Lectures: {Lecture.objects.count()}
   • Assignments: {Assignment.objects.count()}
   • Attendance Records: {AttendanceRecord.objects.count()}
   • Behavior Incidents (Approved): {BehaviorIncident.objects.count()}
   • Pending AI Detections: {PendingBehaviorDetection.objects.count()}
   • Students Enrolled: {ClassroomEnrollment.objects.filter(is_active=True).count()}

🎯 All pages should now show real data!
   - Dashboard: Shows lectures, attendance, assignments
   - Students: Shows enrolled students with names
   - Attendance: Shows students with proper names
   - Behavior: Shows real incidents with student names
   - Analytics: Shows real statistics
""")
        self.stdout.write("="*60)
        self.stdout.write(self.style.SUCCESS("🎉 Ready to test!"))
