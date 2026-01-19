"""
Core notes generation service using Google Gemini AI
"""

import logging
import re
from typing import Dict
from django.core.exceptions import ValidationError

from .gemini_config import GeminiConfig

logger = logging.getLogger(__name__)


class NotesGeneratorService:
    """Service for generating lecture notes using Gemini AI"""
    
    def __init__(self):
        """Initialize the notes generator service"""
        self.client = GeminiConfig.get_client()
        self.model_name = GeminiConfig.MODEL_NAME
    
    def generate_notes(self, lecture, note_format: str = 'comprehensive') -> Dict:
        """
        Generate lecture notes from approved transcript
        
        Args:
            lecture: Lecture object with approved transcript
            note_format: One of ['comprehensive', 'bullet_point', 'cornell', 'study_guide']
        
        Returns:
            dict: {
                'success': bool,
                'notes_content': str (markdown),
                'format': str,
                'word_count': int,
                'summary': str,
                'title': str,
                'error': str (if failed)
            }
        """
        try:
            # Validate inputs
            self._validate_lecture(lecture)
            self._validate_format(note_format)
            
            # Get context
            classroom = lecture.classroom
            grade = classroom.grade
            subject = classroom.subject.name if classroom.subject else "General"
            
            # Build prompt
            prompt = self._build_prompt(lecture, note_format, grade, subject)
            
            # Call Gemini API using NEW SDK
            logger.info(f"Generating {note_format} notes for lecture: {lecture.title}")
            print(f"[DEBUG] Calling Gemini API with model: {self.model_name}")
            print(f"[DEBUG] Prompt length: {len(prompt)} characters")
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            
            print(f"[DEBUG] Response object: {response}")
            print(f"[DEBUG] Response type: {type(response)}")
            print(f"[DEBUG] Has text attr: {hasattr(response, 'text')}")
            if hasattr(response, 'text'):
                print(f"[DEBUG] Response.text: {response.text[:200] if response.text else 'NONE'}")
            
            # Process response
            if not response or not response.text:
                print(f"[DEBUG ERROR] Empty response! response={response}, text={getattr(response, 'text', 'NO_ATTR')}")
                raise ValidationError("Gemini API returned empty response")
            
            notes_content = response.text.strip()
            
            # Clean and format
            notes_content = self._clean_markdown(notes_content)
            
            # Extract metadata
            title = self._extract_title(notes_content, lecture.title)
            summary = self._extract_summary(notes_content)
            word_count = len(notes_content.split())
            
            logger.info(f"[NOTES] Notes generated successfully: {word_count} words")
            
            return {
                'success': True,
                'notes_content': notes_content,
                'format': note_format,
                'word_count': word_count,
                'summary': summary,
                'title': title,
                'error': None
            }
        
        except Exception as e:
            logger.error(f"Notes generation failed: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'notes_content': None,
                'word_count': 0
            }
    
    def _validate_lecture(self, lecture):
        """Validate lecture has required data"""
        if not lecture.transcript:
            raise ValidationError("Lecture transcript is empty")
        
        if len(lecture.transcript) < 50:
            raise ValidationError("Transcript too short (minimum 50 characters)")
        
        # REMOVED: Transcript approval check - teachers can generate notes immediately
    
    def _validate_format(self, note_format: str):
        """Validate note format is valid"""
        valid_formats = ['comprehensive', 'bullet_point', 'cornell', 'study_guide']
        if note_format not in valid_formats:
            raise ValidationError(
                f"Invalid note format: {note_format}. "
                f"Must be one of: {', '.join(valid_formats)}"
            )
    
    def _build_prompt(self, lecture, note_format: str, grade: str, subject: str) -> str:
        """
        Build the AI prompt for Gemini
        
        Args:
            lecture: Lecture object
            note_format: Note format type
            grade: Grade level
            subject: Subject name
        
        Returns:
            str: Complete prompt for Gemini
        """
        # Calculate age range from grade
        try:
            grade_num = int(grade)
            age_range = f"{grade_num + 5}-{grade_num + 6}"
        except:
            age_range = "10-18"
        
        # Get format-specific instructions
        format_instructions = self._get_format_instructions(note_format)
        
        # Format display name
        format_names = {
            'comprehensive': 'Comprehensive Detailed Notes',
            'bullet_point': 'Bullet Point Notes',
            'cornell': 'Cornell Notes',
            'study_guide': 'Study Guide'
        }
        format_display = format_names.get(note_format, note_format.title())
        
        # Build complete prompt
        prompt = f"""You are an expert academic note-taker and educator. Transform the following lecture transcript into exceptional study notes that help students learn and retain information effectively.

**Lecture Information:**
- Title: {lecture.title}
- Subject: {subject}
- Chapter: {lecture.chapter}
- Topic: {lecture.topic}
- Grade Level: Grade {grade}
- Target Audience: Students aged {age_range} years

**Note Format:** {format_display}
{format_instructions}

**Your Task:**
Create comprehensive study notes that include:

1. **Title:** A clear, engaging title for the notes
2. **Introduction/Overview:** Brief summary (2-3 sentences) of what this lecture covers
3. **Main Content:** Organized with clear headings and subheadings
   - Use proper markdown formatting (# ## ### for headers)
   - Break content into logical sections
   - Include ALL important concepts from the transcript
4. **Key Definitions:** Highlight and explain important terms
   - Format: **Term:** Explanation
5. **Examples & Applications:** Real-world examples and practical applications
6. **Visual Hierarchy:** Use markdown effectively
   - Headers for main sections
   - **Bold** for important terms
   - *Italics* for emphasis
   - Bullet points and numbered lists
   - > Blockquotes for key insights
7. **Summary Section:** Comprehensive summary of all key points
8. **Quick Review Points:** 5-7 critical takeaways students must remember

**Quality Standards:**
- Easy to read and visually appealing
- Appropriate for Grade {grade} students
- Comprehensive yet concise
- Perfect for exam preparation
- Logically structured with clear flow
- Student-friendly language (explain complex terms in simple words)
- Include specific details and examples from the lecture
- Use proper academic tone while being accessible

**Lecture Transcript:**
{lecture.transcript}

**GENERATE DETAILED, WELL-FORMATTED MARKDOWN NOTES NOW.**"""
        
        return prompt
    
    def _get_format_instructions(self, note_format: str) -> str:
        """
        Get format-specific instructions for Gemini
        
        Args:
            note_format: Type of notes to generate
        
        Returns:
            str: Format-specific instructions
        """
        instructions = {
            'comprehensive': """**Style Focus:** Create comprehensive detailed explanations using full paragraphs.

Structure Guidelines:
- Use complete paragraphs with thorough explanations (3-5 sentences per concept)
- Ensure all examples are fully fleshed out with context and details
- Include background information where helpful for understanding
- Deep dive into complex concepts - don't oversimplify
- Provide thorough understanding of all topics
- Use subheadings liberally to organize content
- Aim for depth over brevity""",
            
            'bullet_point': """**Style Focus:** Use primarily bullet points for quick scanning and easy review.

Structure Guidelines:
- Convert concepts into concise bullet points (max 2 sentences each)
- Heavy use of nested bullets for sub-points
- Minimize paragraph text - prefer lists
- Use short, punchy statements
- Each bullet should be self-contained and clear
- Group related bullets under section headings
- Prioritize scannability and quick comprehension""",
            
            'cornell': """**Style Focus:** Format specifically as Cornell Notes with THREE distinct sections.

Structure Guidelines:
Create notes in this exact format:

## Cues/Questions (Left Column Content)
List key questions and prompts here. Write 5-10 questions that correspond to main concepts.
- One question per important concept
- Questions should prompt recall of key information
- Use interrogative format (What, How, Why, etc.)

---

## Notes (Right Column Content)
Detailed explanations and content. This is the main notes section.
- Answer each cue/question from the left column
- Include examples, definitions, explanations
- Use bullet points and paragraphs
- Reference specific details from lecture

---

## Summary (Bottom Section)
Write a comprehensive summary paragraph (3-5 sentences) that synthesizes all notes above.
- Capture the essence of the entire lecture
- Highlight connections between concepts
- Include the most critical takeaways""",
            
            'study_guide': """**Style Focus:** Create an exam-focused study guide optimized for test preparation.

Structure Guidelines:
1. **Key Terms & Definitions Section:**
   - List all important terms with clear definitions
   - Format: **Term:** Definition (simple explanation)
   
2. **Main Concepts Section:**
   - Explain each major concept thoroughly
   - Include why it's important
   
3. **Examples & Applications:**
   - Provide real-world examples
   - Show how concepts apply practically
   
4. **Practice Questions Section:**
   - Create 5-10 practice questions covering all major topics
   - Mix question types: multiple choice, short answer, scenario-based
   - Questions should test understanding, not just memorization
   
5. **Answer Key:**
   - Place at the very end after all questions
   - Provide detailed answers with explanations
   - Format: **Q1 Answer:** Explanation...

6. **Study Tips:**
   - Add checkboxes mentally for self-testing
   - Highlight the most testable concepts"""
        }
        
        return instructions.get(note_format, instructions['comprehensive'])
    
    def _extract_summary(self, notes_content: str) -> str:
        """
        Extract or generate summary from notes
        
        Args:
            notes_content: Full markdown notes
        
        Returns:
            str: Summary text (max 500 chars)
        """
        # Look for Summary section
        summary_match = re.search(r'##\s*Summary\s*\n+(.*?)(?=\n##|\Z)', notes_content, re.DOTALL | re.IGNORECASE)
        
        if summary_match:
            summary = summary_match.group(1).strip()
        else:
            # Take first 2-3 paragraphs
            paragraphs = [p.strip() for p in notes_content.split('\n\n') if p.strip() and not p.strip().startswith('#')]
            summary = ' '.join(paragraphs[:3])
        
        # Clean markdown and limit length
        summary = re.sub(r'[#*_`]', '', summary)  # Remove markdown symbols
        summary = summary[:500]
        
        return summary.strip()
    
    def _extract_title(self, notes_content: str, fallback_title: str) -> str:
        """
        Extract title from notes or use fallback
        
        Args:
            notes_content: Full markdown notes
            fallback_title: Fallback if no title found
        
        Returns:
            str: Extracted or fallback title
        """
        # Look for first # heading
        title_match = re.search(r'^#\s+(.+)$', notes_content, re.MULTILINE)
        
        if title_match:
            title = title_match.group(1).strip()
            # Remove markdown formatting
            title = re.sub(r'[*_`]', '', title)
            return title
        
        return fallback_title
    
    def _clean_markdown(self, text: str) -> str:
        """
        Clean and validate markdown
        
        Args:
            text: Raw markdown text
        
        Returns:
            str: Cleaned markdown
        """
        # Remove excessive blank lines (max 2 consecutive)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        # Ensure proper spacing after headers
        text = re.sub(r'(^#{1,6}\s+.+)$', r'\1\n', text, flags=re.MULTILINE)
        
        return text
