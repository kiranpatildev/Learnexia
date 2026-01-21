"""
Student Matching Utility for AI Behavior Detection

Matches student names extracted from transcripts to actual students
in the classroom, handling duplicates and name variations.
"""

import logging
from typing import List, Dict
from difflib import SequenceMatcher
from django.db.models import Q

logger = logging.getLogger(__name__)


class StudentMatcher:
    """Utility for matching student names to enrolled students"""
    
    SIMILARITY_THRESHOLD = 0.75  # 75% similarity required
    HIGH_CONFIDENCE_THRESHOLD = 0.90  # 90% for high confidence
    
    @staticmethod
    def match_students(classroom, student_names: List[str]) -> Dict:
        """
        Match student names to enrolled students in classroom
        
        Args:
            classroom: Classroom object
            student_names: List of student names from AI detection
        
        Returns:
            Dict with matching results:
            {
                'matches': [
                    {
                        'detected_name': 'Kiran',
                        'possible_students': [
                            {
                                'student': User object,
                                'similarity': 0.95,
                                'match_type': 'first_name',
                                'confidence': 'HIGH'
                            }
                        ],
                        'is_ambiguous': False,
                        'needs_review': False
                    }
                ],
                'total_detected': 3,
                'total_matched': 2,
                'unmatched': ['Unknown Name']
            }
        """
        from apps.schools.models import ClassroomEnrollment
        
        classroom_name = getattr(classroom, 'name', 'Unknown')
        logger.info(f"[STUDENT MATCHER] Matching students for classroom: {classroom_name}")
        logger.info(f"[STUDENT MATCHER] Detected names: {student_names}")
        
        try:
            # Get all enrolled students
            enrollments = ClassroomEnrollment.objects.filter(
                classroom=classroom,
                is_active=True
            ).select_related('student')
        
            enrolled_students = [enrollment.student for enrollment in enrollments]
            
            logger.info(f"[STUDENT MATCHER] Found {len(enrolled_students)} enrolled students")
            for student in enrolled_students:
                logger.info(f"[STUDENT MATCHER] - {student.get_full_name()} (ID: {student.id})")
            
            matches = []
            unmatched = []
            
            for detected_name in student_names:
                logger.info(f"[STUDENT MATCHER] Searching for: '{detected_name}'")
                
                possible_matches = StudentMatcher._find_matches(
                    detected_name,
                    enrolled_students
                )
                
                logger.info(f"[STUDENT MATCHER] Found {len(possible_matches)} matches for '{detected_name}'")
                
                if not possible_matches:
                    unmatched.append(detected_name)
                    matches.append({
                        'detected_name': detected_name,
                        'possible_students': [],
                        'is_ambiguous': False,
                        'needs_review': True,
                        'reason': 'No matching student found'
                    })
                else:
                    # Check for ambiguity
                    is_ambiguous = StudentMatcher._is_ambiguous(possible_matches)
                    
                    matches.append({
                        'detected_name': detected_name,
                        'possible_students': possible_matches,
                        'is_ambiguous': is_ambiguous,
                        'needs_review': is_ambiguous or len(possible_matches) > 1,
                        'best_match': possible_matches[0] if possible_matches else None
                    })
            
            return {
                'matches': matches,
                'total_detected': len(student_names),
                'total_matched': len([m for m in matches if m['possible_students']]),
                'unmatched': unmatched
            }
            
        except Exception as e:
            logger.error(f"[STUDENT MATCHER ERROR] {str(e)}", exc_info=True)
            # Return empty matches on error
            return {
                'matches': [{
                    'detected_name': name,
                    'possible_students': [],
                    'is_ambiguous': False,
                    'needs_review': True,
                    'reason': f'Error during matching: {str(e)}'
                } for name in student_names],
                'total_detected': len(student_names),
                'total_matched': 0,
                'unmatched': student_names
            }
    
    @staticmethod
    def _find_matches(detected_name: str, enrolled_students: List) -> List[Dict]:
        """
        Find possible student matches for a detected name
        
        Args:
            detected_name: Name extracted from transcript
            enrolled_students: List of enrolled User objects
        
        Returns:
            List of possible matches sorted by similarity
        """
        matches = []
        detected_lower = detected_name.lower().strip()
        
        for student in enrolled_students:
            # Get student name variations
            full_name = student.get_full_name().lower()
            first_name = student.first_name.lower()
            last_name = student.last_name.lower()
            
            # Calculate similarities
            similarities = {
                'full_name': SequenceMatcher(None, detected_lower, full_name).ratio(),
                'first_name': SequenceMatcher(None, detected_lower, first_name).ratio(),
                'last_name': SequenceMatcher(None, detected_lower, last_name).ratio(),
                'first_in_detected': first_name in detected_lower,
                'last_in_detected': last_name in detected_lower
            }
            
            # Determine best match type and score
            max_similarity = max(
                similarities['full_name'],
                similarities['first_name'],
                similarities['last_name']
            )
            
            # Boost score if name is contained
            if similarities['first_in_detected'] or similarities['last_in_detected']:
                max_similarity = max(max_similarity, 0.85)
            
            # Only include if above threshold
            if max_similarity >= StudentMatcher.SIMILARITY_THRESHOLD:
                match_type = 'full_name'
                if similarities['first_name'] == max_similarity:
                    match_type = 'first_name'
                elif similarities['last_name'] == max_similarity:
                    match_type = 'last_name'
                
                # Determine confidence
                if max_similarity >= StudentMatcher.HIGH_CONFIDENCE_THRESHOLD:
                    confidence = 'HIGH'
                elif max_similarity >= 0.85:
                    confidence = 'MEDIUM'
                else:
                    confidence = 'LOW'
                
                matches.append({
                    'student_id': str(student.id),
                    'student_name': student.get_full_name(),
                    'similarity': round(max_similarity, 2),
                    'match_type': match_type,
                    'confidence': confidence
                })
        
        # Sort by similarity (highest first)
        matches.sort(key=lambda x: x['similarity'], reverse=True)
        
        return matches
    
    @staticmethod
    def _is_ambiguous(matches: List[Dict]) -> bool:
        """
        Check if matches are ambiguous (multiple high-confidence matches)
        
        Args:
            matches: List of match dictionaries
        
        Returns:
            bool: True if ambiguous
        """
        if len(matches) <= 1:
            return False
        
        # Check if top 2 matches have similar scores
        if len(matches) >= 2:
            score_diff = matches[0]['similarity'] - matches[1]['similarity']
            # If difference is less than 0.1, it's ambiguous
            return score_diff < 0.10
        
        return False
    
    @staticmethod
    def get_student_by_id(student_id: str):
        """
        Get student by ID with error handling
        
        Args:
            student_id: UUID string
        
        Returns:
            User object or None
        """
        from apps.accounts.models import User
        
        try:
            return User.objects.get(id=student_id, role='student')
        except User.DoesNotExist:
            logger.error(f"Student not found: {student_id}")
            return None
        except Exception as e:
            logger.error(f"Error fetching student: {str(e)}")
            return None
