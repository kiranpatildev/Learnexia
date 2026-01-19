"""
Simplified AI Quiz Generator Service using Google Gemini
"""

import logging
import json
import re
from typing import Dict
from django.core.exceptions import ValidationError

from apps.notes.ai_services.gemini_config import GeminiConfig

logger = logging.getLogger(__name__)


class QuizGeneratorService:
    """Service for generating quizzes using Gemini AI"""
    
    def __init__(self):
        """Initialize the quiz generator service"""
        gemini = GeminiConfig()
        self.client = gemini.get_client()
        self.model_name = GeminiConfig.MODEL_NAME
    
    def generate_quiz(self, lecture, difficulty: str = 'MEDIUM', length: int = 10) -> Dict:
        """
        Generate quiz from lecture transcript
        
        Args:
            lecture: Lecture object with transcript
            difficulty: EASY, MEDIUM, or HARD
            length: Number of questions (5, 10, or 15)
        
        Returns:
            Dict with success, questions array, and count
        """
        try:
            # Validate
            if not lecture or not lecture.transcript:
                return {
                    'success': False,
                    'error': 'Lecture has no transcript',
                    'questions': [],
                    'count': 0
                }
            
            # Build prompt
            prompt = f"""You are an expert quiz creator. Generate EXACTLY {length} multiple-choice questions.

REQUIREMENTS:
- Generate EXACTLY {length} questions
- Each question has 4 options
- One correct answer
- Brief explanation

RETURN ONLY VALID JSON:

{{
  "questions": [
    {{
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "explanation": "Why correct"
    }}
  ]
}}

LECTURE:
{lecture.transcript[:3000]}

Generate {length} {difficulty} questions as JSON:"""
            
            # Call Gemini
            generation_config = {
                'temperature': 0.7,
                'top_p': 0.95,
                'max_output_tokens': 8192,
            }
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=generation_config
            )
            
            if not response or not response.text:
                return {
                    'success': False,
                    'error': 'Empty response from AI',
                    'questions': [],
                    'count': 0
                }
            
            # Parse JSON
            content = response.text.strip()
            
            # Extract JSON from code blocks
            json_match = re.search(r'```(?:json)?\s*(\{.*?\}|\[.*?\])\s*```', content, re.DOTALL)
            if json_match:
                content = json_match.group(1)
            
            # Clean up
            content = content.strip()
            if content.startswith('```'):
                lines = content.split('\n')
                content = '\n'.join(lines[1:-1]) if len(lines) > 2 else content
            
            # Parse
            quiz_data = json.loads(content)
            
            # Extract questions
            if isinstance(quiz_data, dict) and 'questions' in quiz_data:
                questions = quiz_data['questions']
            elif isinstance(quiz_data, list):
                questions = quiz_data
            else:
                questions = [quiz_data]
            
            logger.info(f"✅ Generated {len(questions)} quiz questions ({difficulty})")
            
            return {
                'success': True,
                'questions': questions,
                'count': len(questions),
                'difficulty': difficulty,
                'length': length
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {str(e)}")
            logger.error(f"Content: {content[:500] if 'content' in locals() else 'N/A'}")
            return {
                'success': False,
                'error': f'Failed to parse quiz JSON: {str(e)}',
                'questions': [],
                'count': 0
            }
        except Exception as e:
            logger.error(f"Quiz generation error: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'questions': [],
                'count': 0
            }
