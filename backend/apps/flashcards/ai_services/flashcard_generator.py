"""
AI Flashcard Generator Service using Google Gemini

Generates pedagogically sound flashcards optimized for active recall and spaced repetition
with five card types and two styles.
"""

import logging
import json
from typing import Dict, List
from django.core.exceptions import ValidationError

from apps.notes.ai_services.gemini_config import GeminiConfig

logger = logging.getLogger(__name__)


class FlashcardGeneratorService:
    """Service for generating flashcards using Gemini AI"""
    
    # Flashcard configuration
    VALID_TYPES = ['DEFINITION', 'CONCEPT', 'MIXED', 'FORMULA', 'APPLICATION']
    VALID_STYLES = ['CONCISE', 'DETAILED']
    VALID_COUNTS = [10, 20, 30, 40, 50, 'auto']
    MIN_TEXT_LENGTH = 100
    
    def __init__(self):
        """Initialize the flashcard generator service"""
        self.client = GeminiConfig.get_client()
        self.model_name = GeminiConfig.MODEL_NAME
    
    def generate_flashcards(
        self, 
        lecture, 
        card_type: str = 'MIXED', 
        style: str = 'CONCISE',
        count: any = 'auto'
    ) -> Dict:
        """
        Generate flashcards from approved lecture transcript
        
        Args:
            lecture: Lecture object with approved transcript
            card_type: DEFINITION, CONCEPT, MIXED, FORMULA, or APPLICATION
            style: CONCISE or DETAILED
            count: Number of cards (10, 20, 30, 40, 50, or 'auto')
        
        Returns:
            dict: {
                'success': bool,
                'flashcards': list,
                'count': int,
                'type': str,
                'style': str,
                'error': str (if failed)
            }
        """
        try:
            # Validate inputs
            self._validate_lecture(lecture)
            self._validate_type(card_type)
            self._validate_style(style)
            self._validate_count(count)
            
            # Get context
            topic = f"{lecture.chapter}: {lecture.topic}"
            
            # Calculate count if auto
            count_instruction = self._get_count_instruction(count, lecture.transcript)
            
            # Build prompt
            prompt = self._build_flashcard_prompt(
                lecture_text=lecture.transcript,
                topic=topic,
                card_type=card_type,
                style=style,
                count_instruction=count_instruction
            )
            
            # Call Gemini API with JSON output
            logger.info(f"Generating {card_type} flashcards ({style} style) for: {lecture.title}")
            
            # Configure for structured JSON output
            generation_config = {
                'temperature': 0.7,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 8192,
                'response_mime_type': 'application/json',  # Force JSON output
            }
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=generation_config
            )
            
            # Process response
            if not response or not response.text:
                raise ValidationError("Gemini API returned empty response")
            
            # Parse JSON response
            try:
                flashcards_data = json.loads(response.text)
            except json.JSONDecodeError:
                raise ValidationError("Failed to parse flashcard data from model response")
            
            # Validate flashcards structure
            if not isinstance(flashcards_data, list):
                raise ValidationError("Invalid flashcard format - expected array")
            
            # Clean and validate each flashcard
            flashcards = []
            for card in flashcards_data:
                if isinstance(card, dict) and 'question' in card and 'answer' in card:
                    flashcards.append({
                        'question': card.get('question', '').strip(),
                        'answer': card.get('answer', '').strip(),
                        'category': card.get('category', 'General').strip()
                    })
            
            if not flashcards:
                raise ValidationError("No valid flashcards generated")
            
            logger.info(f"✅ Flashcards generated successfully: {len(flashcards)} cards")
            
            return {
                'success': True,
                'flashcards': flashcards,
                'count': len(flashcards),
                'type': card_type,
                'style': style,
                'error': None
            }
        
        except Exception as e:
            logger.error(f"Flashcard generation failed: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'flashcards': [],
                'count': 0,
                'type': card_type,
                'style': style
            }
    
    def _validate_lecture(self, lecture):
        """Validate lecture has required data"""
        if not lecture.transcript:
            raise ValidationError("Lecture transcript is empty")
        
        if len(lecture.transcript) < self.MIN_TEXT_LENGTH:
            raise ValidationError(
                f"Transcript too short (minimum {self.MIN_TEXT_LENGTH} characters). "
                "Please provide more content for flashcard generation."
            )
        
        # REMOVED: Transcript approval check - teachers can generate flashcards immediately
    
    def _validate_type(self, card_type: str):
        """Validate card type"""
        if card_type not in self.VALID_TYPES:
            raise ValidationError(
                f"Invalid card type: {card_type}. "
                f"Must be one of: {', '.join(self.VALID_TYPES)}"
            )
    
    def _validate_style(self, style: str):
        """Validate card style"""
        if style not in self.VALID_STYLES:
            raise ValidationError(
                f"Invalid style: {style}. "
                f"Must be one of: {', '.join(self.VALID_STYLES)}"
            )
    
    def _validate_count(self, count):
        """Validate card count"""
        if count != 'auto':
            try:
                count = int(count)
                if count not in [10, 20, 30, 40, 50]:
                    raise ValidationError(
                        f"Invalid count: {count}. "
                        "Must be one of: 10, 20, 30, 40, 50, or 'auto'"
                    )
            except (ValueError, TypeError):
                raise ValidationError(
                    "Count must be a number (10, 20, 30, 40, 50) or 'auto'"
                )
    
    def _get_count_instruction(self, count, text: str) -> str:
        """
        Determine the number of flashcards to generate
        
        Args:
            count: Requested count or 'auto'
            text: Lecture text
        
        Returns:
            str: Count instruction for prompt
        """
        if count == 'auto':
            word_count = len(text.split())
            if word_count < 500:
                return "Generate 10-15 flashcards"
            elif word_count < 1500:
                return "Generate 20-25 flashcards"
            elif word_count < 3000:
                return "Generate 30-40 flashcards"
            else:
                return "Generate 40-50 flashcards"
        else:
            return f"Generate exactly {count} flashcards"
    
    def _build_flashcard_prompt(
        self, 
        lecture_text: str, 
        topic: str, 
        card_type: str, 
        style: str,
        count_instruction: str
    ) -> str:
        """
        Build the AI prompt for flashcard generation
        
        Args:
            lecture_text: Lecture transcript
            topic: Topic name
            card_type: Type of flashcards
            style: Card style
            count_instruction: How many cards to generate
        
        Returns:
            str: Complete prompt for Gemini
        """
        # Get type and style specific instructions
        type_instructions = self._get_type_instructions(card_type)
        style_instructions = self._get_style_instructions(style)
        
        prompt = f"""You are an expert educational content designer specializing in spaced repetition and active recall techniques. Your task is to create HIGH-QUALITY study flashcards from lecture content.

FLASHCARD SPECIFICATIONS:
- Topic: {topic}
- Card Type: {card_type}
- Card Style: {style}
- Target Count: {count_instruction}

{type_instructions}

{style_instructions}

CRITICAL QUALITY REQUIREMENTS:

1. QUESTION DESIGN:
   - Questions must be PRECISE and UNAMBIGUOUS
   - One clear concept per card (avoid compound questions)
   - Use active recall triggers ("What is...", "How does...", "Why...")
   - Avoid questions that can be answered with simple yes/no
   - Questions should stand alone without needing external context

2. ANSWER QUALITY:
   - Answers must be COMPLETE yet CONCISE
   - Include just enough detail for understanding
   - Use clear, student-friendly language
   - For complex concepts, break into digestible points
   - Avoid unnecessary jargon (or define it if essential)

3. CATEGORIZATION:
   - Assign meaningful, searchable categories
   - Use categories like: "Definition", "Process", "Formula", "Concept", "Application", "Comparison", "Example"
   - Be specific (e.g., "Photosynthesis Process" not just "Biology")
   - Consistent naming (use Title Case)

4. PEDAGOGICAL PRINCIPLES:
   - Cards should promote ACTIVE RECALL (not passive recognition)
   - Include both foundational and advanced concepts
   - Create progressive difficulty (simple → complex)
   - Ensure cards are TESTABLE (student can self-verify correctness)

5. COVERAGE STRATEGY:
   - Cover ALL major topics from the lecture
   - Include key definitions, processes, examples, and relationships
   - Don't cluster cards around one topic
   - Balance between different concept types

LECTURE CONTENT:
{lecture_text}

Generate the flashcards now as a JSON array. Each flashcard must have:
- question (string): The front of the card
- answer (string): The back of the card
- category (string): A specific, meaningful category

Return ONLY valid JSON array with no additional text or markdown formatting:
[
  {{"question": "...", "answer": "...", "category": "..."}},
  {{"question": "...", "answer": "...", "category": "..."}}
]"""
        
        return prompt
    
    def _get_type_instructions(self, card_type: str) -> str:
        """
        Get type-specific instructions for flashcard generation
        
        Args:
            card_type: Type of flashcards
        
        Returns:
            str: Type-specific instructions
        """
        instructions = {
            'DEFINITION': """
CARD TYPE: DEFINITION FLASHCARDS

Focus on:
- Key terminology and their precise definitions
- Important concepts that require memorization
- Technical terms specific to the subject
- Foundational vocabulary

Question Format Examples:
- "What is [term]?"
- "Define [concept]"
- "What does [term] mean?"

Answer Format:
- Clear, dictionary-style definition
- 1-2 sentences maximum
- Include the essential meaning only

Example:
Q: "What is photosynthesis?"
A: "The process by which plants convert light energy into chemical energy (glucose) using carbon dioxide and water, releasing oxygen as a byproduct."
""",

            'CONCEPT': """
CARD TYPE: CONCEPT UNDERSTANDING FLASHCARDS

Focus on:
- How things work (processes, mechanisms)
- Relationships between ideas
- Cause and effect
- Principles and theories

Question Format Examples:
- "How does [process] work?"
- "What is the relationship between [A] and [B]?"
- "Why does [phenomenon] occur?"
- "Explain [concept]"

Answer Format:
- 2-4 sentences explaining the concept
- Include key points in logical order
- Show connections and relationships

Example:
Q: "How do enzymes speed up chemical reactions?"
A: "Enzymes lower the activation energy required for reactions by providing an alternative reaction pathway. They bind to substrates at their active site, forming an enzyme-substrate complex that facilitates the conversion to products."
""",

            'FORMULA': """
CARD TYPE: FORMULA & EQUATION FLASHCARDS

Focus on:
- Mathematical formulas and equations
- Scientific laws expressed mathematically
- Key calculations and their components
- Variable definitions

Question Format Examples:
- "What is the formula for [concept]?"
- "What does [variable] represent in [formula]?"
- "How do you calculate [quantity]?"

Answer Format:
- State the formula clearly
- Define all variables
- Include units where applicable

Example:
Q: "What is the formula for kinetic energy?"
A: "KE = ½mv², where m is mass (kg) and v is velocity (m/s). Kinetic energy is measured in joules (J)."
""",

            'APPLICATION': """
CARD TYPE: APPLICATION & PROBLEM-SOLVING FLASHCARDS

Focus on:
- Real-world applications
- When/where to use concepts
- Problem-solving approaches
- Practical examples

Question Format Examples:
- "When would you use [concept]?"
- "Give an example of [concept] in practice"
- "How would you solve [type of problem]?"

Answer Format:
- Provide concrete examples or scenarios
- Show step-by-step application
- Connect theory to practice

Example:
Q: "When would you use the Henderson-Hasselbalch equation?"
A: "Use it to calculate the pH of a buffer solution when you know the pKa of the weak acid and the ratio of conjugate base to acid. Common in biochemistry for determining optimal pH conditions for enzymes."
""",

            'MIXED': """
CARD TYPE: MIXED FLASHCARDS

Create a balanced mix of:
- 40% Definition cards (key terms and meanings)
- 30% Concept cards (how things work, relationships)
- 15% Formula cards (if applicable to content)
- 15% Application cards (real-world usage, examples)

Ensure comprehensive coverage across all concept types present in the lecture material.
"""
        }
        
        return instructions.get(card_type, instructions['MIXED'])
    
    def _get_style_instructions(self, style: str) -> str:
        """
        Get style-specific instructions for flashcard generation
        
        Args:
            style: Card style
        
        Returns:
            str: Style-specific instructions
        """
        instructions = {
            'CONCISE': """
STYLE: CONCISE (Quick Review Cards)

Characteristics:
- Questions: 5-10 words
- Answers: 1-2 sentences (20-40 words max)
- Focus on ESSENTIAL information only
- Perfect for rapid review sessions
- Bite-sized, memorizable chunks

Best for:
- Quick daily review
- Last-minute exam prep
- Building foundational knowledge
- Spaced repetition apps

Example:
Q: "What is mitosis?"
A: "Cell division producing two identical daughter cells with the same chromosome number as the parent."
""",

            'DETAILED': """
STYLE: DETAILED (Deep Understanding Cards)

Characteristics:
- Questions: 10-20 words (can include context)
- Answers: 2-4 sentences (40-80 words)
- Include examples, elaborations, and connections
- Provide context and reasoning
- Comprehensive explanations

Best for:
- Initial learning phase
- Complex topics requiring context
- Building deep understanding
- Connecting related concepts

Example:
Q: "What is mitosis and why is it important?"
A: "Mitosis is a type of cell division that produces two genetically identical daughter cells from one parent cell. It's crucial for growth, tissue repair, and asexual reproduction. The process maintains the diploid chromosome number and ensures genetic continuity."
"""
        }
        
        return instructions.get(style, instructions['CONCISE'])
