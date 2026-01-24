
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.games.models import GameTemplate

def create_crossword_template():
    template, created = GameTemplate.objects.get_or_create(
        code='crossword',
        defaults={
            'name': 'Crossword Puzzle',
            'description': 'Solve clues to fill in intersecting words from your lecture.',
            'icon': '🧩',
            'game_type': 'PUZZLE', # Assuming allowed types or valid string
            'is_active': True,
            'min_questions': 8,
            'max_questions': 22,
            'default_time_per_question': 0,
            'supports_difficulty': True
        }
    )
    if created:
        print("Created Crossword template")
    else:
        print("Crossword template already exists")

if __name__ == "__main__":
    create_crossword_template()
