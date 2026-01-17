# COPY AND PASTE THIS INTO DJANGO SHELL
# Run: python manage.py shell
# Then paste this entire code

from apps.schools.models import Classroom, School, AcademicYear, Subject
from apps.accounts.models import User
from datetime import date
import random
import string

print("🚀 Creating school structure...")
print("-" * 50)

# Get teacher
teacher = User.objects.filter(role='teacher').first()
if not teacher:
    print("❌ No teacher found!")
    print("Create a teacher first using Django admin or createsuperuser")
else:
    print(f"👨‍🏫 Teacher: {teacher.get_full_name()} ({teacher.email})")
    
    # Create school
    school, created = School.objects.get_or_create(
        code='PREM001',
        defaults={
            'name': 'Premium Educational Institute',
            'address': '123 Education Street',
            'city': 'Knowledge City',
            'state': 'Learning State',
            'country': 'India',
            'pincode': '123456',
            'phone': '1234567890',
            'email': 'info@premiumedu.com',
            'website': 'https://premiumedu.com',
            'principal_name': 'Dr. John Smith',
            'established_year': 2020
        }
    )
    if created:
        print(f"🏫 Created school: {school.name}")
    else:
        print(f"🏫 Using existing school: {school.name}")
    
    # Create academic year
    academic_year, created = AcademicYear.objects.get_or_create(
        school=school,
        name='2024-2025',
        defaults={
            'start_date': date(2024, 4, 1),
            'end_date': date(2025, 3, 31),
            'is_current': True
        }
    )
    if created:
        print(f"📅 Created academic year: {academic_year.name}")
    else:
        print(f"📅 Using existing academic year: {academic_year.name}")
    
    print("-" * 50)
    
    # Create subjects
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
                'color': data['color']
            }
        )
        subjects[data['name']] = subject
        if created:
            print(f"📚 Created subject: {subject.name}")
    
    print("-" * 50)
    
    # Create classrooms
    classrooms_data = [
        {'grade': 1, 'section': 'A', 'subject': 'Mathematics'},
        {'grade': 1, 'section': 'B', 'subject': 'Science'},
        {'grade': 1, 'section': 'C', 'subject': 'English'},
        {'grade': 2, 'section': 'A', 'subject': 'Physics'},
        {'grade': 2, 'section': 'B', 'subject': 'Chemistry'},
        {'grade': 2, 'section': 'C', 'subject': 'Biology'},
    ]
    
    created_count = 0
    for idx, data in enumerate(classrooms_data):
        # Generate unique class code
        class_code = f"{data['subject'][:3].upper()}{data['grade']}{data['section']}-{''.join(random.choices(string.digits, k=4))}"
        
        classroom, created = Classroom.objects.get_or_create(
            school=school,
            academic_year=academic_year,
            subject=subjects[data['subject']],
            grade=data['grade'],
            section=data['section'],
            defaults={
                'teacher': teacher,
                'room_number': f"Room {101 + idx}",
                'max_students': 30,
                'class_code': class_code
            }
        )
        
        if created:
            created_count += 1
            print(f"✅ Created: Grade {classroom.grade} - Section {classroom.section} ({classroom.subject.name})")
        else:
            print(f"⏭️  Exists: Grade {classroom.grade} - Section {classroom.section} ({classroom.subject.name})")
    
    print("-" * 50)
    print(f"\n🎉 Done!")
    print(f"📊 Created {created_count} new classrooms")
    print(f"📚 Total classrooms: {Classroom.objects.filter(teacher=teacher).count()}")
    print("\n✅ You can now create lectures!")
    print("🌐 Go to: http://localhost:3000/teacher/lectures")
