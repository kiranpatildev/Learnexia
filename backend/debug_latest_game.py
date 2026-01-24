
import os
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.games.models import LectureGame

def debug_latest_game():
    try:
        # Get latest game
        game = LectureGame.objects.order_by('-created_at').first()
        if not game:
            print("No games found.")
            return

        print(f"Latest Game ID: {game.id}")
        print(f"Title: {game.title}")
        print(f"Template: {game.template.code}")
        print("--- Game Data Keys ---")
        print(list(game.game_data.keys()))
        
        if 'pairs' in game.game_data:
            pairs = game.game_data['pairs']
            print(f"Pairs count in DB: {len(pairs)}")
            if len(pairs) > 0:
                print("First pair sample:", pairs[0])
        else:
            print("CRITICAL: 'pairs' key missing in game_data!")
            
        if 'questions' in game.game_data:
            print(f"Questions count in DB: {len(game.game_data['questions'])}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_latest_game()
