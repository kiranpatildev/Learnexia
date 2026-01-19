import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.flashcards.models import FlashcardSet
from apps.schools.models import ClassroomEnrollment
from apps.accounts.models import User

# Get student
student = User.objects.get(email='student1@premiumedu.com')
print(f"Student: {student.email} (ID: {student.id})")

# Check enrollments
enrollments = ClassroomEnrollment.objects.filter(student=student, is_active=True)
print(f"\nActive Enrollments: {enrollments.count()}")
for e in enrollments:
    print(f"  - Classroom ID: {e.classroom.id}, Name: {e.classroom}")

# Check published flashcards
flashcards = FlashcardSet.objects.filter(is_published=True)
print(f"\nPublished Flashcard Sets: {flashcards.count()}")
for f in flashcards:
    print(f"  - Classroom ID: {f.classroom.id}, Title: {f.title}, Teacher: {f.teacher.email}")

# Check if student can see any flashcards
student_flashcards = FlashcardSet.objects.filter(
    classroom_id__in=enrollments.values_list('classroom_id', flat=True),
    is_published=True
)
print(f"\nFlashcards Student Can See: {student_flashcards.count()}")
for f in student_flashcards:
    print(f"  - {f.title}")
