"""
SIMPLE Management command - Just creates users
"""
from django.core.management.base import BaseCommand
from apps.accounts.models import User, StudentProfile, TeacherProfile


class Command(BaseCommand):
    help = 'Create test users'

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 Creating test users...\n")
        
        # Create Teachers
        self.stdout.write("👨‍🏫 Creating Teachers...")
        teachers_data = [
            {'email': 'teacher1@premiumedu.com', 'first_name': 'Priya', 'last_name': 'Sharma'},
            {'email': 'teacher2@premiumedu.com', 'first_name': 'John', 'last_name': 'Davis'},
        ]
        
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
                self.stdout.write(self.style.SUCCESS(f"  ✓ Created {user.get_full_name()}"))
            else:
                self.stdout.write(f"  - {user.get_full_name()} already exists")
        
        # Create Students
        self.stdout.write("\n👨‍🎓 Creating Students...")
        students_data = [
            {'email': 'student1@premiumedu.com', 'first_name': 'Alex', 'last_name': 'Thompson'},
            {'email': 'student2@premiumedu.com', 'first_name': 'Emma', 'last_name': 'Wilson'},
            {'email': 'student3@premiumedu.com', 'first_name': 'James', 'last_name': 'Chen'},
        ]
        
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
                self.stdout.write(self.style.SUCCESS(f"  ✓ Created {user.get_full_name()}"))
            else:
                self.stdout.write(f"  - {user.get_full_name()} already exists")
        
        # Summary
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("✅ DONE!"))
        self.stdout.write("="*60)
        self.stdout.write(f"""
📊 Summary:
   • Teachers: {User.objects.filter(role='teacher').count()}
   • Students: {User.objects.filter(role='student').count()}

🔑 Login Credentials:
   Teachers: teacher1@premiumedu.com / teacher123
   Students: student1@premiumedu.com / student123
""")
        self.stdout.write("="*60)
        self.stdout.write(self.style.SUCCESS("🎉 You can now login!"))
