"""
Enroll existing students in existing classrooms
"""
from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.schools.models import Classroom, ClassroomEnrollment


class Command(BaseCommand):
    help = 'Enroll students in classrooms'

    def handle(self, *args, **kwargs):
        self.stdout.write("📝 Enrolling students in classrooms...\n")
        
        # Get all active students
        students = User.objects.filter(role='student', is_active=True)
        self.stdout.write(f"Found {students.count()} students")
        
        # Get all classrooms
        classrooms = Classroom.objects.all()
        self.stdout.write(f"Found {classrooms.count()} classrooms\n")
        
        if not students.exists():
            self.stdout.write(self.style.ERROR("No students found!"))
            return
        
        if not classrooms.exists():
            self.stdout.write(self.style.ERROR("No classrooms found!"))
            return
        
        # Enroll each student in all classrooms
        enrollment_count = 0
        for student in students:
            for classroom in classrooms:
                enrollment, created = ClassroomEnrollment.objects.get_or_create(
                    classroom=classroom,
                    student=student
                )
                if created:
                    enrollment_count += 1
                    self.stdout.write(f"  ✓ Enrolled {student.get_full_name()} in {classroom}")
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS(f"✅ Created {enrollment_count} new enrollments"))
        self.stdout.write(f"Total enrollments: {ClassroomEnrollment.objects.count()}")
        self.stdout.write("="*60)
