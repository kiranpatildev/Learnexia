"""
Management command to create initial game templates
"""

from django.core.management.base import BaseCommand
from apps.games.models import GameTemplate


class Command(BaseCommand):
    help = 'Create initial game templates'
    
    def handle(self, *args, **options):
        """Create game templates"""
        
        templates = [
            {
                'code': 'quick_drop',
                'name': 'Quick Drop',
                'description': 'Click correct answers before they fall! Test your reaction time and knowledge.',
                'icon': '🎯',
                'game_type': 'REACTION',
                'min_questions': 5,
                'max_questions': 15,
                'default_time_per_question': 8,
                'supports_difficulty': True,
            },
            {
                'code': 'word_scramble',
                'name': 'Word Scramble',
                'description': 'Unscramble letters to form the correct answer.',
                'icon': '🔤',
                'game_type': 'PUZZLE',
                'min_questions': 5,
                'max_questions': 20,
                'default_time_per_question': 15,
                'supports_difficulty': True,
            },
            {
                'code': 'match_pairs',
                'name': 'Match Pairs',
                'description': 'Match concepts with their definitions by flipping cards.',
                'icon': '🃏',
                'game_type': 'MEMORY',
                'min_questions': 6,
                'max_questions': 16,
                'default_time_per_question': 20,
                'supports_difficulty': True,
            },
            {
                'code': 'hot_potato',
                'name': 'Hot Potato',
                'description': 'Answer before the timer explodes! Speed and accuracy under pressure.',
                'icon': '💣',
                'game_type': 'REACTION',
                'min_questions': 10,
                'max_questions': 20,
                'default_time_per_question': 15,
                'supports_difficulty': True,
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for template_data in templates:
            template, created = GameTemplate.objects.update_or_create(
                code=template_data['code'],
                defaults=template_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created template: {template.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated template: {template.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone! Created {created_count}, Updated {updated_count} templates.'
            )
        )
