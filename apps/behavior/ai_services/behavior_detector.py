"""
AI Behavior Detection Service using Google Gemini

Analyzes lecture transcripts to detect behavior-related statements
with teacher approval workflow.
"""

import logging
import json
from typing import Dict, List
from django.core.exceptions import ValidationError

from apps.notes.ai_services.gemini_config import GeminiConfig

logger = logging.getLogger(__name__)


class BehaviorDetectionService:
    """Service for detecting behavior events using Gemini AI"""
    
    # Detection configuration
    VALID_SENSITIVITIES = ['LOW', 'MEDIUM', 'HIGH']
    MIN_TEXT_LENGTH = 50
    
    # Behavior type mapping (Gemini output → Django model)
    BEHAVIOR_TYPE_MAP = {
        'DISTURBANCE': 'disruption',
        'DISRESPECT': 'disrespect',
        'TARDINESS': 'tardiness',
        'ABSENCE': 'tardiness',  # Map to tardiness
        'INCOMPLETE_WORK': 'incomplete_work',
        'POSITIVE': 'positive',
        'PARTICIPATION': 'positive',
        'OTHER': 'other'
    }
    
    # Severity mapping
    SEVERITY_MAP = {
        'LOW': 'minor',
        'MEDIUM': 'moderate',
        'HIGH': 'serious'
    }
    
    def __init__(self):
        """Initialize the behavior detection service"""
        self.model = GeminiConfig.get_model()
    
    def detect_behaviors(
        self, 
        lecture, 
        sensitivity: str = 'MEDIUM'
    ) -> Dict:
        """
        Detect behavior events from approved lecture transcript
        
        Args:
            lecture: Lecture object with approved transcript
            sensitivity: LOW, MEDIUM, or HIGH
        
        Returns:
            dict: {
                'success': bool,
                'detected_count': int,
                'behaviors': list,
                'error': str (if failed)
            }
        """
        try:
            # Validate inputs
            self._validate_lecture(lecture)
            self._validate_sensitivity(sensitivity)
            
            # Get context
            lecture_topic = f"{lecture.chapter}: {lecture.topic}"
            
            # Build prompt
            prompt = self._build_detection_prompt(
                lecture_text=lecture.transcript,
                lecture_topic=lecture_topic,
                sensitivity=sensitivity
            )
            
            # Call Gemini API with JSON output
            logger.info(f"Detecting behaviors ({sensitivity} sensitivity) for: {lecture.title}")
            
            # Lower temperature for consistent detection
            generation_config = {
                'temperature': 0.3,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 8192,
                'response_mime_type': 'application/json',  # Force JSON output
            }
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            # Process response
            if not response or not response.text:
                # No behaviors detected
                return {
                    'success': True,
                    'detected_count': 0,
                    'behaviors': [],
                    'error': None
                }
            
            # Parse JSON response
            try:
                detected_behaviors = json.loads(response.text)
            except json.JSONDecodeError:
                raise ValidationError("Failed to parse behavior detection results from AI")
            
            # Validate and clean behaviors
            if not isinstance(detected_behaviors, list):
                detected_behaviors = []
            
            # Process each detected behavior
            behaviors = []
            for behavior in detected_behaviors:
                if isinstance(behavior, dict) and 'student_name' in behavior:
                    behaviors.append({
                        'student_name': behavior.get('student_name', 'Unknown').strip(),
                        'behavior_type': self._map_behavior_type(behavior.get('behavior_type', 'OTHER')),
                        'severity': self._map_severity(behavior.get('severity', 'MEDIUM')),
                        'description': behavior.get('description', '').strip(),
                        'original_statement': behavior.get('original_statement', '').strip(),
                        'is_positive': behavior.get('is_positive', False),
                        'confidence': behavior.get('confidence', 'MEDIUM'),
                        'ai_confidence_score': self._confidence_to_score(behavior.get('confidence', 'MEDIUM'))
                    })
            
            logger.info(f"✅ Behaviors detected: {len(behaviors)} events")
            
            return {
                'success': True,
                'detected_count': len(behaviors),
                'behaviors': behaviors,
                'error': None
            }
        
        except Exception as e:
            logger.error(f"Behavior detection failed: {str(e)}", exc_info=True)
            return {
                'success': False,
                'detected_count': 0,
                'behaviors': [],
                'error': str(e)
            }
    
    def _validate_lecture(self, lecture):
        """Validate lecture has required data"""
        if not lecture.transcript:
            raise ValidationError("Lecture transcript is empty")
        
        if len(lecture.transcript) < self.MIN_TEXT_LENGTH:
            raise ValidationError(
                f"Transcript too short (minimum {self.MIN_TEXT_LENGTH} characters)"
            )
        
        if not lecture.transcript_approved_by_teacher:
            raise ValidationError(
                "Transcript must be approved by teacher before behavior detection"
            )
    
    def _validate_sensitivity(self, sensitivity: str):
        """Validate sensitivity level"""
        if sensitivity not in self.VALID_SENSITIVITIES:
            raise ValidationError(
                f"Invalid sensitivity: {sensitivity}. "
                f"Must be one of: {', '.join(self.VALID_SENSITIVITIES)}"
            )
    
    def _map_behavior_type(self, gemini_type: str) -> str:
        """Map Gemini behavior type to Django model choice"""
        return self.BEHAVIOR_TYPE_MAP.get(gemini_type, 'other')
    
    def _map_severity(self, gemini_severity: str) -> str:
        """Map Gemini severity to Django model choice"""
        return self.SEVERITY_MAP.get(gemini_severity, 'moderate')
    
    def _confidence_to_score(self, confidence: str) -> float:
        """Convert confidence level to numeric score"""
        confidence_scores = {
            'LOW': 50.0,
            'MEDIUM': 75.0,
            'HIGH': 95.0
        }
        return confidence_scores.get(confidence, 75.0)
    
    def _build_detection_prompt(
        self, 
        lecture_text: str, 
        lecture_topic: str, 
        sensitivity: str
    ) -> str:
        """
        Build the AI prompt for behavior detection
        
        Args:
            lecture_text: Lecture transcript
            lecture_topic: Topic name
            sensitivity: Detection sensitivity
        
        Returns:
            str: Complete prompt for Gemini
        """
        # Get sensitivity-specific instructions
        sensitivity_instructions = self._get_sensitivity_instructions(sensitivity)
        
        prompt = f"""You are an AI assistant specialized in analyzing teacher-student interactions during lectures. Your task is to DETECT and EXTRACT behavior-related statements from lecture transcripts.

LECTURE TOPIC: {lecture_topic}
DETECTION SENSITIVITY: {sensitivity}

{sensitivity_instructions}

BEHAVIOR CATEGORIES TO DETECT:

1. NEGATIVE BEHAVIORS:
   - DISTURBANCE: Classroom disruption (talking, making noise, disrupting)
   - DISRESPECT: Disrespectful behavior (rudeness, back-talk, defiance)
   - TARDINESS: Late arrival or leaving early
   - INCOMPLETE_WORK: Not completing assignments or homework
   - OTHER: Other negative behaviors

2. POSITIVE BEHAVIORS:
   - POSITIVE: General positive recognition, excellent work
   - PARTICIPATION: Good participation, answering questions, engaging

CRITICAL INSTRUCTIONS:

1. ONLY extract statements where the teacher is DIRECTLY addressing a student about their behavior
2. The student's name MUST be explicitly mentioned or clearly implied
3. IGNORE general classroom instructions (e.g., "Everyone open your books")
4. IGNORE academic content delivery (e.g., "The mitochondria is the powerhouse...")
5. Focus on BEHAVIORAL statements, not academic performance alone
6. If no behavior statements are found, return an empty array []

OUTPUT FORMAT (JSON Array):
Return ONLY a valid JSON array. Each detected behavior event must have:

[
  {{
    "student_name": "string (extracted student name)",
    "behavior_type": "DISTURBANCE|DISRESPECT|TARDINESS|INCOMPLETE_WORK|POSITIVE|PARTICIPATION|OTHER",
    "severity": "LOW|MEDIUM|HIGH",
    "description": "string (neutral, factual 1-2 sentence summary)",
    "original_statement": "string (exact quote from transcript)",
    "is_positive": boolean,
    "confidence": "LOW|MEDIUM|HIGH (how confident the AI is about this detection)"
  }}
]

SEVERITY GUIDELINES:
- LOW: Minor issues, first-time occurrences, positive behaviors
- MEDIUM: Repeated minor issues, moderately disruptive
- HIGH: Serious disruptions, safety concerns, repeated severe issues

DESCRIPTION GUIDELINES:
- Use neutral, factual language
- No judgmental or emotional terms
- 1-2 sentences maximum
- Student-appropriate language
- Focus on observable behavior, not character judgments

EXAMPLES:

Input: "Kiran, you are disturbing the class. Please stop talking."
Output:
[{{
  "student_name": "Kiran",
  "behavior_type": "DISTURBANCE",
  "severity": "MEDIUM",
  "description": "Student was disrupting classroom activities by talking.",
  "original_statement": "Kiran, you are disturbing the class. Please stop talking.",
  "is_positive": false,
  "confidence": "HIGH"
}}]

Input: "Sarah, excellent work on your presentation today!"
Output:
[{{
  "student_name": "Sarah",
  "behavior_type": "POSITIVE",
  "severity": "LOW",
  "description": "Student delivered an excellent presentation.",
  "original_statement": "Sarah, excellent work on your presentation today!",
  "is_positive": true,
  "confidence": "HIGH"
}}]

Input: "Now, let's discuss photosynthesis. Open your textbooks to page 45."
Output:
[]

Input: "Today we will learn about algebraic equations. The first step is to isolate the variable."
Output:
[]

LECTURE TRANSCRIPT:
{lecture_text}

Analyze the transcript and extract ALL behavior-related statements. Return ONLY the JSON array, no additional text or markdown formatting."""
        
        return prompt
    
    def _get_sensitivity_instructions(self, sensitivity: str) -> str:
        """
        Get sensitivity-specific instructions for behavior detection
        
        Args:
            sensitivity: Detection sensitivity level
        
        Returns:
            str: Sensitivity-specific instructions
        """
        instructions = {
            'LOW': """
SENSITIVITY: LOW (Conservative Detection)

Only detect EXPLICIT, CLEAR behavior statements:
- Student name must be directly stated
- Behavior must be explicitly described
- No ambiguous or implied situations
- Err on the side of NOT detecting
- Require high confidence before flagging

This mode minimizes false positives. Use when you want only the most obvious behavior events.
""",

            'MEDIUM': """
SENSITIVITY: MEDIUM (Balanced Detection) - RECOMMENDED

Detect clear behavior statements:
- Student name stated or strongly implied
- Behavior clearly indicated
- Include both direct and reasonably implied statements
- Balanced approach between false positives and false negatives
- Moderate confidence threshold

This is the recommended mode for most classrooms. Provides good balance between catching important events and avoiding false alarms.
""",

            'HIGH': """
SENSITIVITY: HIGH (Comprehensive Detection)

Detect all potential behavior-related statements:
- Student name stated, implied, or contextually understood
- Any indication of behavioral concern or praise
- Include subtle or indirect statements
- Capture more events for teacher review
- Lower confidence threshold

This mode may have more false positives but captures more events. All detections still require teacher approval before any action is taken.
"""
        }
        
        return instructions.get(sensitivity, instructions['MEDIUM'])
