"""
Complete Test Data Population Script
Run this in Django shell: python manage.py shell < populate_test_data.py
Or copy-paste into: python manage.py shell
"""

from django.utils import timezone
from datetime import timedelta, datetime
import random

# Import all models
from apps.accounts.models import User, StudentProfile, TeacherProfile, ParentProfile, ParentStudentRelationship
from apps.schools.models import School, AcademicYear, Subject, Classroom, ClassroomEnrollment
from apps.lectures.models import Lecture, LectureBookmark, LectureView
from apps.notes.models import Note, NoteTag
from apps.assignments.models import Assignment, AssignmentSubmission
from apps.assessments.models import Quiz, Question, QuizAttempt, QuizAnswer
from apps.attendance.models import AttendanceRecord
from apps.behavior.models import BehaviorIncident
from apps.communication.models import Conversation, Message, Announcement
from apps.gamification.models import Badge, Achievement, Leaderboard, LeaderboardEntry
from apps.performance.models import PerformanceMetric

print("🚀 Starting comprehensive data population...")
print("=" * 60)

# ============================================================================
# 1. CREATE SCHOOL
# ============================================================================
print("\n📚 Creating School...")
school, created = School.objects.get_or_create(
    name="Premium Education Academy",
    defaults={
        'code': 'PEA001',
        'address': '123 Education Street, Knowledge City',
        'phone': '+1-555-0123',
        'email': 'info@premiumedu.com',
        'website': 'https://premiumedu.com',
        'principal_name': 'Dr. Sarah Williams',
        'established_year': 2010,
        'is_active': True
    }
)
print(f"✅ School: {school.name}")

# ============================================================================
# 2. CREATE ACADEMIC YEAR
# ============================================================================
print("\n📅 Creating Academic Year...")
current_year = timezone.now().year
academic_year, created = AcademicYear.objects.get_or_create(
    school=school,
    year=current_year,
    defaults={
        'start_date': datetime(current_year, 9, 1).date(),
        'end_date': datetime(current_year + 1, 6, 30).date(),
        'is_current': True
    }
)
print(f"✅ Academic Year: {academic_year.year}")

# ============================================================================
# 3. CREATE SUBJECTS
# ============================================================================
print("\n📖 Creating Subjects...")
subjects_data = [
    {'name': 'Mathematics', 'code': 'MATH101', 'description': 'Advanced Mathematics'},
    {'name': 'Physics', 'code': 'PHY101', 'description': 'General Physics'},
    {'name': 'Chemistry', 'code': 'CHEM101', 'description': 'Organic Chemistry'},
    {'name': 'Biology', 'code': 'BIO101', 'description': 'Life Sciences'},
    {'name': 'English', 'code': 'ENG101', 'description': 'English Literature'},
    {'name': 'History', 'code': 'HIST101', 'description': 'World History'},
    {'name': 'Computer Science', 'code': 'CS101', 'description': 'Programming Basics'},
]

subjects = []
for subj_data in subjects_data:
    subject, created = Subject.objects.get_or_create(
        school=school,
        code=subj_data['code'],
        defaults=subj_data
    )
    subjects.append(subject)
    print(f"  ✓ {subject.name}")

# ============================================================================
# 4. CREATE TEACHERS
# ============================================================================
print("\n👨‍🏫 Creating Teachers...")
teachers_data = [
    {'email': 'teacher1@premiumedu.com', 'first_name': 'Priya', 'last_name': 'Sharma', 'subject': subjects[0]},
    {'email': 'teacher2@premiumedu.com', 'first_name': 'John', 'last_name': 'Davis', 'subject': subjects[1]},
    {'email': 'teacher3@premiumedu.com', 'first_name': 'Emily', 'last_name': 'Chen', 'subject': subjects[2]},
    {'email': 'teacher4@premiumedu.com', 'first_name': 'Michael', 'last_name': 'Brown', 'subject': subjects[3]},
    {'email': 'teacher5@premiumedu.com', 'first_name': 'Sarah', 'last_name': 'Wilson', 'subject': subjects[4]},
]

teachers = []
for teacher_data in teachers_data:
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
    
    profile, _ = TeacherProfile.objects.get_or_create(
        user=user,
        defaults={
            'school': school,
            'employee_id': f'T{1000 + len(teachers)}',
            'department': teacher_data['subject'].name,
            'qualification': 'M.Ed.',
            'specialization': teacher_data['subject'].name,
            'years_of_experience': random.randint(3, 15)
        }
    )
    teachers.append(user)
    print(f"  ✓ {user.get_full_name()} - {teacher_data['subject'].name}")

# ============================================================================
# 5. CREATE CLASSROOMS
# ============================================================================
print("\n🏫 Creating Classrooms...")
classrooms_data = [
    {'name': 'Mathematics 101', 'section': 'A', 'teacher': teachers[0], 'subject': subjects[0]},
    {'name': 'Physics 101', 'section': 'A', 'teacher': teachers[1], 'subject': subjects[1]},
    {'name': 'Chemistry 101', 'section': 'B', 'teacher': teachers[2], 'subject': subjects[2]},
    {'name': 'Biology 101', 'section': 'A', 'teacher': teachers[3], 'subject': subjects[3]},
    {'name': 'English 101', 'section': 'A', 'teacher': teachers[4], 'subject': subjects[4]},
]

classrooms = []
for class_data in classrooms_data:
    classroom, created = Classroom.objects.get_or_create(
        school=school,
        name=class_data['name'],
        section=class_data['section'],
        defaults={
            'academic_year': academic_year,
            'teacher': class_data['teacher'],
            'subject': class_data['subject'],
            'room_number': f'R{100 + len(classrooms)}',
            'capacity': 30,
            'schedule': 'Mon, Wed, Fri 10:00-11:30'
        }
    )
    classrooms.append(classroom)
    print(f"  ✓ {classroom.name} - {classroom.teacher.get_full_name()}")

# ============================================================================
# 6. CREATE STUDENTS
# ============================================================================
print("\n👨‍🎓 Creating Students...")
students_data = [
    {'email': 'student1@premiumedu.com', 'first_name': 'Alex', 'last_name': 'Thompson'},
    {'email': 'student2@premiumedu.com', 'first_name': 'Emma', 'last_name': 'Wilson'},
    {'email': 'student3@premiumedu.com', 'first_name': 'James', 'last_name': 'Chen'},
    {'email': 'student4@premiumedu.com', 'first_name': 'Sophia', 'last_name': 'Martinez'},
    {'email': 'student5@premiumedu.com', 'first_name': 'Liam', 'last_name': 'Johnson'},
    {'email': 'student6@premiumedu.com', 'first_name': 'Olivia', 'last_name': 'Brown'},
    {'email': 'student7@premiumedu.com', 'first_name': 'Noah', 'last_name': 'Davis'},
    {'email': 'student8@premiumedu.com', 'first_name': 'Ava', 'last_name': 'Garcia'},
    {'email': 'student9@premiumedu.com', 'first_name': 'Ethan', 'last_name': 'Miller'},
    {'email': 'student10@premiumedu.com', 'first_name': 'Mia', 'last_name': 'Rodriguez'},
]

students = []
for student_data in students_data:
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
    
    profile, _ = StudentProfile.objects.get_or_create(
        user=user,
        defaults={
            'school': school,
            'student_id': f'S{2000 + len(students)}',
            'grade_level': random.choice(['9', '10', '11', '12']),
            'date_of_birth': datetime(2008, random.randint(1, 12), random.randint(1, 28)).date(),
            'current_xp': random.randint(100, 1000),
            'current_level': random.randint(1, 10),
            'total_points': random.randint(500, 5000),
            'streak_days': random.randint(0, 30)
        }
    )
    students.append(user)
    print(f"  ✓ {user.get_full_name()}")

# ============================================================================
# 7. ENROLL STUDENTS IN CLASSROOMS
# ============================================================================
print("\n📝 Enrolling Students in Classrooms...")
for student in students:
    # Enroll each student in 3-5 random classrooms
    num_classes = random.randint(3, 5)
    selected_classrooms = random.sample(classrooms, num_classes)
    
    for classroom in selected_classrooms:
        enrollment, created = ClassroomEnrollment.objects.get_or_create(
            classroom=classroom,
            student=student,
            defaults={
                'enrolled_at': timezone.now() - timedelta(days=random.randint(30, 90)),
                'is_active': True
            }
        )
        if created:
            print(f"  ✓ {student.get_full_name()} → {classroom.name}")

# ============================================================================
# 8. CREATE PARENTS
# ============================================================================
print("\n👨‍👩‍👧 Creating Parents...")
parents_data = [
    {'email': 'parent1@premiumedu.com', 'first_name': 'Michael', 'last_name': 'Thompson'},
    {'email': 'parent2@premiumedu.com', 'first_name': 'Jennifer', 'last_name': 'Wilson'},
    {'email': 'parent3@premiumedu.com', 'first_name': 'David', 'last_name': 'Chen'},
    {'email': 'parent4@premiumedu.com', 'first_name': 'Maria', 'last_name': 'Martinez'},
    {'email': 'parent5@premiumedu.com', 'first_name': 'Robert', 'last_name': 'Johnson'},
]

parents = []
for parent_data in parents_data:
    user, created = User.objects.get_or_create(
        email=parent_data['email'],
        defaults={
            'first_name': parent_data['first_name'],
            'last_name': parent_data['last_name'],
            'role': 'parent',
            'is_active': True
        }
    )
    if created:
        user.set_password('parent123')
        user.save()
    
    profile, _ = ParentProfile.objects.get_or_create(
        user=user,
        defaults={
            'phone': f'+1-555-{random.randint(1000, 9999)}',
            'occupation': random.choice(['Engineer', 'Doctor', 'Teacher', 'Business Owner']),
            'emergency_contact': True
        }
    )
    parents.append(user)
    print(f"  ✓ {user.get_full_name()}")

# Link parents to students
for i, parent in enumerate(parents[:5]):
    # Each parent has 1-2 children
    num_children = random.randint(1, 2)
    children = students[i*2:i*2+num_children]
    
    for child in children:
        relationship, created = ParentStudentRelationship.objects.get_or_create(
            parent=parent,
            student=child,
            defaults={
                'relationship_type': random.choice(['father', 'mother']),
                'is_primary_contact': True,
                'can_pickup': True
            }
        )
        if created:
            print(f"  ✓ {parent.get_full_name()} → {child.get_full_name()}")

# ============================================================================
# 9. CREATE LECTURES
# ============================================================================
print("\n🎥 Creating Lectures...")
lecture_topics = [
    'Introduction to Algebra', 'Quadratic Equations', 'Calculus Basics',
    'Newton\'s Laws', 'Thermodynamics', 'Electromagnetic Waves',
    'Organic Chemistry', 'Chemical Bonding', 'Periodic Table',
    'Cell Biology', 'Genetics', 'Evolution',
    'Shakespeare\'s Works', 'Poetry Analysis', 'Essay Writing'
]

lectures = []
for i, classroom in enumerate(classrooms):
    for j in range(5):  # 5 lectures per classroom
        lecture = Lecture.objects.create(
            classroom=classroom,
            teacher=classroom.teacher,
            title=f"{lecture_topics[i*3 + j % 3]} - Lecture {j+1}",
            description=f"Comprehensive lecture on {lecture_topics[i*3 + j % 3]}",
            video_url=f"https://example.com/lecture_{i}_{j}.mp4",
            duration=random.randint(1800, 3600),  # 30-60 minutes
            thumbnail_url=f"https://example.com/thumb_{i}_{j}.jpg",
            status='published',
            scheduled_at=timezone.now() - timedelta(days=random.randint(1, 30)),
            view_count=random.randint(10, 100)
        )
        lectures.append(lecture)
        
        # Add lecture views
        for student in random.sample(students, random.randint(3, 7)):
            LectureView.objects.create(
                lecture=lecture,
                student=student,
                watch_duration=random.randint(900, lecture.duration),
                completed=random.choice([True, False]),
                last_position=random.randint(0, lecture.duration)
            )
        
print(f"✅ Created {len(lectures)} lectures")

# ============================================================================
# 10. CREATE NOTES
# ============================================================================
print("\n📝 Creating Notes...")
for lecture in random.sample(lectures, 15):
    note = Note.objects.create(
        lecture=lecture,
        student=random.choice(students),
        title=f"Notes: {lecture.title}",
        content=f"Detailed notes from {lecture.title}. Key points covered include important concepts and examples.",
        is_ai_generated=random.choice([True, False]),
        ai_confidence_score=random.uniform(0.7, 0.99) if random.choice([True, False]) else None
    )
    
    # Add tags
    tags = ['important', 'review', 'exam', 'homework', 'concept']
    for tag_name in random.sample(tags, random.randint(1, 3)):
        tag, _ = NoteTag.objects.get_or_create(name=tag_name)
        note.tags.add(tag)

print(f"✅ Created notes for 15 lectures")

# ============================================================================
# 11. CREATE ASSIGNMENTS
# ============================================================================
print("\n📋 Creating Assignments...")
for classroom in classrooms:
    for i in range(3):  # 3 assignments per classroom
        assignment = Assignment.objects.create(
            classroom=classroom,
            teacher=classroom.teacher,
            title=f"{classroom.subject.name} Assignment {i+1}",
            description=f"Complete exercises on {classroom.subject.name} topics",
            total_points=100,
            due_date=timezone.now() + timedelta(days=random.randint(7, 30)),
            assignment_type=random.choice(['homework', 'project', 'essay']),
            status='published'
        )
        
        # Create submissions
        enrolled_students = ClassroomEnrollment.objects.filter(
            classroom=classroom, is_active=True
        ).values_list('student', flat=True)
        
        for student_id in enrolled_students:
            if random.random() > 0.3:  # 70% submission rate
                AssignmentSubmission.objects.create(
                    assignment=assignment,
                    student_id=student_id,
                    submission_text=f"My submission for {assignment.title}",
                    status=random.choice(['submitted', 'graded']),
                    score=random.randint(60, 100) if random.choice([True, False]) else None,
                    submitted_at=timezone.now() - timedelta(days=random.randint(0, 7))
                )

print(f"✅ Created assignments with submissions")

# ============================================================================
# 12. CREATE QUIZZES
# ============================================================================
print("\n📝 Creating Quizzes...")
for classroom in classrooms:
    quiz = Quiz.objects.create(
        classroom=classroom,
        teacher=classroom.teacher,
        title=f"{classroom.subject.name} Quiz",
        description=f"Test your knowledge of {classroom.subject.name}",
        total_points=50,
        duration_minutes=30,
        passing_score=70,
        quiz_type='practice',
        status='published'
    )
    
    # Add questions
    for i in range(10):
        Question.objects.create(
            quiz=quiz,
            question_text=f"Question {i+1}: What is the concept of...?",
            question_type='multiple_choice',
            points=5,
            correct_answer='B',
            options={'A': 'Option A', 'B': 'Option B', 'C': 'Option C', 'D': 'Option D'},
            order=i+1
        )

print(f"✅ Created quizzes with questions")

# ============================================================================
# 13. CREATE ATTENDANCE RECORDS
# ============================================================================
print("\n✅ Creating Attendance Records...")
for classroom in classrooms:
    enrolled_students = ClassroomEnrollment.objects.filter(
        classroom=classroom, is_active=True
    ).values_list('student', flat=True)
    
    # Create attendance for last 30 days
    for days_ago in range(30):
        date = (timezone.now() - timedelta(days=days_ago)).date()
        
        for student_id in enrolled_students:
            AttendanceRecord.objects.create(
                classroom=classroom,
                student_id=student_id,
                date=date,
                status=random.choices(
                    ['present', 'absent', 'late', 'excused'],
                    weights=[70, 10, 15, 5]
                )[0],
                marked_by=classroom.teacher
            )

print(f"✅ Created 30 days of attendance records")

# ============================================================================
# 14. CREATE BEHAVIOR INCIDENTS
# ============================================================================
print("\n⚠️ Creating Behavior Incidents...")
incident_types = ['Disturbance', 'Late Arrival', 'Inattention', 'Incomplete Work', 'Positive Behavior']
severities = ['low', 'medium', 'high']

for _ in range(20):
    BehaviorIncident.objects.create(
        student=random.choice(students),
        classroom=random.choice(classrooms),
        reported_by=random.choice(teachers),
        incident_type=random.choice(incident_types),
        description=f"Student exhibited {random.choice(incident_types).lower()} during class",
        severity=random.choice(severities),
        status=random.choice(['pending', 'approved', 'rejected']),
        incident_date=timezone.now() - timedelta(days=random.randint(0, 30)),
        ai_detected=random.choice([True, False]),
        ai_confidence=random.uniform(0.7, 0.95) if random.choice([True, False]) else None
    )

print(f"✅ Created 20 behavior incidents")

# ============================================================================
# 15. CREATE CONVERSATIONS & MESSAGES
# ============================================================================
print("\n💬 Creating Conversations & Messages...")
for i in range(10):
    conversation = Conversation.objects.create(
        conversation_type='direct',
        created_by=random.choice(teachers)
    )
    
    # Add participants
    teacher = random.choice(teachers)
    student = random.choice(students)
    conversation.participants.add(teacher, student)
    
    # Add messages
    for j in range(random.randint(3, 8)):
        sender = random.choice([teacher, student])
        Message.objects.create(
            conversation=conversation,
            sender=sender,
            message_text=f"Message {j+1} in conversation about coursework",
            created_at=timezone.now() - timedelta(hours=random.randint(1, 72))
        )
    
    conversation.last_message_at = timezone.now()
    conversation.save()

print(f"✅ Created 10 conversations with messages")

# ============================================================================
# 16. CREATE ANNOUNCEMENTS
# ============================================================================
print("\n📢 Creating Announcements...")
announcements_data = [
    {'title': 'Welcome to New Semester', 'target': 'all', 'priority': 'important'},
    {'title': 'Exam Schedule Released', 'target': 'student', 'priority': 'urgent'},
    {'title': 'Parent-Teacher Meeting', 'target': 'parent', 'priority': 'important'},
    {'title': 'Holiday Notice', 'target': 'all', 'priority': 'normal'},
    {'title': 'Sports Day Event', 'target': 'student', 'priority': 'normal'},
]

for ann_data in announcements_data:
    Announcement.objects.create(
        title=ann_data['title'],
        content=f"Details about {ann_data['title']}. Please read carefully.",
        sent_by=random.choice(teachers),
        target_role=ann_data['target'],
        priority=ann_data['priority'],
        sent_at=timezone.now() - timedelta(days=random.randint(1, 10)),
        is_draft=False
    )

print(f"✅ Created {len(announcements_data)} announcements")

# ============================================================================
# 17. CREATE BADGES & ACHIEVEMENTS
# ============================================================================
print("\n🏆 Creating Badges & Achievements...")
badges_data = [
    {'name': 'First Assignment', 'description': 'Complete your first assignment', 'icon': '📝'},
    {'name': 'Perfect Attendance', 'description': '30 days perfect attendance', 'icon': '✅'},
    {'name': 'Quiz Master', 'description': 'Score 100% on a quiz', 'icon': '🎯'},
    {'name': 'Study Streak', 'description': '7 day study streak', 'icon': '🔥'},
    {'name': 'Helpful Student', 'description': 'Help 5 classmates', 'icon': '🤝'},
]

badges = []
for badge_data in badges_data:
    badge, _ = Badge.objects.get_or_create(
        name=badge_data['name'],
        defaults={
            'description': badge_data['description'],
            'icon': badge_data['icon'],
            'xp_reward': random.randint(50, 200),
            'rarity': random.choice(['common', 'rare', 'epic'])
        }
    )
    badges.append(badge)

# Award badges to students
for student in students:
    for badge in random.sample(badges, random.randint(1, 3)):
        Achievement.objects.get_or_create(
            student=student,
            badge=badge,
            defaults={'earned_at': timezone.now() - timedelta(days=random.randint(1, 30))}
        )

print(f"✅ Created {len(badges)} badges and awarded to students")

# ============================================================================
# 18. CREATE LEADERBOARDS
# ============================================================================
print("\n🏅 Creating Leaderboards...")
for classroom in classrooms[:3]:  # Top 3 classrooms
    leaderboard = Leaderboard.objects.create(
        classroom=classroom,
        leaderboard_type='weekly',
        start_date=timezone.now().date() - timedelta(days=7),
        end_date=timezone.now().date(),
        is_active=True
    )
    
    enrolled_students = ClassroomEnrollment.objects.filter(
        classroom=classroom, is_active=True
    ).values_list('student', flat=True)
    
    for rank, student_id in enumerate(enrolled_students[:10], 1):
        LeaderboardEntry.objects.create(
            leaderboard=leaderboard,
            student_id=student_id,
            score=random.randint(500, 2000),
            rank=rank
        )

print(f"✅ Created leaderboards")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 60)
print("✅ DATA POPULATION COMPLETE!")
print("=" * 60)
print(f"""
📊 Summary:
   • School: {School.objects.count()}
   • Academic Years: {AcademicYear.objects.count()}
   • Subjects: {Subject.objects.count()}
   • Teachers: {User.objects.filter(role='teacher').count()}
   • Students: {User.objects.filter(role='student').count()}
   • Parents: {User.objects.filter(role='parent').count()}
   • Classrooms: {Classroom.objects.count()}
   • Enrollments: {ClassroomEnrollment.objects.count()}
   • Lectures: {Lecture.objects.count()}
   • Notes: {Note.objects.count()}
   • Assignments: {Assignment.objects.count()}
   • Quizzes: {Quiz.objects.count()}
   • Attendance Records: {AttendanceRecord.objects.count()}
   • Behavior Incidents: {BehaviorIncident.objects.count()}
   • Conversations: {Conversation.objects.count()}
   • Messages: {Message.objects.count()}
   • Announcements: {Announcement.objects.count()}
   • Badges: {Badge.objects.count()}
   • Achievements: {Achievement.objects.count()}

🔑 Login Credentials:
   Teachers: teacher1@premiumedu.com / teacher123
   Students: student1@premiumedu.com / student123
   Parents: parent1@premiumedu.com / parent123
""")
print("=" * 60)
print("🎉 Ready to test the application!")
