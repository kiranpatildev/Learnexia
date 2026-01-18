"""
Management command to populate test data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, datetime
import random

from apps.accounts.models import User, StudentProfile, TeacherProfile
from apps.schools.models import School, AcademicYear, Subject, Classroom, ClassroomEnrollment
from apps.lectures.models import Lecture
from apps.attendance.models import AttendanceRecord


class Command(BaseCommand):
    help = 'Populate database with test data'

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 Starting data population...\n")
        
        # Create School
        self.stdout.write("📚 Creating School...")
        school, _ = School.objects.get_or_create(
            code='PEA001',
            defaults={
                'name': "Premium Education Academy",
                'address': '123 Education Street',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'pincode': '400001',
                'phone': '+91-555-0123',
                'email': 'info@premiumedu.com',
                'principal_name': 'Dr. Sarah Williams',
                'established_year': 2010
            }
        )
        self.stdout.write(self.style.SUCCESS(f"✅ {school.name}"))
        
        # Create Academic Year
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
        
        # Create Subjects
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
        
        # Create Teachers
        self.stdout.write("\n👨‍🏫 Creating Teachers...")
        teachers_data = [
            {'email': 'teacher1@premiumedu.com', 'first_name': 'Priya', 'last_name': 'Sharma'},
            {'email': 'teacher2@premiumedu.com', 'first_name': 'John', 'last_name': 'Davis'},
            {'email': 'teacher3@premiumedu.com', 'first_name': 'Emily', 'last_name': 'Chen'},
        ]
        
        teachers = []
        for i, teacher_data in enumerate(teachers_data):
            user, created = User.objects.get_or_create(
                email=teacher_data['email'],
                defaults={
                    'first_name': teacher_data['first_name'],
                    'last_name': teacher_data['last_name'],
                    'role': 'teacher',
                    'is_active': True
                }
            )
            if created:
                user.set_password('teacher123')
                user.save()
            
            TeacherProfile.objects.get_or_create(
                user=user,
                defaults={
                    'school': school,
                    'employee_id': f'T{1000 + i}',
                    'department': subjects[i].name
                }
            )
            teachers.append(user)
            self.stdout.write(f"  ✓ {user.get_full_name()}")
        
        # Create Classrooms
        self.stdout.write("\n🏫 Creating Classrooms...")
        classrooms = []
        for i, subject in enumerate(subjects):
            classroom, _ = Classroom.objects.get_or_create(
                school=school,
                academic_year=academic_year,
                subject=subject,
                grade=4,
                section='A',
                defaults={
                    'teacher': teachers[i],
                    'room_number': f'R{100 + i}',
                    'max_students': 30,
                    'class_code': f'CLS{i+1}2026'
                }
            )
            classrooms.append(classroom)
            self.stdout.write(f"  ✓ {classroom}")
        
        # Create Students
        self.stdout.write("\n👨‍🎓 Creating Students...")
        students_data = [
            {'email': 'student1@premiumedu.com', 'first_name': 'Alex', 'last_name': 'Thompson'},
            {'email': 'student2@premiumedu.com', 'first_name': 'Emma', 'last_name': 'Wilson'},
            {'email': 'student3@premiumedu.com', 'first_name': 'James', 'last_name': 'Chen'},
            {'email': 'student4@premiumedu.com', 'first_name': 'Sophia', 'last_name': 'Martinez'},
            {'email': 'student5@premiumedu.com', 'first_name': 'Liam', 'last_name': 'Johnson'},
        ]
        
        students = []
        for i, student_data in enumerate(students_data):
            user, created = User.objects.get_or_create(
                email=student_data['email'],
                defaults={
                    'first_name': student_data['first_name'],
                    'last_name': student_data['last_name'],
                    'role': 'student',
                    'is_active': True
                }
            )
            if created:
                user.set_password('student123')
                user.save()
            
            StudentProfile.objects.get_or_create(
                user=user,
                defaults={
                    'school': school,
                    'student_id': f'S{2000 + i}',
                    'grade_level': '4',
                    'current_xp': random.randint(100, 1000),
                    'current_level': random.randint(1, 10)
                }
            )
            students.append(user)
            self.stdout.write(f"  ✓ {user.get_full_name()}")
        
        # Enroll Students
        self.stdout.write("\n📝 Enrolling Students...")
        for student in students:
            for classroom in classrooms:
                ClassroomEnrollment.objects.get_or_create(
                    classroom=classroom,
                    student=student
                )
        self.stdout.write(self.style.SUCCESS(f"✅ Enrolled {len(students)} students"))
        
        # Create Lectures
        self.stdout.write("\n🎥 Creating Lectures...")
        for classroom in classrooms:
            for i in range(3):
                Lecture.objects.get_or_create(
                    classroom=classroom,
                    teacher=classroom.teacher,
                    title=f"{classroom.subject.name} Lecture {i+1}",
                    defaults={
                        'description': f"Lecture on {classroom.subject.name}",
                        'video_url': f"https://example.com/lecture_{i}.mp4",
                        'duration': 3600,
                        'status': 'published'
                    }
                )
        self.stdout.write(self.style.SUCCESS("✅ Created lectures"))
        
        # Create Attendance
        self.stdout.write("\n✅ Creating Attendance...")
        for classroom in classrooms:
            enrolled = ClassroomEnrollment.objects.filter(classroom=classroom)
            for days_ago in range(10):
                date = (timezone.now() - timedelta(days=days_ago)).date()
                for enrollment in enrolled:
                    AttendanceRecord.objects.get_or_create(
                        classroom=classroom,
                        student=enrollment.student,
                        date=date,
                        defaults={
                            'status': random.choice(['present', 'absent', 'late']),
                            'marked_by': classroom.teacher
                        }
                    )
        self.stdout.write(self.style.SUCCESS("✅ Created attendance records"))
        
        # Summary
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("✅ DATA POPULATION COMPLETE!"))
        self.stdout.write("="*60)
        self.stdout.write(f"""
📊 Summary:
   • Schools: {School.objects.count()}
   • Teachers: {User.objects.filter(role='teacher').count()}
   • Students: {User.objects.filter(role='student').count()}
   • Classrooms: {Classroom.objects.count()}
   • Enrollments: {ClassroomEnrollment.objects.count()}
   • Lectures: {Lecture.objects.count()}
   • Attendance: {AttendanceRecord.objects.count()}

🔑 Login Credentials:
   Teachers: teacher1@premiumedu.com / teacher123
   Students: student1@premiumedu.com / student123
""")
        self.stdout.write("="*60)
        self.stdout.write(self.style.SUCCESS("🎉 Ready to test!"))
