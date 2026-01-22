import os
import django
import sys

# Setup
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.games.serializers import GameGenerationRequestSerializer
from apps.lectures.models import Lecture
from apps.games.models import GameTemplate

def test():
    print("--- TESTING SERIALIZER ---")
    
    # 1. Get Valid Lecture
    lecture = Lecture.objects.filter(transcript__isnull=False).exclude(transcript='').first()
    if not lecture:
        lecture = Lecture.objects.first() # Fallback
        
    if not lecture:
        print("FAIL: No lectures in DB.")
        return
        
    print(f"Using Lecture ID: {lecture.id}")
    
    # 2. Get Valid Template
    template = GameTemplate.objects.filter(code='fall_drop').first()
    if not template:
        print("FAIL: 'fall_drop' template missing.")
    else:
        print(f"Using Template Code: {template.code}, Active: {template.is_active}")

    # 3. Simulate Frontend Payload (Corrected version)
    data = {
        'lecture_id': lecture.id,
        'game_type': 'fall_drop',
        'difficulty': 'MEDIUM',
        'question_count': 5,
        'force_regenerate': False
    }
    
    ser = GameGenerationRequestSerializer(data=data)
    if ser.is_valid():
        print("PASS: Data is valid!")
        print(ser.validated_data)
    else:
        print("FAIL: Validation Errors:")
        print(ser.errors)

if __name__ == "__main__":
    test()
