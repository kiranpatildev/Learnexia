import os
import django
import sys

# Setup
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.lectures.models import Lecture
from apps.games.models import GameTemplate
from apps.games.services.game_generator import GameGeneratorService
from apps.games.serializers import GameGenerationRequestSerializer

def run_diagnostics():
    print(">>> STARTING DIAGNOSTICS <<<")
    
    # 1. Check Data Availability
    print("\n[1] Checking Data...")
    lectures = Lecture.objects.filter(transcript__isnull=False).exclude(transcript='')
    if not lectures.exists():
        print("FAIL: No lectures with transcripts found.")
        # Try to find ANY lecture
        all_lectures = Lecture.objects.all()
        if all_lectures.exists():
             print(f"Found {all_lectures.count()} lectures, but none have transcripts.")
        else:
             print("No lectures found in DB.")
        return
        
    # Pick one with decent length
    lecture = None
    for l in lectures:
        if len(l.transcript) > 100:
            lecture = l
            break
            
    if not lecture:
        print("FAIL: Lectures exist but transcripts are too short (<100 chars).")
        return

    print(f"PASS: Found lecture '{lecture.title}' (ID: {lecture.id}), Transcript Len: {len(lecture.transcript)}")
    
    template = GameTemplate.objects.filter(code='fall_drop').first()
    if not template:
        print("FAIL: 'fall_drop' template not found.")
        return
    print(f"PASS: Found template '{template.name}'")

    # 2. Check Serialization
    print("\n[2] Checking Serializer Validation...")
    # Simulate the payload frontend sends (AFTER my fix)
    payload = {
        'lecture_id': lecture.id,
        'game_type': 'fall_drop',  # Correct key
        'difficulty': 'MEDIUM',
        'question_count': 5,
        'force_regenerate': True,
        'auto_publish': False
    }
    serializer = GameGenerationRequestSerializer(data=payload)
    if serializer.is_valid():
        print("PASS: Serializer validation successful.")
    else:
        print(f"FAIL: Serializer errors: {serializer.errors}")

    # 3. Check Game Generator Service (Actual AI Call)
    print("\n[3] Testing AI Generation (Gemini)...")
    service = GameGeneratorService()
    
    try:
        # We perform a real call
        result = service.generate_fall_drop_game(
            lecture=lecture,
            difficulty='MEDIUM',
            question_count=3 # Minimal
        )
        
        if result['success']:
             print(f"PASS: AI Generation successful! Generated {len(result['questions'])} questions.")
        else:
             print(f"FAIL: AI Service returned error: {result.get('error')}")
             
    except Exception as e:
        print(f"CRITICAL FAIL: Service raised exception: {e}")

if __name__ == "__main__":
    run_diagnostics()
