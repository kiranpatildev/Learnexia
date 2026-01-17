"""
Quick script to create sample classrooms for testing
Run: python create_classrooms.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.schools.models import Classroom, School
from apps.accounts.models import User

def main():
    print("🚀 Creating classrooms...")
    print("-" * 50)
    
    # Get teacher
    teacher = User.objects.filter(role='teacher').first()
    
    if not teacher:
        print("❌ No teacher found. Please create a teacher account first.")
        print("\nTo create a teacher:")
        print("1. Run: python manage.py createsuperuser")
        print("2. Or use Django admin to create a teacher user")
        return
    
    print(f"👨‍🏫 Teacher: {teacher.get_full_name()} ({teacher.email})")
    
    # Get or create school
    school, created = School.objects.get_or_create(
        name='Premium Educational Institute',
        defaults={
            'address': '123 Education Street',
            'city': 'Knowledge City',
            'state': 'Learning State',
            'country': 'Education Country',
            'phone': '1234567890',
            'email': 'info@premiumedu.com',
            'website': 'https://premiumedu.com'
        }
    )
    
    if created:
        print(f"🏫 Created school: {school.name}")
    else:
        print(f"🏫 Using existing school: {school.name}")
    
    print("-" * 50)
    
    # Create classrooms
    classrooms_data = [
        {'grade': 'Grade 10', 'section': 'A', 'subject': 'Mathematics'},
        {'grade': 'Grade 10', 'section': 'B', 'subject': 'Science'},
        {'grade': 'Grade 10', 'section': 'C', 'subject': 'English'},
        {'grade': 'Grade 11', 'section': 'A', 'subject': 'Physics'},
        {'grade': 'Grade 11', 'section': 'B', 'subject': 'Chemistry'},
        {'grade': 'Grade 11', 'section': 'C', 'subject': 'Biology'},
        {'grade': 'Grade 12', 'section': 'A', 'subject': 'Computer Science'},
        {'grade': 'Grade 12', 'section': 'B', 'subject': 'History'},
    ]
    
    created_count = 0
    for idx, data in enumerate(classrooms_data):
        classroom, created = Classroom.objects.get_or_create(
            school=school,
            teacher=teacher,
            grade=data['grade'],
            section=data['section'],
            subject=data['subject'],
            defaults={
                'academic_year': '2024-2025',
                'room_number': f"Room {101 + idx}",
                'max_students': 30,
                'is_active': True
            }
        )
        
        if created:
            created_count += 1
            print(f"✅ Created: {classroom.grade} - Section {classroom.section} ({classroom.subject})")
        else:
            print(f"⏭️  Already exists: {classroom.grade} - Section {classroom.section} ({classroom.subject})")
    
    print("-" * 50)
    print(f"\n🎉 Done!")
    print(f"📊 Created {created_count} new classrooms")
    print(f"📚 Total classrooms for {teacher.get_full_name()}: {Classroom.objects.filter(teacher=teacher).count()}")
    print("\n✅ You can now create lectures and select from these classrooms!")
    print("🌐 Go to: http://localhost:3000/teacher/lectures")

if __name__ == '__main__':
    main()
