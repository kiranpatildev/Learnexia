"""
Management command to ensure game badges exist
"""

from django.core.management.base import BaseCommand
from apps.gamification.models import Badge

class Command(BaseCommand):
    help = 'Create necessary badges for games'
    
    def handle(self, *args, **options):
        badges = [
            {
                'name': 'Perfect Game Score',
                'description': 'Achieved a perfect score in an educational game!',
                'category': 'academic',
                'rarity': 'epic',
                'icon': 'trophy',
                'xp_reward': 100,
            },
            {
                'name': 'Speed Demon',
                'description': 'Completed a game in under 60 seconds!',
                'category': 'special',
                'rarity': 'rare',
                'icon': 'zap',
                'xp_reward': 50,
            },
            {
                'name': 'Combo Master',
                'description': 'Achieved a combo of 10 or more!',
                'category': 'participation',
                'rarity': 'rare',
                'icon': 'flame',
                'xp_reward': 50,
            },
            {
                'name': 'First Game Complete',
                'description': 'Completed your first educational game!',
                'category': 'participation',
                'rarity': 'common',
                'icon': 'star',
                'xp_reward': 25,
            },
        ]
        
        created_count = 0
        
        for badge_data in badges:
            badge, created = Badge.objects.get_or_create(
                name=badge_data['name'],
                defaults=badge_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created badge: {badge.name}'))
            else:
                self.stdout.write(f'Badge exists: {badge.name}')
        
        self.stdout.write(self.style.SUCCESS(f'Done. Created {created_count} badges.'))
