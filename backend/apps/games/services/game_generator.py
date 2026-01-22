"""
AI Game Generator Service using Google Gemini

Generates educational game content (questions, options, explanations)
optimized for reaction-based games like Fall Drop.
"""

import json
import logging
from typing import Dict, List, Any
from decimal import Decimal
from django.core.exceptions import ValidationError

from apps.notes.ai_services.gemini_config import GeminiConfig
from apps.lectures.models import Lecture

logger = logging.getLogger(__name__)


class GameGeneratorService:
    """Service for generating game content using Gemini AI"""
    
    # Configuration
    VALID_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']
    MIN_QUESTIONS = 5
    MAX_QUESTIONS = 20
    MIN_TRANSCRIPT_LENGTH = 100
    
    # Pricing (approximate, update based on actual Gemini pricing)
    COST_PER_1K_INPUT_TOKENS = Decimal('0.00035')
    COST_PER_1K_OUTPUT_TOKENS = Decimal('0.00105')
    
    def __init__(self):
        """Initialize the game generator service"""
        self.client = GeminiConfig.get_client()
        self.model_name = GeminiConfig.MODEL_NAME
    
    def generate_quick_drop_game(
        self,
        lecture: Lecture,
        difficulty: str = 'MEDIUM',
        question_count: int = 10
    ) -> Dict[str, Any]:
        """
        Generate Fall Drop game content from lecture transcript
        
        Args:
            lecture: Lecture object with transcript
            difficulty: EASY, MEDIUM, or HARD
            question_count: Number of questions (5-20)
        
        Returns:
            dict: {
                'success': bool,
                'questions': list,
                'metadata': dict,
                'cost': dict,
                'error': str (if failed)
            }
        """
        try:
            # Validate inputs
            self._validate_lecture(lecture)
            self._validate_difficulty(difficulty)
            self._validate_question_count(question_count)
            
            # Build prompt
            prompt = self._build_quick_drop_prompt(
                lecture=lecture,
                difficulty=difficulty,
                question_count=question_count
            )
            
            # Call Gemini API
            logger.info(
                f"[GAME GEN] Generating {difficulty} Quick Drop game "
                f"({question_count} questions) for: {lecture.title}"
            )
            
            # Configuration for creative but consistent generation
            generation_config = {
                'temperature': 0.7,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 4096,
                'response_mime_type': 'application/json',
            }
            
            # Call Gemini API with retries
            import time
            max_retries = 3
            retry_delay = 2
            response = None
            last_error = None
            
            for attempt in range(max_retries):
                try:
                    response = self.client.models.generate_content(
                        model=self.model_name,
                        contents=prompt,
                        config=generation_config
                    )
                    break # Success
                except Exception as e:
                    last_error = e
                    error_str = str(e)
                    if "503" in error_str or "overloaded" in error_str.lower():
                        if attempt < max_retries - 1:
                            logger.warning(f"[GAME GEN] Gemini overloaded (503). Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                            time.sleep(retry_delay)
                            retry_delay *= 2 # Exponential backoff
                            continue
                    # If not 503, or retries exhausted, re-raise
                    raise e
            
            if not response:
                raise last_error or Exception("Failed to get response from Gemini")
            
            # Parse response
            game_data = self._parse_response(response.text)
            
            # Validate generated content
            self._validate_game_data(game_data, question_count)
            
            # Calculate cost
            cost_info = self._calculate_cost(response)
            
            logger.info(
                f"[GAME GEN] Successfully generated {len(game_data['questions'])} questions. "
                f"Cost: ${cost_info['total_cost']:.4f}"
            )
            
            return {
                'success': True,
                'questions': game_data['questions'],
                'metadata': game_data.get('metadata', {}),
                'cost': cost_info,
            }
            
        except ValidationError as e:
            logger.error(f"[GAME GEN] Validation error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'questions': [],
            }
        except json.JSONDecodeError as e:
            logger.error(f"[GAME GEN] JSON parsing error: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to parse AI response. Please try again.',
                'questions': [],
            }
        except Exception as e:
            logger.error(f"[GAME GEN] Unexpected error: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': f'Game generation failed: {str(e)}',
                'questions': [],
            }
            
    def generate_hot_potato_game(
        self,
        lecture: Lecture,
        difficulty: str = 'MEDIUM',
        question_count: int = 15
    ) -> Dict[str, Any]:
        """
        Generate Hot Potato game content (Speed/Reaction)
        """
        try:
            # Validate inputs
            self._validate_lecture(lecture)
            self._validate_difficulty(difficulty)
            self._validate_question_count(question_count)
            
            # Build prompt
            prompt = self._build_hot_potato_prompt(
                lecture=lecture,
                difficulty=difficulty,
                question_count=question_count
            )
            
            # Call Gemini API
            logger.info(
                f"[GAME GEN] Generating {difficulty} Hot Potato game "
                f"({question_count} questions) for: {lecture.title}"
            )
            
            # Configuration
            generation_config = {
                'temperature': 0.7,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 4096,
                'response_mime_type': 'application/json',
            }
            
            # Retry logic
            import time
            max_retries = 3
            retry_delay = 2
            response = None
            last_error = None
            
            for attempt in range(max_retries):
                try:
                    response = self.client.models.generate_content(
                        model=self.model_name,
                        contents=prompt,
                        config=generation_config
                    )
                    break
                except Exception as e:
                    last_error = e
                    if "503" in str(e) or "overloaded" in str(e).lower():
                        if attempt < max_retries - 1:
                            time.sleep(retry_delay)
                            retry_delay *= 2
                            continue
                    raise e
            
            if not response:
                raise last_error or Exception("Failed to get response")
                
            # Parse response
            game_data = self._parse_response(response.text)
            
            # Validate
            self._validate_game_data(game_data, question_count)
            
            # Calculate cost
            cost_info = self._calculate_cost(response)
            
            return {
                'success': True,
                'questions': game_data['questions'],
                'metadata': game_data.get('metadata', {}),
                'cost': cost_info,
            }
            
        except Exception as e:
            logger.error(f"[GAME GEN] Hot Potato Error: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'questions': []
            }
    
    def _validate_lecture(self, lecture: Lecture) -> None:
        """Validate lecture has sufficient content"""
        if not lecture.transcript:
            raise ValidationError('Lecture has no transcript')
        
        if len(lecture.transcript) < self.MIN_TRANSCRIPT_LENGTH:
            raise ValidationError(
                f'Transcript too short (minimum {self.MIN_TRANSCRIPT_LENGTH} characters)'
            )
    
    def _validate_difficulty(self, difficulty: str) -> None:
        """Validate difficulty level"""
        if difficulty not in self.VALID_DIFFICULTIES:
            raise ValidationError(
                f'Invalid difficulty. Must be one of: {", ".join(self.VALID_DIFFICULTIES)}'
            )
    
    def _validate_question_count(self, count: int) -> None:
        """Validate question count"""
        if not isinstance(count, int):
            raise ValidationError('Question count must be an integer')
        
        if count < self.MIN_QUESTIONS or count > self.MAX_QUESTIONS:
            raise ValidationError(
                f'Question count must be between {self.MIN_QUESTIONS} and {self.MAX_QUESTIONS}'
            )
    
    def _build_quick_drop_prompt(
        self,
        lecture: Lecture,
        difficulty: str,
        question_count: int
    ) -> str:
        """Build optimized prompt for Quick Drop game generation"""
        
        # Get difficulty-specific instructions
        difficulty_instructions = self._get_difficulty_instructions(difficulty)
        
        # Truncate transcript if too long (to avoid token limits)
        transcript = lecture.transcript[:8000]
        
        prompt = f"""You are an expert educational content creator specializing in game-based learning.

**CONTEXT:**
- Subject: {lecture.classroom.subject.name if hasattr(lecture, 'classroom') else 'General Education'}
- Lecture Title: {lecture.title}
- Topic: {lecture.topic or 'Extracted from content'}
- Target Difficulty: {difficulty}

**LECTURE CONTENT:**
{transcript}

**TASK:**
Generate {question_count} high-quality multiple-choice questions for the "Quick Drop" reaction-based game.

**REQUIREMENTS:**

1. QUESTION QUALITY:
   - Each question must test ONE specific concept from the lecture
   - Questions should be clear, concise, and unambiguous
   - Mix question types: definitions (30%), concepts (40%), application (30%)
   - Avoid questions requiring calculations (too slow for reaction game)
   - No "All of the above" or "None of the above" options
   - Questions should be answerable in 5-8 seconds

2. DIFFICULTY CALIBRATION:
{difficulty_instructions}

3. OPTION ENGINEERING:
   - Create EXACTLY 4 options per question
   - Each option should be 15-30 characters (must fit in circular orb)
   - Options should be similar in length
   - Place correct answer at RANDOM positions (not always first)
   - Create 3 plausible but incorrect options (common misconceptions)
   - Avoid obviously silly or implausible options

4. EXPLANATIONS:
   - Provide 2-3 sentence explanation for WHY the answer is correct
   - Use simple, student-friendly language
   - Reference the lecture content when possible

5. TOPIC TAGGING:
   - Assign each question to a specific sub-topic from the lecture

**OUTPUT FORMAT:**
Return ONLY valid JSON (no markdown, no code blocks). Structure:

{{
  "questions": [
    {{
      "id": "q1",
      "question": "Clear, specific question?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correct_index": 2,
      "explanation": "The correct answer is Option C because...",
      "difficulty": "easy",
      "topic": "Lecture Sub-topic"
    }}
  ],
  "metadata": {{
    "total_questions": {question_count},
    "difficulty_distribution": {{"easy": 3, "medium": 5, "hard": 2}},
    "topics_covered": ["Topic 1", "Topic 2"],
    "estimated_total_time": 90
  }}
}}

**VALIDATION RULES:**
- Exactly {question_count} questions
- Each question has EXACTLY 4 options
- correct_index is 0, 1, 2, or 3
- No duplicate questions or options
- All fields are required (no null values)
- Options must be concise (15-30 characters each)

Generate the questions now:"""
        
        return prompt
    
    def _build_hot_potato_prompt(
        self,
        lecture: Lecture,
        difficulty: str,
        question_count: int
    ) -> str:
        """Build optimized prompt for Hot Potato game"""
        
        transcript = lecture.transcript[:8000]
        
        prompt = f"""You are an expert educational content creator for a high-pressure quiz game called "Hot Potato."

**CONTEXT:**
- Subject: {lecture.classroom.subject.name if hasattr(lecture, 'classroom') else 'General'}
- Lecture Title: {lecture.title}
- Topic: {lecture.topic or 'Extracted from content'}
- Difficulty Mode: {difficulty}

**LECTURE CONTENT:**
{transcript}

**GAME MECHANICS:**
This is a SPEED game where students have 6-15 seconds per question. Timer decreases with each question.

**TASK:**
Generate {question_count} multiple-choice questions with PROGRESSIVE DIFFICULTY.

**DIFFICULTY PROGRESSION:**
- First 30%: EASY (direct recall, obvious answers)
- Middle 40%: MEDIUM (understanding required)
- Last 30%: HARD (application, analysis, tricky distractors)

**REQUIREMENTS:**

1. **Time Pressure Optimization:**
   - Keep questions concise (under 20 words)
   - Avoid complex calculations or long reading
   - Questions must be answerable quickly if student knows content
   - No multi-step reasoning (too slow for this format)

2. **Answer Options:**
   - EXACTLY 4 options (A, B, C, D)
   - Options should be 10-40 characters each
   - All options must be plausible at first glance
   - Place correct answer at RANDOM positions
   - For HARD questions: Use very similar distractors

3. **Explanations:**
   - 1-2 sentences maximum (students are rushed)
   - Focus on WHY the answer is correct

**OUTPUT FORMAT (JSON ONLY):**
{{
  "questions": [
    {{
      "id": "q1",
      "question": "What does IoT stand for?",
      "options": [
        "Internet of Things",
        "Internet of Thoughts", 
        "Intelligent Object Technology",
        "Integrated Online Tools"
      ],
      "correct_index": 0,
      "explanation": "IoT stands for Internet of Things, referring to connected physical devices.",
      "difficulty": "easy",
      "time_limit": 15,
      "order": 1
    }}
  ],
  "metadata": {{
    "total_questions": {question_count},
    "difficulty_distribution": {{"easy": 5, "medium": 5, "hard": 5}},
    "topics_covered": ["..."],
    "average_time_per_question": 9
  }}
}}

**VALIDATION:**
- Exactly {question_count} questions
- Each has exactly 4 options
- correct_index is 0, 1, 2, or 3
- options is a list of 4 strings
- difficulty is 'easy', 'medium', or 'hard'
- No duplicate questions

Generate the questions now:"""
        return prompt
    
    def _get_difficulty_instructions(self, difficulty: str) -> str:
        """Get difficulty-specific instructions"""
        instructions = {
            'EASY': """
   - Focus on direct recall and basic definitions
   - Use clear, simple language
   - Test fundamental concepts explicitly mentioned in lecture
   - Correct answers should be obvious if student paid attention
   - Example: "What does CPU stand for?"
            """,
            
            'MEDIUM': """
   - Require understanding, not just memorization
   - Test relationships between concepts
   - Include scenario-based questions
   - May require connecting 2-3 lecture points
   - Example: "How does IoT improve supply chain efficiency?"
            """,
            
            'HARD': """
   - Test deep comprehension and application
   - Require critical thinking and analysis
   - May involve hypothetical scenarios not directly in lecture
   - Test ability to distinguish subtle differences
   - Example: "Which IoT protocol would be BEST for low-power sensors in remote areas?"
            """
        }
        return instructions.get(difficulty, instructions['MEDIUM'])
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse and clean AI response"""
        if not response_text:
            logger.error("[GAME GEN] Empty response text from Gemini")
            raise ValueError("AI returned empty response")

        # Remove markdown code blocks if present
        cleaned_text = response_text.strip()
        if cleaned_text.startswith('```json'):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith('```'):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith('```'):
            cleaned_text = cleaned_text[:-3]
        
        cleaned_text = cleaned_text.strip()
        
        # Parse JSON
        data = json.loads(cleaned_text)
        
        return data
    
    def _validate_game_data(self, data: Dict[str, Any], expected_count: int) -> None:
        """Validate generated game data"""
        if 'questions' not in data:
            raise ValidationError('Response missing "questions" field')
        
        questions = data['questions']
        
        if not isinstance(questions, list):
            raise ValidationError('"questions" must be a list')
        
        if len(questions) != expected_count:
            logger.warning(
                f"Expected {expected_count} questions, got {len(questions)}"
            )
        
        # Validate each question
        for i, q in enumerate(questions, 1):
            self._validate_question(q, i)
    
    def _validate_question(self, question: Dict[str, Any], index: int) -> None:
        """Validate individual question structure"""
        required_fields = ['id', 'question', 'options', 'correct_index', 'explanation']
        
        for field in required_fields:
            if field not in question:
                raise ValidationError(
                    f'Question {index} missing required field: {field}'
                )
        
        # Validate options
        options = question['options']
        if not isinstance(options, list) or len(options) != 4:
            raise ValidationError(
                f'Question {index} must have exactly 4 options'
            )
        
        # Validate correct_index
        correct_index = question['correct_index']
        if not isinstance(correct_index, int) or correct_index not in [0, 1, 2, 3]:
            raise ValidationError(
                f'Question {index} has invalid correct_index: {correct_index}'
            )
        
        # Validate option lengths (should fit in orbs)
        for opt_idx, option in enumerate(options):
            if len(option) > 50:  # Relaxed from 30 to 50 for flexibility
                logger.warning(
                    f'Question {index}, option {opt_idx} is long ({len(option)} chars): {option}'
                )
    
    def _calculate_cost(self, response) -> Dict[str, Any]:
        """Calculate API usage cost"""
        try:
            usage = response.usage_metadata
            
            input_tokens = usage.prompt_token_count
            output_tokens = usage.candidates_token_count
            total_tokens = usage.total_token_count
            
            input_cost = (Decimal(input_tokens) / 1000) * self.COST_PER_1K_INPUT_TOKENS
            output_cost = (Decimal(output_tokens) / 1000) * self.COST_PER_1K_OUTPUT_TOKENS
            total_cost = input_cost + output_cost
            
            return {
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'total_tokens': total_tokens,
                'input_cost': float(input_cost),
                'output_cost': float(output_cost),
                'total_cost': float(total_cost),
            }
        except Exception as e:
            logger.warning(f"Could not calculate cost: {e}")
            return {
                'input_tokens': 0,
                'output_tokens': 0,
                'total_tokens': 0,
                'total_cost': 0.0,
            }
