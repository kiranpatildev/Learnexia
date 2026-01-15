"""
AI Quiz Generator Service using Google Gemini

Generates pedagogically sound multiple-choice quizzes from lecture transcripts
with three difficulty levels and intelligent distractor engineering.
"""

import logging
from typing import Dict
from django.core.exceptions import ValidationError

from apps.notes.ai_services.gemini_config import GeminiConfig

logger = logging.getLogger(__name__)


class QuizGeneratorService:
    """Service for generating quizzes using Gemini AI"""
    
    # Quiz configuration
    VALID_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']
    VALID_LENGTHS = [5, 10, 15]
    MIN_TRANSCRIPT_LENGTH = 100
    
    def __init__(self):
        """Initialize the quiz generator service"""
        self.model = GeminiConfig.get_model()
    
    def generate_quiz(self, lecture, difficulty: str = 'MEDIUM', length: int = 10) -> Dict:
        """
        Generate quiz from approved lecture transcript
        
        Args:
            lecture: Lecture object with approved transcript
            difficulty: EASY, MEDIUM, or HARD
            length: Number of questions (5, 10, or 15)
        
        Returns:
            dict: {
                'success': bool,
                'quiz_content': str (markdown),
                'difficulty': str,
                'length': int,
                'topic': str,
                'error': str (if failed)
            }
        """
        try:
            # Validate inputs
            self._validate_lecture(lecture)
            self._validate_difficulty(difficulty)
            self._validate_length(length)
            
            # Get context
            topic = f"{lecture.chapter}: {lecture.topic}"
            
            # Build prompt
            prompt = self._build_quiz_prompt(
                lecture_text=lecture.transcript,
                topic=topic,
                difficulty=difficulty,
                length=length
            )
            
            # Call Gemini API
            logger.info(f"Generating {difficulty} quiz ({length} questions) for: {lecture.title}")
            
            # Higher temperature for creative distractor generation
            generation_config = {
                'temperature': 0.8,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 8192,
            }
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            # Process response
            if not response or not response.text:
                raise ValidationError("Gemini API returned empty response")
            
            quiz_content = response.text.strip()
            
            logger.info(f"✅ Quiz generated successfully: {difficulty} level, {length} questions")
            
            return {
                'success': True,
                'quiz_content': quiz_content,
                'difficulty': difficulty,
                'length': length,
                'topic': topic,
                'error': None
            }
        
        except Exception as e:
            logger.error(f"Quiz generation failed: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'quiz_content': None,
                'difficulty': difficulty,
                'length': length
            }
    
    def _validate_lecture(self, lecture):
        """Validate lecture has required data"""
        if not lecture.transcript:
            raise ValidationError("Lecture transcript is empty")
        
        if len(lecture.transcript) < self.MIN_TRANSCRIPT_LENGTH:
            raise ValidationError(
                f"Transcript too short (minimum {self.MIN_TRANSCRIPT_LENGTH} characters). "
                "Please provide more content for quiz generation."
            )
        
        if not lecture.transcript_approved_by_teacher:
            raise ValidationError(
                "Transcript must be approved by teacher before generating quiz"
            )
    
    def _validate_difficulty(self, difficulty: str):
        """Validate difficulty level"""
        if difficulty not in self.VALID_DIFFICULTIES:
            raise ValidationError(
                f"Invalid difficulty: {difficulty}. "
                f"Must be one of: {', '.join(self.VALID_DIFFICULTIES)}"
            )
    
    def _validate_length(self, length: int):
        """Validate quiz length"""
        if length not in self.VALID_LENGTHS:
            raise ValidationError(
                f"Invalid length: {length}. "
                f"Must be one of: {', '.join(map(str, self.VALID_LENGTHS))}"
            )
    
    def _build_quiz_prompt(self, lecture_text: str, topic: str, difficulty: str, length: int) -> str:
        """
        Build the AI prompt for quiz generation
        
        Args:
            lecture_text: Lecture transcript
            topic: Topic name
            difficulty: Difficulty level
            length: Number of questions
        
        Returns:
            str: Complete prompt for Gemini
        """
        # Get difficulty-specific instructions
        difficulty_instructions = self._get_difficulty_instructions(difficulty)
        
        prompt = f"""You are a STRICT ACADEMIC EXAMINER designing a rigorous assessment. Your role is NOT to teach, but to TEST mastery through challenging, well-crafted questions.

QUIZ SPECIFICATIONS:
- Topic: {topic}
- Difficulty Level: {difficulty}
- Number of Questions: {length}
- Question Type: Multiple Choice (4 options: A, B, C, D)

{difficulty_instructions}

CRITICAL REQUIREMENTS:

1. QUESTION QUALITY:
   - Each question must be clear, unambiguous, and directly related to the lecture content
   - NO trick questions or intentionally misleading wording
   - Questions should have ONE definitively correct answer
   - Cover diverse topics from the lecture material
   - Progress from simpler to more complex within the quiz

2. DISTRACTOR ENGINEERING (THIS IS CRUCIAL):
   - Create PLAUSIBLE wrong answers that sound correct to someone who hasn't studied
   - Wrong answers should represent common misconceptions or partial understanding
   - Avoid obviously incorrect or nonsensical options
   - Make all 4 options similar in length and complexity
   - DO NOT use "All of the above" or "None of the above" unless pedagogically necessary
   - For HARD difficulty: Include partially correct options that would be right under slightly different conditions

3. OUTPUT FORMAT (STRICT MARKDOWN STRUCTURE):

# Quiz: {topic}

**Difficulty:** {difficulty}  
**Total Questions:** {length}

---

## Questions

**Question 1:** [Question text here]

A) [Option A]  
B) [Option B]  
C) [Option C]  
D) [Option D]

**Question 2:** [Question text here]

A) [Option A]  
B) [Option B]  
C) [Option C]  
D) [Option D]

[Continue for all {length} questions...]

---

## Answer Key

**Question 1:** [Correct Answer Letter]  
**Explanation:** [2-3 sentences explaining WHY this is correct and why others are wrong. Address common misconceptions.]

**Question 2:** [Correct Answer Letter]  
**Explanation:** [Detailed explanation with reasoning]

[Continue for all answers...]

---

PEDAGOGICAL QUALITY REQUIREMENTS:
- Content coverage: Questions should span the entire lecture
- Cognitive progression: Build from simpler to more complex
- Answer explanations must add educational value
- Quiz should feel like a real professor's exam

LECTURE CONTENT TO TEST:
{lecture_text}

Generate the complete quiz now with {length} high-quality questions at {difficulty} difficulty level."""
        
        return prompt
    
    def _get_difficulty_instructions(self, difficulty: str) -> str:
        """
        Get difficulty-specific instructions for quiz generation
        
        Args:
            difficulty: EASY, MEDIUM, or HARD
        
        Returns:
            str: Difficulty-specific instructions
        """
        instructions = {
            'EASY': """
DIFFICULTY: EASY (RECALL/RECOGNITION LEVEL)

Focus on:
- Basic definitions and terminology
- Direct recall of facts from the lecture
- Identification of key concepts
- Simple recognition tasks

Question Style:
- "What is the definition of...?"
- "Which of the following describes...?"
- "What term refers to...?"
- Straightforward, direct questions

Cognitive Level: Bloom's Taxonomy Level 1-2 (Remember & Understand)

Example Question Format:
"What is photosynthesis?
A) The process plants use to convert light energy into chemical energy (CORRECT)
B) The process of cellular respiration in animals
C) The breakdown of glucose for energy
D) The movement of water through plant cells"
""",

            'MEDIUM': """
DIFFICULTY: MEDIUM (APPLICATION LEVEL)

Focus on:
- Applying concepts to new situations
- Understanding relationships between ideas
- Comparing and contrasting concepts
- Using knowledge in practical scenarios

Question Style:
- "In the scenario..., which concept applies?"
- "How would you apply... to solve...?"
- "What is the relationship between X and Y?"
- Questions requiring understanding, not just memorization

Cognitive Level: Bloom's Taxonomy Level 3-4 (Apply & Analyze)

Example Question Format:
"A plant is placed in a dark room for 48 hours. What would happen to its rate of photosynthesis?
A) It would increase due to stress response
B) It would stop completely due to lack of light (CORRECT - requires understanding light-dependent reactions)
C) It would continue normally using stored ATP
D) It would switch to cellular respiration instead"
""",

            'HARD': """
DIFFICULTY: HARD (ANALYSIS/EVALUATION LEVEL)

Focus on:
- Complex scenario-based questions requiring deep analysis
- Evaluating multiple variables simultaneously
- Synthesis of multiple concepts
- Critical thinking and problem-solving
- "What if" scenarios with unexpected conditions

Question Style:
- Multi-step reasoning problems
- Questions with complex scenarios
- Evaluating competing explanations
- Predicting outcomes based on multiple factors
- Questions where you must eliminate wrong answers through logic

Cognitive Level: Bloom's Taxonomy Level 5-6 (Evaluate & Create)

CRITICAL: For HARD questions, make distractors especially challenging:
- Include partially correct answers
- Add options that would be correct under slightly different conditions
- Use advanced terminology correctly in all options
- Require elimination of multiple tempting wrong answers

Example Question Format:
"A researcher observes that certain alpine plants can photosynthesize at higher rates than lowland plants despite lower temperatures. Given that enzymes typically function slower in cold conditions, which explanation BEST accounts for this observation?

A) Alpine plants have evolved cold-adapted rubisco enzymes with altered temperature optima (CORRECT - requires synthesis of enzyme kinetics + evolution + environmental adaptation)
B) The higher UV radiation at altitude compensates for temperature effects (Plausible but incomplete - doesn't address enzyme kinetics)
C) Alpine plants have more chloroplasts per cell than lowland plants (Partially true but doesn't explain rate difference at lower temps)
D) The thinner atmosphere allows more direct sunlight penetration (True but doesn't address the enzymatic temperature paradox)"
"""
        }
        
        return instructions.get(difficulty, instructions['MEDIUM'])
