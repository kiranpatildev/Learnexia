"""
Management command to list classrooms and students
"""

from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.schools.models import Classroom, ClassroomEnrollment


class Command(BaseCommand):
    help = 'List all classrooms and students'

    def add_arguments(self, parser):
        parser.add_argument(
            '--classrooms',
            action='store_true',
            help='List all classrooms',
        )
        parser.add_argument(
            '--students',
            action='store_true',
            help='List all students',
        )
        parser.add_argument(
            '--classroom-id',
            type=str,
            help='Show students in specific classroom',
        )

    def handle(self, *args, **options):
        if options.get('classrooms'):
            self.list_classrooms()
        
        if options.get('students'):
            self.list_students()
        
        if options.get('classroom_id'):
            self.list_classroom_students(options['classroom_id'])
        
        if not any([options.get('classrooms'), options.get('students'), options.get('classroom_id')]):
            self.stdout.write(self.style.WARNING('Please specify --classrooms, --students, or --classroom-id'))

    def list_classrooms(self):
        classrooms = Classroom.objects.all()
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 80))
        self.stdout.write(self.style.SUCCESS(f'ALL CLASSROOMS ({classrooms.count()})'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        for classroom in classrooms:
            enrollment_count = ClassroomEnrollment.objects.filter(
                classroom=classroom,
                is_active=True
            ).count()
            
            self.stdout.write(f'\nClassroom: {str(classroom)}')
            self.stdout.write(f'  ID: {classroom.id}')
            self.stdout.write(f'  Grade: {classroom.grade}')
            self.stdout.write(f'  Section: {classroom.section}')
            self.stdout.write(f'  Enrolled Students: {enrollment_count}')
            self.stdout.write(f'  Teacher: {classroom.teacher.get_full_name() if classroom.teacher else "None"}')

    def list_students(self):
        students = User.objects.filter(role='student')
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 80))
        self.stdout.write(self.style.SUCCESS(f'ALL STUDENTS ({students.count()})'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        for student in students:
            enrollments = ClassroomEnrollment.objects.filter(
                student=student,
                is_active=True
            )
            
            self.stdout.write(f'\nStudent: {student.get_full_name()}')
            self.stdout.write(f'  Email: {student.email}')
            self.stdout.write(f'  ID: {student.id}')
            self.stdout.write(f'  Enrolled in {enrollments.count()} classroom(s)')
            for enrollment in enrollments:
                self.stdout.write(f'    - {str(enrollment.classroom)}')

    def list_classroom_students(self, classroom_id):
        try:
            classroom = Classroom.objects.get(id=classroom_id)
        except Classroom.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Classroom not found: {classroom_id}'))
            return
        
        enrollments = ClassroomEnrollment.objects.filter(
            classroom=classroom,
            is_active=True
        ).select_related('student')
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 80))
        self.stdout.write(self.style.SUCCESS(f'STUDENTS IN: {str(classroom)}'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        if not enrollments.exists():
            self.stdout.write(self.style.WARNING('\nNo students enrolled in this classroom'))
        else:
            for enrollment in enrollments:
                student = enrollment.student
                self.stdout.write(f'\n{student.get_full_name()}')
                self.stdout.write(f'  Email: {student.email}')
                self.stdout.write(f'  ID: {student.id}')
