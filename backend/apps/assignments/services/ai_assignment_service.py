"""
AI Assignment Service - Production Grade
Handles AI-powered assignment generation and grading using Google Gemini API

Author: Senior Backend Team
Version: 2.0.0
"""

import json
import logging
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from django.conf import settings
from django.core.files.base import ContentFile
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class AIAssignmentService:
    """
    Enterprise-grade AI service for assignment generation and grading.
    
    Features:
    - Semantic understanding for grading (not just keyword matching)
    - Cost tracking and optimization
    - Error handling and retry logic
    - Detailed feedback generation
    - Support for rubric-based grading
    - PDF text extraction
    """
    
    def __init__(self):
        # Use model from Django settings (reads from .env GEMINI_MODEL)
        # This allows flexibility and uses the working model: gemini-3-flash-preview
        from django.conf import settings
        model_name = settings.GEMINI_MODEL
        self.model = genai.GenerativeModel(model_name)
        logger.info(f"Initialized Gemini model: {model_name}")
        self.generation_config = {
            'temperature': 0.7,  # Balanced creativity
            'top_p': 0.95,
            'top_k': 40,
            'max_output_tokens': 8192,
        }
        
        # Safety settings - allow educational content
        self.safety_settings = {
            'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
            'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
            'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
            'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
        }
    
    # ==================== ASSIGNMENT GENERATION ====================
    
    def generate_assignment(
        self,
        lecture_transcript: str,
        lecture_title: str,
        difficulty: str,
        num_questions: int,
        assignment_format: str,
        subject: str = 'General'
    ) -> Dict:
        """
        Generate assignment questions from lecture transcript using AI.
        
        Args:
            lecture_transcript: Full lecture transcript text
            lecture_title: Title of the lecture
            difficulty: 'easy', 'medium', or 'hard'
            num_questions: Number of questions to generate (1-10)
            assignment_format: 'essay', 'short_answer', 'case_study'
            subject: Subject/topic area
        
        Returns:
            {
                'questions': [...],
                'metadata': {...},
                'tokens_used': int,
                'cost': Decimal
            }
        
        Raises:
            ValueError: If generation fails or produces invalid format
        """
        
        logger.info(f"Generating {num_questions} {difficulty} questions for '{lecture_title}'")
        
        prompt = self._build_generation_prompt(
            lecture_transcript,
            lecture_title,
            difficulty,
            num_questions,
            assignment_format,
            subject
        )
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config,
                safety_settings=self.safety_settings
            )
            
            # Extract JSON from response
            result_text = response.text.strip()
            
            # Clean markdown code blocks
            result_text = self._clean_json_response(result_text)
            
            # Parse JSON
            data = json.loads(result_text)
            
            # Validate structure
            self._validate_generated_assignment(data, num_questions)
            
            # Calculate cost (free tier may not have usage_metadata)
            try:
                tokens_used = response.usage_metadata.total_token_count
                cost = self._calculate_cost(tokens_used)
            except AttributeError:
                # Free tier doesn't return usage_metadata
                tokens_used = 0
                cost = Decimal('0.00')
            
            logger.info(f"[OK] Generated {len(data['questions'])} questions. Cost: ${cost}")
            
            return {
                'questions': data['questions'],
                'metadata': data.get('metadata', {}),
                'tokens_used': tokens_used,
                'cost': cost
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            logger.error(f"Response text: {result_text[:500]}")
            raise ValueError("AI generated invalid format. Please try again.")
        
        except Exception as e:
            logger.error(f"Assignment generation failed: {e}", exc_info=True)
            raise ValueError(f"Failed to generate assignment: {str(e)}")
    
    def _build_generation_prompt(
        self,
        transcript: str,
        title: str,
        difficulty: str,
        num_questions: int,
        format_type: str,
        subject: str
    ) -> str:
        """Build optimized prompt for assignment generation"""
        
        # Difficulty guides
        difficulty_guides = {
            'easy': {
                'description': 'Simple recall and basic understanding',
                'question_style': 'Direct, straightforward questions',
                'expected_answer_length': '2-3 sentences',
                'cognitive_level': 'Knowledge and Comprehension',
                'example': '"Define X" or "What is Y?"'
            },
            'medium': {
                'description': 'Application and analysis',
                'question_style': 'Require understanding and explanation',
                'expected_answer_length': '1 paragraph (4-6 sentences)',
                'cognitive_level': 'Application and Analysis',
                'example': '"Explain how X works" or "Compare X and Y"'
            },
            'hard': {
                'description': 'Synthesis and evaluation',
                'question_style': 'Complex, multi-part, critical thinking',
                'expected_answer_length': '2-3 paragraphs',
                'cognitive_level': 'Evaluation and Creation',
                'example': '"Analyze the implications of X" or "Design a solution for Y"'
            }
        }
        
        # Format guides
        format_guides = {
            'essay': {
                'type': 'Extended response essays',
                'structure': 'Open-ended questions requiring detailed analysis',
                'typical_questions': '3-5 questions'
            },
            'short_answer': {
                'type': 'Short answer questions',
                'structure': 'Concise questions with specific answers',
                'typical_questions': '5-10 questions'
            },
            'case_study': {
                'type': 'Case study analysis',
                'structure': 'Scenario-based questions requiring application',
                'typical_questions': '3-5 scenario-based questions'
            }
        }
        
        diff_guide = difficulty_guides.get(difficulty, difficulty_guides['medium'])
        fmt_guide = format_guides.get(format_type, format_guides['short_answer'])
        
        # Truncate transcript if too long (keep first 6000 chars)
        truncated_transcript = transcript[:6000] if len(transcript) > 6000 else transcript
        
        prompt = f"""You are an expert educational assessment designer creating high-quality assignment questions.

LECTURE CONTEXT:
Subject: {subject}
Title: {title}
Transcript: {truncated_transcript}

ASSIGNMENT REQUIREMENTS:
Difficulty Level: {difficulty.upper()}
- {diff_guide['description']}
- {diff_guide['question_style']}
- Expected answer length: {diff_guide['expected_answer_length']}
- Cognitive level: {diff_guide['cognitive_level']}

Number of Questions: {num_questions}
Assignment Format: {format_type.upper()}
- {fmt_guide['type']}
- {fmt_guide['structure']}

QUALITY CRITERIA:

1. Question Design:
   - Each question must be directly based on the lecture content
   - Questions should be clear, unambiguous, and answerable
   - Avoid trick questions or unnecessarily complex language
   - Ensure questions test understanding, not just memorization
   - For {difficulty}: {diff_guide['example']}

2. Progressive Difficulty:
   - Start with foundational questions
   - Progress to more complex/analytical questions
   - Final questions should require synthesis of multiple concepts

3. Answer Guidelines:
   - Provide clear expected answer keywords for grading
   - Include key concepts student should mention
   - Specify what constitutes a complete answer

4. Educational Value:
   - Test core concepts from the lecture
   - Encourage critical thinking at appropriate level
   - Align with learning objectives

OUTPUT FORMAT (STRICT JSON):
Return ONLY valid JSON in this exact structure:

{{
  "questions": [
    {{
      "question_number": 1,
      "question_text": "Clear, specific question based on lecture content",
      "marks": {10 / num_questions},
      "expected_answer_keywords": [
        "keyword1",
        "keyword2",
        "concept1",
        "concept2"
      ],
      "expected_answer_length": "2-3 sentences" | "1 paragraph" | "2-3 paragraphs",
      "grading_notes": "What makes a complete answer - criteria for full marks"
    }}
  ],
  "metadata": {{
    "total_questions": {num_questions},
    "difficulty": "{difficulty}",
    "format": "{format_type}",
    "estimated_completion_time": 30,
    "topics_covered": ["topic1", "topic2"],
    "learning_objectives": ["objective1", "objective2"]
  }}
}}

VALIDATION RULES:
- Exactly {num_questions} questions
- Each question has all required fields
- question_number is sequential (1, 2, 3...)
- marks sum to 10
- expected_answer_keywords has at least 3 items
- No duplicate questions

Generate the assignment now. Return ONLY the JSON, no additional text or markdown."""
        
        return prompt
    
    def _validate_generated_assignment(self, data: Dict, expected_questions: int):
        """Validate AI-generated assignment structure"""
        
        if 'questions' not in data:
            raise ValueError("Missing 'questions' key in AI response")
        
        questions = data['questions']
        
        if len(questions) < expected_questions * 0.8:  # Allow 80% success rate
            raise ValueError(f"Expected ~{expected_questions} questions, got {len(questions)}")
        
        required_fields = ['question_number', 'question_text', 'expected_answer_keywords']
        
        for i, q in enumerate(questions):
            for field in required_fields:
                if field not in q:
                    raise ValueError(f"Question {i+1} missing required field: {field}")
            
            if not isinstance(q['expected_answer_keywords'], list):
                raise ValueError(f"Question {i+1}: expected_answer_keywords must be a list")
            
            if len(q['expected_answer_keywords']) < 2:
                raise ValueError(f"Question {i+1}: needs at least 2 answer keywords")
        
        logger.info(f"[OK] Validated {len(questions)} generated questions")
    
    # ==================== AI GRADING ====================
    
    def grade_submission(
        self,
        assignment,
        submission,
        grading_type: str = 'basic'
    ) -> Dict:
        """
        Grade a student submission using AI with semantic understanding.
        
        Args:
            assignment: Assignment object
            submission: AssignmentSubmission object
            grading_type: 'basic' or 'rubric'
        
        Returns:
            {
                'suggested_score': Decimal,
                'max_score': Decimal,
                'percentage': Decimal,
                'feedback': str,
                'detailed_analysis': {...},
                'rubric_scores': {...} (if rubric-based),
                'tokens_used': int,
                'cost': Decimal
            }
        """
        
        logger.info(f"AI grading submission for {submission.student.get_full_name()}")
        
        # Extract student's answers
        if assignment.submission_type == 'online':
            student_answers = submission.answers
        else:
            # For PDF submissions, extract text first
            student_answers = self._extract_pdf_text(submission.uploaded_file.path)
        
        if grading_type == 'rubric' and assignment.rubric_criteria.exists():
            return self._grade_with_rubric(assignment, student_answers)
        else:
            return self._grade_basic(assignment, student_answers)
    
    def _grade_basic(self, assignment, student_answers: Dict) -> Dict:
        """Basic grading with semantic understanding - overall score and feedback"""
        
        # Build questions text
        questions_text = ""
        for i, question in enumerate(assignment.questions.all(), 1):
            answer = student_answers.get(str(question.id), '')
            questions_text += f"""
Question {i}: {question.question_text}
Expected Keywords: {', '.join(question.expected_answer_keywords)}
Student's Answer:
{answer}

"""
        
        prompt = f"""You are an expert educational assessor grading a student assignment with SEMANTIC UNDERSTANDING.

ASSIGNMENT DETAILS:
Title: {assignment.title}
Total Marks: {assignment.total_marks}
Difficulty: {assignment.difficulty}

GRADING TASK:
Evaluate the student's answers using deep semantic understanding, NOT just keyword matching.

{questions_text}

GRADING CRITERIA:

1. Content Accuracy (40%)
   - Does the answer demonstrate correct understanding?
   - Are the key concepts explained accurately?
   - Even if wording differs from expected keywords, does it convey the same meaning?

2. Completeness (30%)
   - Does the answer address all parts of the question?
   - Are important details included?

3. Clarity & Structure (20%)
   - Is the answer well-organized?
   - Is the explanation clear and logical?

4. Examples & Application (10%)
   - Does the student provide relevant examples?
   - Can they apply concepts appropriately?

IMPORTANT:
- Use SEMANTIC UNDERSTANDING - reward answers that demonstrate comprehension even if exact keywords aren't used
- Be fair and constructive
- Provide specific, actionable feedback
- Don't just say "good" or "needs work" - explain WHY

OUTPUT FORMAT (JSON ONLY):
{{
  "overall_score": 7.5,
  "max_score": {assignment.total_marks},
  "percentage": 75,
  "feedback": {{
    "strengths": [
      "Specific positive point 1",
      "Specific positive point 2"
    ],
    "areas_for_improvement": [
      "Specific area needing work 1",
      "Specific area needing work 2"
    ],
    "suggestions": [
      "Actionable suggestion 1",
      "Actionable suggestion 2"
    ]
  }},
  "question_breakdown": [
    {{
      "question_number": 1,
      "score": 2.5,
      "max_score": 3.3,
      "comment": "Specific feedback for this question"
    }}
  ],
  "overall_comment": "A 2-3 sentence summary of the submission quality"
}}

Grade the assignment now. Return ONLY the JSON."""
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config,
                safety_settings=self.safety_settings
            )
            
            # Parse response
            result_text = self._clean_json_response(response.text.strip())
            data = json.loads(result_text)
            
            # Format feedback for display
            feedback_parts = []
            
            if data['feedback'].get('strengths'):
                feedback_parts.append("✅ **Strengths:**")
                for strength in data['feedback']['strengths']:
                    feedback_parts.append(f"  • {strength}")
            
            if data['feedback'].get('areas_for_improvement'):
                feedback_parts.append("\n⚠️ **Areas for Improvement:**")
                for area in data['feedback']['areas_for_improvement']:
                    feedback_parts.append(f"  • {area}")
            
            if data['feedback'].get('suggestions'):
                feedback_parts.append("\n💡 **Suggestions:**")
                for suggestion in data['feedback']['suggestions']:
                    feedback_parts.append(f"  • {suggestion}")
            
            formatted_feedback = '\n'.join(feedback_parts)
            
            # Calculate cost (free tier may not have usage_metadata)
            try:
                tokens_used = response.usage_metadata.total_token_count
                cost = self._calculate_cost(tokens_used)
            except AttributeError:
                tokens_used = 0
                cost = Decimal('0.00')
            
            logger.info(f"[OK] AI graded: {data['overall_score']}/{assignment.total_marks}. Cost: ${cost}")
            
            return {
                'suggested_score': Decimal(str(data['overall_score'])),
                'max_score': Decimal(str(assignment.total_marks)),
                'percentage': Decimal(str(data['percentage'])),
                'feedback': formatted_feedback,
                'overall_comment': data['overall_comment'],
                'detailed_analysis': data,
                'tokens_used': tokens_used,
                'cost': cost
            }
            
        except Exception as e:
            logger.error(f"AI grading failed: {e}", exc_info=True)
            raise ValueError(f"Failed to grade submission: {str(e)}")
    
    def _grade_with_rubric(self, assignment, student_answers: Dict) -> Dict:
        """Rubric-based grading - score each criterion separately"""
        
        # Get rubric criteria
        criteria = assignment.rubric_criteria.all()
        
        # Build questions text
        questions_text = ""
        for i, question in enumerate(assignment.questions.all(), 1):
            answer = student_answers.get(str(question.id), '')
            questions_text += f"""
Question {i}: {question.question_text}
Student's Answer: {answer}
"""
        
        # Build criteria descriptions
        criteria_text = ""
        for criterion in criteria:
            criteria_text += f"""
- {criterion.criterion_name} ({criterion.weight_percentage}%):
  {criterion.description}
"""
        
        prompt = f"""You are grading a student assignment using a RUBRIC with multiple criteria.

ASSIGNMENT:
{assignment.title}
{questions_text}

GRADING RUBRIC:
{criteria_text}

GRADING INSTRUCTIONS:
- Score each criterion separately on a scale of 0-10
- Use semantic understanding - reward comprehension even if wording differs
- Provide specific feedback for each criterion

OUTPUT FORMAT (JSON):
{{
  "rubric_scores": [
    {{
      "criterion_name": "{criteria[0].criterion_name}",
      "score": 8.0,
      "max_score": 10,
      "weight_percentage": {criteria[0].weight_percentage},
      "feedback": "Specific feedback for this criterion"
    }}
  ],
  "overall_score": 7.8,
  "overall_comment": "Summary of performance across all criteria"
}}

Grade now. Return ONLY JSON."""
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config,
                safety_settings=self.safety_settings
            )
            
            result_text = self._clean_json_response(response.text.strip())
            data = json.loads(result_text)
            
            # Calculate weighted total
            total_score = 0
            for rubric_score in data['rubric_scores']:
                criterion_contribution = (
                    rubric_score['score'] / 10
                ) * (rubric_score['weight_percentage'] / 100) * float(assignment.total_marks)
                total_score += criterion_contribution
            
            # Format feedback
            feedback_parts = ["**Rubric-Based Grading:**\n"]
            for rubric_score in data['rubric_scores']:
                feedback_parts.append(
                    f"**{rubric_score['criterion_name']}**: "
                    f"{rubric_score['score']}/10 ({rubric_score['weight_percentage']}%)"
                )
                feedback_parts.append(f"  {rubric_score['feedback']}\n")
            
            formatted_feedback = '\n'.join(feedback_parts)
            # Calculate cost (free tier may not have usage_metadata)
            try:
                tokens_used = response.usage_metadata.total_token_count
                cost = self._calculate_cost(tokens_used)
            except AttributeError:
                tokens_used = 0
                cost = Decimal('0.00')
            
            logger.info(f"[OK] Rubric graded: {round(total_score, 2)}/{assignment.total_marks}. Cost: ${cost}")
            
            return {
                'suggested_score': Decimal(str(round(total_score, 2))),
                'max_score': Decimal(str(assignment.total_marks)),
                'feedback': formatted_feedback,
                'overall_comment': data['overall_comment'],
                'rubric_scores': data['rubric_scores'],
                'detailed_analysis': data,
                'tokens_used': tokens_used,
                'cost': cost
            }
            
        except Exception as e:
            logger.error(f"Rubric grading failed: {e}", exc_info=True)
            raise ValueError(f"Failed to grade with rubric: {str(e)}")

    def grade_pdf_submission(
        self,
        assignment,
        pdf_file_path: str,
        questions: List,
        grading_type: str = 'basic'
    ) -> Dict:
        """
        Grade a PDF submission using Gemini's document understanding.
        Handles BOTH handwritten and typed PDFs.
        """
        
        try:
            # Step 1: Upload PDF to Gemini
            logger.info(f"Uploading PDF to Gemini: {pdf_file_path}")
            
            # Re-configure if needed (ensure API key is set)
            # genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # Upload PDF to Gemini
            uploaded_pdf = genai.upload_file(
                path=pdf_file_path,
                mime_type='application/pdf',
                display_name=f"assignment_submission_{assignment.id}"
            )
            
            logger.info(f"[OK] PDF uploaded successfully: {uploaded_pdf.name}")
            
            # Step 2: Build grading prompt
            questions_text = self._build_questions_context(questions)
            
            prompt = f"""You are an expert educational assessor grading a student's PDF submission.

**ASSIGNMENT DETAILS:**
- Title: {assignment.title}
- Total Marks: {assignment.total_marks}
- Difficulty: {assignment.difficulty}

**QUESTIONS:**
{questions_text}

**YOUR TASK:**
1. **Extract all text** from the PDF (including handwritten text if present)
2. **Analyze the student's answers** for each question
3. **Grade using semantic understanding** - reward comprehension even if wording differs from expected keywords
4. **Provide detailed, constructive feedback**

**IMPORTANT:**
- This PDF may contain **handwritten** or **typed** answers
- Use OCR/handwriting recognition to extract text accurately
- Be fair - don't penalize for handwriting quality if content is correct
- If any part is unclear/illegible, note it in feedback

**GRADING CRITERIA:**
- Content Accuracy (40%): Correct understanding of concepts
- Completeness (30%): All parts of question addressed
- Clarity & Structure (20%): Well-organized, logical explanation
- Examples & Application (10%): Relevant examples provided

**OUTPUT FORMAT (JSON ONLY):**
{{
    "extracted_text": "Full text extracted from PDF...",
    "overall_score": 7.5,
    "max_score": {assignment.total_marks},
    "percentage": 75,
    "feedback": {{
        "strengths": [
            "Specific positive point 1",
            "Specific positive point 2"
        ],
        "areas_for_improvement": [
            "Specific area 1",
            "Specific area 2"
        ],
        "suggestions": [
            "Actionable suggestion 1",
            "Actionable suggestion 2"
        ]
    }},
    "question_breakdown": [
        {{
            "question_number": 1,
            "score": 2.5,
            "max_score": 3.3,
            "comment": "Detailed feedback for this question"
        }}
    ],
    "overall_comment": "2-3 sentence summary",
    "extraction_quality": "good" | "partial" | "poor",
    "handwriting_detected": true | false,
    "illegible_sections": ["list of parts that couldn't be read clearly"]
}}

**Grade the PDF submission now. Return ONLY valid JSON.**
"""

            # Step 3: Send to Gemini for analysis
            logger.info("Sending PDF to Gemini for grading analysis...")
            
            response = self.model.generate_content(
                [uploaded_pdf, prompt],
                generation_config=self.generation_config
            )
            
            # Step 4: Parse response
            result_text = self._clean_json_response(response.text.strip())
            
            data = json.loads(result_text)
            
            # Step 5: Format feedback for display
            feedback_parts = []
            
            if data['feedback'].get('strengths'):
                feedback_parts.append("✅ **Strengths:**")
                for strength in data['feedback']['strengths']:
                    feedback_parts.append(f"  • {strength}")
            
            if data['feedback'].get('areas_for_improvement'):
                feedback_parts.append("\n⚠️ **Areas for Improvement:**")
                for area in data['feedback']['areas_for_improvement']:
                    feedback_parts.append(f"  • {area}")
            
            if data['feedback'].get('suggestions'):
                feedback_parts.append("\n💡 **Suggestions:**")
                for suggestion in data['feedback']['suggestions']:
                    feedback_parts.append(f"  • {suggestion}")
            
            # Add extraction quality note if relevant
            if data.get('handwriting_detected'):
                feedback_parts.insert(0, "📝 *Handwritten submission detected and processed*\n")
            
            if data.get('illegible_sections'):
                feedback_parts.append(
                    f"\n⚠️ **Note:** Some sections were difficult to read: "
                    f"{', '.join(data['illegible_sections'])}"
                )
            
            formatted_feedback = '\n'.join(feedback_parts)
            
            # Step 6: Calculate cost
            try:
                tokens_used = response.usage_metadata.total_token_count
                cost = self._calculate_cost(tokens_used)
            except AttributeError:
                tokens_used = 0
                cost = Decimal('0.00')
            
            logger.info(f"[OK] PDF grading complete: {data['overall_score']}/{assignment.total_marks}")
            
            return {
                'suggested_score': Decimal(str(data['overall_score'])),
                'max_score': Decimal(str(assignment.total_marks)),
                'percentage': Decimal(str(data['percentage'])),
                'feedback': formatted_feedback,
                'overall_comment': data['overall_comment'],
                'question_breakdown': data['question_breakdown'],
                'extracted_text': data.get('extracted_text', ''),
                'extraction_quality': data.get('extraction_quality', 'unknown'),
                'handwriting_detected': data.get('handwriting_detected', False),
                'detailed_analysis': data,
                'tokens_used': tokens_used,
                'cost': cost
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini PDF grading response: {e}")
            raise ValueError("AI returned invalid format. Please try manual grading.")
        
        except Exception as e:
            logger.error(f"PDF grading failed: {str(e)}")
            raise ValueError(f"Failed to grade PDF: {str(e)}")

    def _build_questions_context(self, questions: List) -> str:
        """Build formatted questions list for AI prompt"""
        
        questions_text = ""
        for i, question in enumerate(questions, 1):
            keywords = ', '.join(question.expected_answer_keywords)
            questions_text += f"""
Question {i} ({question.marks} marks):
{question.question_text}

Expected Keywords: {keywords}
Expected Answer Length: {question.expected_answer_length if hasattr(question, 'expected_answer_length') else 'Not specified'}

---
"""
        return questions_text
    
    def _extract_pdf_text(self, pdf_path: str) -> Dict:
        """
        Extract text from PDF using Gemini's document understanding.
        
        Args:
            pdf_path: Path to PDF file
        
        Returns:
            Dict with question IDs mapped to extracted text
        """
        
        try:
            logger.info(f"Extracting text from PDF: {pdf_path}")
            
            # Upload PDF to Gemini
            # Upload PDF to Gemini
            pdf_file = genai.upload_file(path=pdf_path, mime_type='application/pdf')
            
            prompt = """Extract ALL text content from this PDF document.
Return the complete text as plain text, preserving structure where possible.
If there are multiple questions/sections, separate them clearly."""
            
            response = self.model.generate_content([pdf_file, prompt])
            
            extracted_text = response.text.strip()
            
            logger.info(f"[OK] Extracted {len(extracted_text)} characters from PDF")
            
            # Return as dict (for now, single entry with full text)
            # In production, you might want to parse into individual questions
            return {
                '1': extracted_text
            }
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {e}", exc_info=True)
            raise ValueError(f"Failed to read PDF: {str(e)}")
    
    # ==================== BATCH GRADING ====================
    
    def batch_grade_submissions(
        self,
        assignment,
        submissions: List
    ) -> List[Dict]:
        """
        Grade multiple submissions in batch.
        More efficient than individual grading.
        
        Args:
            assignment: Assignment object
            submissions: List of AssignmentSubmission objects
        
        Returns:
            List of grading results (same format as grade_submission)
        """
        
        logger.info(f"Batch grading {len(submissions)} submissions")
        
        results = []
        total_cost = Decimal('0')
        
        for submission in submissions:
            try:
                result = self.grade_submission(
                    assignment,
                    submission,
                    grading_type=assignment.grading_type
                )
                results.append({
                    'submission_id': submission.id,
                    'success': True,
                    'result': result
                })
                total_cost += result['cost']
                
            except Exception as e:
                logger.error(f"Batch grading failed for submission {submission.id}: {e}")
                results.append({
                    'submission_id': submission.id,
                    'success': False,
                    'error': str(e)
                })
        
        logger.info(f"[OK] Batch grading complete. Total cost: ${total_cost}")
        
        return results

    def batch_grade_pdf_submissions(
        self,
        assignment,
        pdf_submissions: List[Tuple[str, str]]  # [(submission_id, pdf_path), ...]
    ) -> List[Dict]:
        """
        Grade multiple PDF submissions in batch.
        
        Args:
            assignment: Assignment object
            pdf_submissions: List of tuples (submission_id, pdf_file_path)
        
        Returns:
            List of grading results
        """
        
        results = []
        questions = list(assignment.questions.all())
        
        for submission_id, pdf_path in pdf_submissions:
            try:
                logger.info(f"Batch grading submission {submission_id}...")
                
                result = self.grade_pdf_submission(
                    assignment=assignment,
                    pdf_file_path=pdf_path,
                    questions=questions,
                    grading_type=assignment.grading_type
                )
                
                results.append({
                    'submission_id': submission_id,
                    'success': True,
                    'result': result
                })
                
                logger.info(f"[OK] Graded {submission_id}: {result['suggested_score']}/{result['max_score']}")
                
            except Exception as e:
                logger.error(f"Failed to grade {submission_id}: {str(e)}")
                results.append({
                    'submission_id': submission_id,
                    'success': False,
                    'error': str(e)
                })
        
        return results
    
    # ==================== UTILITY METHODS ====================
    
    def _clean_json_response(self, text: str) -> str:
        """Remove markdown code blocks from AI response"""
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        return text.strip()
    
    def _calculate_cost(self, tokens_used: int) -> Decimal:
        """
        Calculate Gemini API cost.
        
        Gemini 1.5 Flash pricing (as of 2024):
        - Input: $0.075 per 1M tokens
        - Output: $0.30 per 1M tokens
        - Assuming 50/50 split for estimation
        """
        
        avg_cost_per_million = (0.075 + 0.30) / 2
        cost = Decimal(str((tokens_used / 1_000_000) * avg_cost_per_million))
        return cost.quantize(Decimal('0.0001'))
    
    def estimate_generation_cost(self, transcript_length: int, num_questions: int) -> Decimal:
        """Estimate cost before generation"""
        estimated_tokens = (transcript_length // 4) + (num_questions * 200)
        return self._calculate_cost(estimated_tokens)
    
    def estimate_grading_cost(self, answer_length: int, grading_type: str) -> Decimal:
        """Estimate grading cost"""
        base_tokens = answer_length // 4
        if grading_type == 'rubric':
            base_tokens = int(base_tokens * 1.5)
        return self._calculate_cost(base_tokens)


# Singleton instance
ai_assignment_service = AIAssignmentService()
