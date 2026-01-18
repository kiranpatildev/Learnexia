"""
Complete data population - matches actual database schema
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, datetime
import random

from apps.accounts.models import User, StudentProfile, TeacherProfile, ParentProfile, ParentStudentRelationship
from apps.schools.models import School, AcademicYear, Subject, Classroom, ClassroomEnrollment
from apps.lectures.models import Lecture
from apps.assignments.models import Assignment, AssignmentSubmission
from apps.attendance.models import AttendanceRecord
from apps.behavior.models import BehaviorIncident
from apps.communication.models import Conversation, Message


class Command(BaseCommand):
    help = 'Populate complete test data'

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 Starting complete data population...\n")
        
        # ============================================================================
        # 1. CREATE SCHOOL
        # ============================================================================
        self.stdout.write("📚 Creating School...")
        school, _ = School.objects.get_or_create(
            code='PEA001',
            defaults={
                'name': "Premium Education Academy",
                'address': '123 Education Street, Knowledge City',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'pincode': '400001',
                'phone': '+91-22-12345678',
                'email': 'info@premiumedu.com',
                'principal_name': 'Dr. Sarah Williams',
                'established_year': 2010
            }
        )
        self.stdout.write(self.style.SUCCESS(f"✅ {school.name}"))
        
        # ============================================================================
        # 2. CREATE ACADEMIC YEAR
        # ============================================================================
        self.stdout.write("\n📅 Creating Academic Year...")
        current_year = timezone.now().year
        academic_year, _ = AcademicYear.objects.get_or_create(
            school=school,
            name=f"{current_year}-{current_year+1}",
            defaults={
                'start_date': datetime(current_year, 6, 1).date(),
                'end_date': datetime(current_year + 1, 5, 31).date(),
                'is_current': True
            }
        )
        self.stdout.write(self.style.SUCCESS(f"✅ {academic_year.name}"))
        
        # ============================================================================
        # 3. CREATE SUBJECTS
        # ============================================================================
        self.stdout.write("\n📖 Creating Subjects...")
        subjects_data = [
            {'name': 'Mathematics', 'code': 'MATH', 'grade': 4},
            {'name': 'Science', 'code': 'SCI', 'grade': 4},
            {'name': 'English', 'code': 'ENG', 'grade': 4},
        ]
        
        subjects = []
        for subj_data in subjects_data:
            subject, _ = Subject.objects.get_or_create(
                name=subj_data['name'],
                grade=subj_data['grade'],
                defaults={'code': subj_data['code']}
            )
            subjects.append(subject)
            self.stdout.write(f"  ✓ {subject.name}")
        
        # ============================================================================
        # 4. GET EXISTING TEACHERS (already created)
        # ============================================================================
        self.stdout.write("\n👨‍🏫 Getting Teachers...")
        teachers = list(User.objects.filter(role='teacher', is_active=True)[:3])
        for teacher in teachers:
            self.stdout.write(f"  ✓ {teacher.get_full_name()}")
        
        # ============================================================================
        # 5. CREATE CLASSROOMS
        # ============================================================================
        self.stdout.write("\n🏫 Creating Classrooms...")
        classrooms = []
        for i, subject in enumerate(subjects):
            if i < len(teachers):
                classroom, _ = Classroom.objects.get_or_create(
                    school=school,
                    academic_year=academic_year,
                    subject=subject,
                    grade=4,
                    section='A',
                    defaults={
                        'teacher': teachers[i],
                        'room_number': f'R{101 + i}',
                        'max_students': 30,
                        'class_code': f'CLASS{i+1}2026'
                    }
                )
                classrooms.append(classroom)
                self.stdout.write(f"  ✓ {classroom}")
        
        # ============================================================================
        # 6. GET EXISTING STUDENTS
        # ============================================================================
        self.stdout.write("\n👨‍🎓 Getting Students...")
        students = list(User.objects.filter(role='student', is_active=True)[:8])
        for student in students:
            self.stdout.write(f"  ✓ {student.get_full_name()}")
        
        # ============================================================================
        # 7. ENROLL STUDENTS IN CLASSROOMS
        # ============================================================================
        self.stdout.write("\n📝 Enrolling Students...")
        enrollment_count = 0
        for student in students:
            for classroom in classrooms:
                _, created = ClassroomEnrollment.objects.get_or_create(
                    classroom=classroom,
                    student=student
                )
                if created:
                    enrollment_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Created {enrollment_count} enrollments"))
        
        # ============================================================================
        # 8. CREATE LECTURES
        # ============================================================================
        self.stdout.write("\n🎥 Creating Lectures...")
        lecture_count = 0
        for classroom in classrooms:
            for i in range(3):
                _, created = Lecture.objects.get_or_create(
                    classroom=classroom,
                    teacher=classroom.teacher,
                    title=f"{classroom.subject.name} - Lecture {i+1}",
                    defaults={
                        'description': f"Introduction to {classroom.subject.name}",
                        'chapter': f"Chapter {i+1}",
                        'topic': f"Topic {i+1}",
                        'recording_type': 'audio',
                        'duration': random.randint(1800, 3600),
                        'status': 'completed',
                        'is_shared_with_students': True
                    }
                )
                if created:
                    lecture_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Created {lecture_count} lectures"))
        
        # ============================================================================
        # 9. CREATE ASSIGNMENTS
        # ============================================================================
        self.stdout.write("\n📋 Creating Assignments...")
        assignment_count = 0
        for classroom in classrooms:
            for i in range(2):
                assignment, created = Assignment.objects.get_or_create(
                    classroom=classroom,
                    teacher=classroom.teacher,
                    title=f"{classroom.subject.name} Assignment {i+1}",
                    defaults={
                        'description': f"Complete exercises on {classroom.subject.name}",
                        'instructions': f"Read chapter {i+1} and answer questions 1-10",
                        'total_points': 100,
                        'due_date': timezone.now() + timedelta(days=7+i*7)
                    }
                )
                if created:
                    assignment_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Created {assignment_count} assignments"))
        
        # ============================================================================
        # 10. CREATE ATTENDANCE RECORDS
        # ============================================================================
        self.stdout.write("\n✅ Creating Attendance...")
        from apps.attendance.models import AttendanceSession
        attendance_count = 0
        for classroom in classrooms:
            enrolled = ClassroomEnrollment.objects.filter(classroom=classroom)
            for days_ago in range(10):
                date = (timezone.now() - timedelta(days=days_ago)).date()
                
                # First create the session
                session, _ = AttendanceSession.objects.get_or_create(
                    classroom=classroom,
                    date=date,
                    defaults={
                        'teacher': classroom.teacher,
                        'session_type': 'full_day'
                    }
                )
                
                # Then create records for each student
                for enrollment in enrolled:
                    _, created = AttendanceRecord.objects.get_or_create(
                        session=session,
                        student=enrollment.student,
                        defaults={
                            'status': random.choice(['present', 'present', 'present', 'absent', 'late'])
                        }
                    )
                    if created:
                        attendance_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Created {attendance_count} attendance records"))
        
        # ============================================================================
        # 11. CREATE BEHAVIOR INCIDENTS
        # ============================================================================
        self.stdout.write("\n⚠️ Creating Behavior Incidents...")
        incident_count = 0
        incident_types = ['disruption', 'tardiness', 'incomplete_work', 'other']
        for _ in range(10):
            if students and classrooms:
                incident_type = random.choice(incident_types)
                _, created = BehaviorIncident.objects.get_or_create(
                    student=random.choice(students),
                    classroom=random.choice(classrooms),
                    incident_type=incident_type,
                    title=f"{incident_type.replace('_', ' ').title()} Incident",
                    defaults={
                        'reported_by': random.choice(teachers),
                        'description': f"Student exhibited {incident_type.replace('_', ' ')} during class",
                        'severity': random.choice(['minor', 'moderate', 'serious']),
                        'source': 'manual',
                        'incident_date': timezone.now() - timedelta(days=random.randint(0, 7))
                    }
                )
                if created:
                    incident_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Created {incident_count} incidents"))
        
        # ============================================================================
        # 12. CREATE CONVERSATIONS
        # ============================================================================
        self.stdout.write("\n💬 Creating Conversations...")
        conversation_count = 0
        for i in range(5):
            if teachers and students:
                conversation, created = Conversation.objects.get_or_create(
                    conversation_type='direct',
                    created_by=random.choice(teachers),
                    defaults={}
                )
                if created:
                    teacher = random.choice(teachers)
                    student = random.choice(students)
                    conversation.participants.add(teacher, student)
                    
                    # Add messages
                    for j in range(3):
                        Message.objects.create(
                            conversation=conversation,
                            sender=random.choice([teacher, student]),
                            message_text=f"Message {j+1} about coursework"
                        )
                    
                    conversation.last_message_at = timezone.now()
                    conversation.save()
                    conversation_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Created {conversation_count} conversations"))
        
        # ============================================================================
        # SUMMARY
        # ============================================================================
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("✅ DATA POPULATION COMPLETE!"))
        self.stdout.write("="*60)
        self.stdout.write(f"""
📊 Summary:
   • Schools: {School.objects.count()}
   • Academic Years: {AcademicYear.objects.count()}
   • Subjects: {Subject.objects.count()}
   • Teachers: {User.objects.filter(role='teacher').count()}
   • Students: {User.objects.filter(role='student').count()}
   • Classrooms: {Classroom.objects.count()}
   • Enrollments: {ClassroomEnrollment.objects.count()}
   • Lectures: {Lecture.objects.count()}
   • Assignments: {Assignment.objects.count()}
   • Attendance Records: {AttendanceRecord.objects.count()}
   • Behavior Incidents: {BehaviorIncident.objects.count()}
   • Conversations: {Conversation.objects.count()}

🔑 Login Credentials:
   Teachers: teacher1@premiumedu.com / teacher123
   Students: student1@premiumedu.com / student123
""")
        self.stdout.write("="*60)
        self.stdout.write(self.style.SUCCESS("🎉 Ready to test the application!"))
