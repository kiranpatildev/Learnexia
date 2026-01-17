"""
Complete Educational Platform Setup Script
Creates all necessary data in the correct order

Run: python setup_complete_platform.py
"""

import os
import sys

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module BEFORE importing django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Import and setup Django
import django
django.setup()

# NOW import models (after Django is set up)
import random
import string
from datetime import date, datetime

from apps.schools.models import School, AcademicYear, Subject, Classroom, ClassroomEnrollment
from apps.accounts.models import User
from django.contrib.auth.hashers import make_password

def generate_class_code():
    """Generate unique class code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def main():
    print("=" * 60)
    print("  COMPLETE EDUCATIONAL PLATFORM SETUP")
    print("=" * 60)
    print()
    
    # STEP 1: Create School
    print("📍 STEP 1: Creating School...")
    school, created = School.objects.get_or_create(
        code='PREM001',
        defaults={
            'name': 'Premium Educational Institute',
            'address': '123 Education Street, Knowledge District',
            'city': 'Knowledge City',
            'state': 'Learning State',
            'country': 'India',
            'pincode': '123456',
            'phone': '+91-1234567890',
            'email': 'info@premiumedu.com',
            'website': 'https://premiumedu.com',
            'principal_name': 'Dr. Rajesh Kumar',
            'established_year': 2020
        }
    )
    print(f"   {'✅ Created' if created else '⏭️  Using existing'}: {school.name}")
    print()
    
    # STEP 2: Create Academic Year
    print("📅 STEP 2: Creating Academic Year...")
    academic_year, created = AcademicYear.objects.get_or_create(
        school=school,
        name='2024-2025',
        defaults={
            'start_date': date(2024, 4, 1),
            'end_date': date(2025, 3, 31),
            'is_current': True
        }
    )
    print(f"   {'✅ Created' if created else '⏭️  Using existing'}: {academic_year.name}")
    print()
    
    # STEP 3: Create Subjects
    print("📚 STEP 3: Creating Subjects...")
    subjects_data = [
        {'name': 'Mathematics', 'code': 'MATH', 'grade': 1, 'color': '#3B82F6'},
        {'name': 'Science', 'code': 'SCI', 'grade': 1, 'color': '#10B981'},
        {'name': 'English', 'code': 'ENG', 'grade': 1, 'color': '#F59E0B'},
        {'name': 'Physics', 'code': 'PHY', 'grade': 2, 'color': '#8B5CF6'},
        {'name': 'Chemistry', 'code': 'CHEM', 'grade': 2, 'color': '#EC4899'},
        {'name': 'Biology', 'code': 'BIO', 'grade': 2, 'color': '#14B8A6'},
    ]
    
    subjects = {}
    for data in subjects_data:
        subject, created = Subject.objects.get_or_create(
            name=data['name'],
            grade=data['grade'],
            defaults={
                'code': data['code'],
                'color': data.get('color', '#3B82F6')
            }
        )
        subjects[data['name']] = subject
        print(f"   {'✅ Created' if created else '⏭️  Exists'}: {subject.name} (Grade {subject.grade})")
    print()
    
    # STEP 4: Create Users
    print("👥 STEP 4: Creating Users...")
    
    # 4a. Create Admin
    print("   Creating Admin...")
    admin, created = User.objects.get_or_create(
        email='admin@premiumedu.com',
        defaults={
            'username': 'admin',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'phone_number': '+91-9876543210',
            'password': make_password('admin123'),
            'is_staff': True,
            'is_superuser': True,
            'is_active': True
        }
    )
    print(f"   {'✅ Created' if created else '⏭️  Exists'}: Admin ({admin.email})")
    
    # 4b. Create Teachers
    print("   Creating Teachers...")
    teachers_data = [
        {'email': 'teacher1@premiumedu.com', 'first_name': 'Priya', 'last_name': 'Sharma'},
        {'email': 'teacher2@premiumedu.com', 'first_name': 'Amit', 'last_name': 'Patel'},
        {'email': 'teacher3@premiumedu.com', 'first_name': 'Sneha', 'last_name': 'Gupta'},
    ]
    
    teachers = []
    for idx, data in enumerate(teachers_data):
        teacher, created = User.objects.get_or_create(
            email=data['email'],
            defaults={
                'username': f"teacher{idx+1}",
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'role': 'teacher',
                'phone_number': f'+91-98765432{idx+10}',
                'password': make_password('teacher123'),
                'is_active': True
            }
        )
        teachers.append(teacher)
        print(f"   {'✅ Created' if created else '⏭️  Exists'}: {teacher.get_full_name()} ({teacher.email})")
    
    # 4c. Create Students
    print("   Creating Students...")
    students_data = [
        {'email': 'student1@premiumedu.com', 'first_name': 'Rahul', 'last_name': 'Kumar'},
        {'email': 'student2@premiumedu.com', 'first_name': 'Ananya', 'last_name': 'Singh'},
        {'email': 'student3@premiumedu.com', 'first_name': 'Arjun', 'last_name': 'Reddy'},
        {'email': 'student4@premiumedu.com', 'first_name': 'Diya', 'last_name': 'Mehta'},
        {'email': 'student5@premiumedu.com', 'first_name': 'Rohan', 'last_name': 'Verma'},
        {'email': 'student6@premiumedu.com', 'first_name': 'Isha', 'last_name': 'Nair'},
        {'email': 'student7@premiumedu.com', 'first_name': 'Karan', 'last_name': 'Joshi'},
        {'email': 'student8@premiumedu.com', 'first_name': 'Meera', 'last_name': 'Iyer'},
        {'email': 'student9@premiumedu.com', 'first_name': 'Aditya', 'last_name': 'Desai'},
        {'email': 'student10@premiumedu.com', 'first_name': 'Kavya', 'last_name': 'Rao'},
    ]
    
    students = []
    for idx, data in enumerate(students_data):
        student, created = User.objects.get_or_create(
            email=data['email'],
            defaults={
                'username': f"student{idx+1}",
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'role': 'student',
                'phone_number': f'+91-98765432{idx+20}',
                'password': make_password('student123'),
                'is_active': True
            }
        )
        students.append(student)
        print(f"   {'✅ Created' if created else '⏭️  Exists'}: {student.get_full_name()} ({student.email})")
    print()
    
    # STEP 5: Create Classrooms
    print("🎓 STEP 5: Creating Classrooms...")
    classrooms_data = [
        {'grade': 1, 'section': 'A', 'subject': 'Mathematics', 'teacher': teachers[0]},
        {'grade': 1, 'section': 'B', 'subject': 'Science', 'teacher': teachers[1]},
        {'grade': 1, 'section': 'C', 'subject': 'English', 'teacher': teachers[2]},
        {'grade': 2, 'section': 'A', 'subject': 'Physics', 'teacher': teachers[0]},
        {'grade': 2, 'section': 'B', 'subject': 'Chemistry', 'teacher': teachers[1]},
        {'grade': 2, 'section': 'C', 'subject': 'Biology', 'teacher': teachers[2]},
    ]
    
    classrooms = []
    for idx, data in enumerate(classrooms_data):
        classroom, created = Classroom.objects.get_or_create(
            school=school,
            academic_year=academic_year,
            subject=subjects[data['subject']],
            grade=data['grade'],
            section=data['section'],
            defaults={
                'teacher': data['teacher'],
                'room_number': f"Room {101 + idx}",
                'max_students': 30,
                'class_code': generate_class_code()
            }
        )
        classrooms.append(classroom)
        print(f"   {'✅ Created' if created else '⏭️  Exists'}: Grade {classroom.grade}-{classroom.section} {classroom.subject.name} (Teacher: {classroom.teacher.get_full_name()})")
    print()
    
    # STEP 6: Enroll Students
    print("📝 STEP 6: Enrolling Students in Classrooms...")
    enrollment_count = 0
    
    # Distribute students across classrooms (5 students per class for first 2 classes)
    for idx, classroom in enumerate(classrooms[:2]):
        start_idx = idx * 5
        end_idx = start_idx + 5
        classroom_students = students[start_idx:end_idx]
        
        for student in classroom_students:
            enrollment, created = ClassroomEnrollment.objects.get_or_create(
                classroom=classroom,
                student=student,
                defaults={
                    'is_active': True
                }
            )
            if created:
                enrollment_count += 1
                print(f"   ✅ Enrolled: {student.get_full_name()} in {classroom.subject.name} Grade {classroom.grade}-{classroom.section}")
    
    print(f"\n   📊 Total enrollments created: {enrollment_count}")
    print()
    
    # Summary
    print("=" * 60)
    print("  SETUP COMPLETE!")
    print("=" * 60)
    print()
    print("📊 Summary:")
    print(f"   🏫 Schools: {School.objects.count()}")
    print(f"   📅 Academic Years: {AcademicYear.objects.count()}")
    print(f"   📚 Subjects: {Subject.objects.count()}")
    print(f"   👥 Users: {User.objects.count()}")
    print(f"      - Admins: {User.objects.filter(role='admin').count()}")
    print(f"      - Teachers: {User.objects.filter(role='teacher').count()}")
    print(f"      - Students: {User.objects.filter(role='student').count()}")
    print(f"   🎓 Classrooms: {Classroom.objects.count()}")
    print(f"   📝 Enrollments: {ClassroomEnrollment.objects.count()}")
    print()
    print("🔐 Login Credentials:")
    print("   Admin:   admin@premiumedu.com / admin123")
    print("   Teacher: teacher1@premiumedu.com / teacher123")
    print("   Student: student1@premiumedu.com / student123")
    print()
    print("🌐 Access:")
    print("   Frontend: http://localhost:3000")
    print("   Admin:    http://localhost:8000/admin")
    print()
    print("✅ You can now create lectures in the teacher dashboard!")
    print("=" * 60)

if __name__ == '__main__':
    main()
