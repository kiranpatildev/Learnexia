"""
Management command to enroll students in a classroom
"""

from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.schools.models import Classroom, ClassroomEnrollment


class Command(BaseCommand):
    help = 'Enroll all students in a classroom'

    def add_arguments(self, parser):
        parser.add_argument(
            '--classroom-id',
            type=str,
            help='Classroom ID (UUID)',
        )
        parser.add_argument(
            '--classroom-name',
            type=str,
            help='Classroom name (alternative to ID)',
        )
        parser.add_argument(
            '--student-email',
            type=str,
            help='Specific student email (optional - if not provided, enrolls all students)',
        )

    def handle(self, *args, **options):
        classroom_id = options.get('classroom_id')
        classroom_name = options.get('classroom_name')
        student_email = options.get('student_email')

        # Get classroom
        try:
            if classroom_id:
                classroom = Classroom.objects.get(id=classroom_id)
            elif classroom_name:
                classroom = Classroom.objects.get(name__icontains=classroom_name)
            else:
                self.stdout.write(self.style.ERROR('Please provide --classroom-id or --classroom-name'))
                return
        except Classroom.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Classroom not found'))
            return

        self.stdout.write(self.style.SUCCESS(f'Found classroom: {str(classroom)} (ID: {classroom.id})'))

        # Get students to enroll
        if student_email:
            try:
                students = [User.objects.get(email=student_email, role='student')]
                self.stdout.write(f'Enrolling specific student: {student_email}')
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Student not found: {student_email}'))
                return
        else:
            students = User.objects.filter(role='student')
            self.stdout.write(f'Enrolling ALL {students.count()} students')

        # Enroll students
        enrolled_count = 0
        already_enrolled_count = 0
        
        for student in students:
            enrollment, created = ClassroomEnrollment.objects.get_or_create(
                classroom=classroom,
                student=student,
                defaults={
                    'is_active': True
                }
            )
            
            if created:
                enrolled_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Enrolled: {student.get_full_name()} ({student.email})'))
            else:
                already_enrolled_count += 1
                if not enrollment.is_active:
                    enrollment.is_active = True
                    enrollment.save()
                    self.stdout.write(self.style.WARNING(f'  ↻ Re-activated: {student.get_full_name()}'))
                else:
                    self.stdout.write(f'  - Already enrolled: {student.get_full_name()}')

        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS(f'ENROLLMENT COMPLETE'))
        self.stdout.write(self.style.SUCCESS(f'Classroom: {str(classroom)}'))
        self.stdout.write(self.style.SUCCESS(f'New enrollments: {enrolled_count}'))
        self.stdout.write(f'Already enrolled: {already_enrolled_count}')
        self.stdout.write(f'Total students in class: {ClassroomEnrollment.objects.filter(classroom=classroom, is_active=True).count()}')
        self.stdout.write(self.style.SUCCESS('=' * 60))
