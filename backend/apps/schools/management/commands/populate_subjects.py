"""
Management command to populate subjects
"""
from django.core.management.base import BaseCommand
from apps.schools.models import Subject


class Command(BaseCommand):
    help = 'Populate subjects for all grades'

    def handle(self, *args, **kwargs):
        subjects_data = [
            # Grade 1
            {'name': 'Mathematics', 'code': 'MATH1', 'grade': 1, 'color': '#3B82F6', 'icon': 'calculator'},
            {'name': 'English', 'code': 'ENG1', 'grade': 1, 'color': '#EF4444', 'icon': 'book'},
            {'name': 'Science', 'code': 'SCI1', 'grade': 1, 'color': '#10B981', 'icon': 'flask'},
            {'name': 'Social Studies', 'code': 'SS1', 'grade': 1, 'color': '#F59E0B', 'icon': 'globe'},
            {'name': 'Art', 'code': 'ART1', 'grade': 1, 'color': '#8B5CF6', 'icon': 'palette'},
            
            # Grade 2
            {'name': 'Mathematics', 'code': 'MATH2', 'grade': 2, 'color': '#3B82F6', 'icon': 'calculator'},
            {'name': 'English', 'code': 'ENG2', 'grade': 2, 'color': '#EF4444', 'icon': 'book'},
            {'name': 'Science', 'code': 'SCI2', 'grade': 2, 'color': '#10B981', 'icon': 'flask'},
            {'name': 'Social Studies', 'code': 'SS2', 'grade': 2, 'color': '#F59E0B', 'icon': 'globe'},
            {'name': 'Art', 'code': 'ART2', 'grade': 2, 'color': '#8B5CF6', 'icon': 'palette'},
            
            # Grade 3
            {'name': 'Mathematics', 'code': 'MATH3', 'grade': 3, 'color': '#3B82F6', 'icon': 'calculator'},
            {'name': 'English', 'code': 'ENG3', 'grade': 3, 'color': '#EF4444', 'icon': 'book'},
            {'name': 'Science', 'code': 'SCI3', 'grade': 3, 'color': '#10B981', 'icon': 'flask'},
            {'name': 'Social Studies', 'code': 'SS3', 'grade': 3, 'color': '#F59E0B', 'icon': 'globe'},
            {'name': 'Computer Science', 'code': 'CS3', 'grade': 3, 'color': '#06B6D4', 'icon': 'laptop'},
            {'name': 'Art', 'code': 'ART3', 'grade': 3, 'color': '#8B5CF6', 'icon': 'palette'},
            
            # Grade 4
            {'name': 'Mathematics', 'code': 'MATH4', 'grade': 4, 'color': '#3B82F6', 'icon': 'calculator'},
            {'name': 'English', 'code': 'ENG4', 'grade': 4, 'color': '#EF4444', 'icon': 'book'},
            {'name': 'Science', 'code': 'SCI4', 'grade': 4, 'color': '#10B981', 'icon': 'flask'},
            {'name': 'Social Studies', 'code': 'SS4', 'grade': 4, 'color': '#F59E0B', 'icon': 'globe'},
            {'name': 'Computer Science', 'code': 'CS4', 'grade': 4, 'color': '#06B6D4', 'icon': 'laptop'},
            {'name': 'Physical Education', 'code': 'PE4', 'grade': 4, 'color': '#EC4899', 'icon': 'activity'},
            
            # Grade 5
            {'name': 'Mathematics', 'code': 'MATH5', 'grade': 5, 'color': '#3B82F6', 'icon': 'calculator'},
            {'name': 'English', 'code': 'ENG5', 'grade': 5, 'color': '#EF4444', 'icon': 'book'},
            {'name': 'Science', 'code': 'SCI5', 'grade': 5, 'color': '#10B981', 'icon': 'flask'},
            {'name': 'Social Studies', 'code': 'SS5', 'grade': 5, 'color': '#F59E0B', 'icon': 'globe'},
            {'name': 'Computer Science', 'code': 'CS5', 'grade': 5, 'color': '#06B6D4', 'icon': 'laptop'},
            {'name': 'Physical Education', 'code': 'PE5', 'grade': 5, 'color': '#EC4899', 'icon': 'activity'},
        ]

        created_count = 0
        updated_count = 0

        for subject_data in subjects_data:
            subject, created = Subject.objects.update_or_create(
                name=subject_data['name'],
                grade=subject_data['grade'],
                defaults={
                    'code': subject_data['code'],
                    'color': subject_data['color'],
                    'icon': subject_data['icon'],
                    'description': f"{subject_data['name']} for Grade {subject_data['grade']}"
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created: {subject}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Updated: {subject}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Done! Created {created_count} subjects, Updated {updated_count} subjects'
            )
        )
