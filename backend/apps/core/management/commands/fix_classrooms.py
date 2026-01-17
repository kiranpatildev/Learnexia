"""
Django Management Command to Fix Classroom Teacher Assignments
Run: python manage.py fix_classrooms
"""

from django.core.management.base import BaseCommand
from apps.schools.models import Classroom
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Fix classroom teacher assignments'

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write("  FIXING CLASSROOM TEACHER ASSIGNMENTS")
        self.stdout.write("=" * 60)
        self.stdout.write("")
        
        # Get the new teachers
        teachers = list(User.objects.filter(role='teacher', email__contains='premiumedu.com').order_by('email'))
        
        if len(teachers) < 3:
            self.stdout.write(self.style.ERROR("❌ Not enough teachers found!"))
            return
        
        self.stdout.write(f"Found {len(teachers)} teachers:")
        for t in teachers:
            self.stdout.write(f"  - {t.get_full_name()} ({t.email})")
        self.stdout.write("")
        
        # Get all classrooms
        classrooms = Classroom.objects.all().order_by('grade', 'section')
        
        self.stdout.write(f"Found {classrooms.count()} classrooms")
        self.stdout.write("")
        
        # Assign teachers to classrooms in round-robin fashion
        self.stdout.write("Updating classroom teachers...")
        teacher_assignments = [
            teachers[0],  # Grade 1-A Mathematics
            teachers[1],  # Grade 1-B Science
            teachers[2],  # Grade 1-C English
            teachers[0],  # Grade 2-A Physics
            teachers[1],  # Grade 2-B Chemistry
            teachers[2],  # Grade 2-C Biology
        ]
        
        updated_count = 0
        for idx, classroom in enumerate(classrooms):
            if idx < len(teacher_assignments):
                old_teacher = classroom.teacher
                new_teacher = teacher_assignments[idx]
                
                if old_teacher != new_teacher:
                    classroom.teacher = new_teacher
                    classroom.save()
                    updated_count += 1
                    self.stdout.write(
                        f"  ✅ Updated: Grade {classroom.grade}-{classroom.section} {classroom.subject.name}"
                        f"\n     From: {old_teacher.get_full_name() if old_teacher else 'None'}"
                        f"\n     To:   {new_teacher.get_full_name()}"
                    )
                else:
                    self.stdout.write(
                        f"  ⏭️  Unchanged: Grade {classroom.grade}-{classroom.section} {classroom.subject.name}"
                        f" (Already assigned to {new_teacher.get_full_name()})"
                    )
        
        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write(f"  UPDATED {updated_count} CLASSROOMS")
        self.stdout.write("=" * 60)
        self.stdout.write("")
        
        # Show final assignments
        self.stdout.write("Final classroom assignments:")
        for classroom in classrooms:
            self.stdout.write(
                f"  📚 Grade {classroom.grade}-{classroom.section} {classroom.subject.name}"
                f" → {classroom.teacher.get_full_name()}"
            )
        
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS('✅ Classroom teachers fixed!'))
        self.stdout.write("")
        self.stdout.write("🔐 Login as:")
        self.stdout.write("   teacher1@premiumedu.com / teacher123")
        self.stdout.write("")
        self.stdout.write("You should now see classrooms in the dropdown!")
