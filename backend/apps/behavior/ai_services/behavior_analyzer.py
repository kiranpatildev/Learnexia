"""
AI Behavior Analyzer Service using Google Gemini

Analyzes lecture transcripts to detect student behavioral mentions
and generates structured behavior reports for teacher review.
"""

import logging
import json
import re
from typing import Dict, List
from django.core.exceptions import ValidationError

from apps.notes.ai_services.gemini_config import GeminiConfig

logger = logging.getLogger(__name__)


class BehaviorAnalyzerService:
    """Service for analyzing lecture transcripts for behavioral mentions"""
    
    def __init__(self):
        """Initialize the behavior analyzer service"""
        gemini = GeminiConfig()
        self.client = gemini.get_client()
        self.model_name = GeminiConfig.MODEL_NAME
    
    def analyze_lecture_behavior(self, lecture) -> Dict:
        """
        Analyze lecture transcript for behavioral mentions
        
        Args:
            lecture: Lecture object with transcript
        
        Returns:
            Dict with success status and detected behaviors:
            {
                'success': True,
                'detections': [
                    {
                        'student_name': 'Kiran',
                        'behavior_type': 'disruption',
                        'severity': 'minor',
                        'description': 'Student was talking during lecture',
                        'original_statement': 'Kiran, please stop talking',
                        'is_positive': False,
                        'confidence': 'HIGH',
                        'confidence_score': 95.0
                    }
                ],
                'count': 1
            }
        """
        try:
            # Validate
            if not lecture or not lecture.transcript:
                return {
                    'success': False,
                    'error': 'Lecture has no transcript',
                    'detections': [],
                    'count': 0
                }
            
            # Build prompt
            prompt = self._build_behavior_analysis_prompt(lecture.transcript)
            
            logger.info(f"[GEMINI] Sending prompt to Gemini (length: {len(prompt)} chars)")
            
            # Call Gemini
            generation_config = {
                'temperature': 0.3,  # Lower temperature for more factual extraction
                'top_p': 0.95,
                'max_output_tokens': 8192,
            }
            
            try:
                logger.info(f"[GEMINI] Calling Gemini API with model: {self.model_name}")
                
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=generation_config
                )
                
                logger.info(f"[GEMINI] Received response from Gemini")
                logger.info(f"[GEMINI] Response type: {type(response)}")
                logger.info(f"[GEMINI] Has text: {hasattr(response, 'text')}")
                
                if hasattr(response, 'text'):
                    logger.info(f"[GEMINI] Response text length: {len(response.text) if response.text else 0}")
                    logger.info(f"[GEMINI] Response text preview: {response.text[:200] if response.text else 'EMPTY'}")
                
            except Exception as api_error:
                logger.error(f"[GEMINI ERROR] Gemini API call failed: {str(api_error)}", exc_info=True)
                return {
                    'success': False,
                    'error': f'Gemini API error: {str(api_error)}',
                    'detections': [],
                    'count': 0
                }
            
            if not response or not response.text:
                logger.error("[GEMINI ERROR] Empty response from Gemini AI")
                return {
                    'success': False,
                    'error': 'Empty response from AI',
                    'detections': [],
                    'count': 0
                }
            
            # Parse JSON response
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
            behavior_data = json.loads(content)
            
            # Extract detections
            if isinstance(behavior_data, dict) and 'detections' in behavior_data:
                detections = behavior_data['detections']
            elif isinstance(behavior_data, list):
                detections = behavior_data
            else:
                detections = [behavior_data] if behavior_data else []
            
            logger.info(f"✅ Analyzed lecture {lecture.id}: {len(detections)} behavioral mentions detected")
            
            return {
                'success': True,
                'detections': detections,
                'count': len(detections),
                'lecture_id': lecture.id,
                'lecture_title': lecture.title
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {str(e)}")
            logger.error(f"Content: {content[:500] if 'content' in locals() else 'N/A'}")
            return {
                'success': False,
                'error': f'Failed to parse behavior analysis: {str(e)}',
                'detections': [],
                'count': 0
            }
        except Exception as e:
            logger.error(f"Behavior analysis error: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'detections': [],
                'count': 0
            }
    
    def _build_behavior_analysis_prompt(self, transcript: str) -> str:
        """
        Build the AI prompt for behavior analysis
        
        Args:
            transcript: Lecture transcript text
        
        Returns:
            str: Complete prompt for Gemini
        """
        prompt = f"""You are an expert educational behavior analyst. Analyze this lecture transcript to identify ANY mentions of student behavior - both positive and negative.

IMPORTANT INSTRUCTIONS:
1. Extract ONLY explicit behavioral mentions where a teacher addresses or mentions a student
2. Include BOTH positive behaviors (praise, good work) AND negative behaviors (disruptions, issues)
3. Extract the EXACT student name as mentioned (first name, last name, or full name)
4. Provide the EXACT quote from the transcript
5. Generate a neutral, professional description
6. Assess severity and confidence

BEHAVIOR TYPES:
- disruption: Talking, making noise, disturbing class
- disrespect: Rude behavior, talking back
- tardiness: Late to class
- incomplete_work: Not completing assignments
- participation: Active participation (POSITIVE)
- excellence: Outstanding work or behavior (POSITIVE)
- helping: Helping others (POSITIVE)
- other: Other behaviors

SEVERITY LEVELS:
- minor: Small issues, first-time mentions
- moderate: Repeated issues or more serious
- serious: Significant disruptions
- critical: Severe behavioral problems

CONFIDENCE LEVELS:
- HIGH: Clear, unambiguous mention (90-100)
- MEDIUM: Likely a behavioral mention (70-89)
- LOW: Uncertain or ambiguous (50-69)

RETURN VALID JSON ONLY:

{{
  "detections": [
    {{
      "student_name": "Kiran",
      "behavior_type": "disruption",
      "severity": "minor",
      "description": "Student was talking during lecture",
      "original_statement": "Kiran, please stop talking",
      "is_positive": false,
      "confidence": "HIGH",
      "confidence_score": 95.0
    }},
    {{
      "student_name": "Priya",
      "behavior_type": "participation",
      "severity": "minor",
      "description": "Student answered question correctly",
      "original_statement": "Great answer, Priya!",
      "is_positive": true,
      "confidence": "HIGH",
      "confidence_score": 98.0
    }}
  ]
}}

CRITICAL RULES:
- If NO behavioral mentions found, return: {{"detections": []}}
- Do NOT invent or assume behaviors
- Only extract what is EXPLICITLY stated
- Include the exact quote from transcript
- Be conservative - when in doubt, mark as LOW confidence

LECTURE TRANSCRIPT:
{transcript[:5000]}

Analyze and return JSON:"""
        
        return prompt
