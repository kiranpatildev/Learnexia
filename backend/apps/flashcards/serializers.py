"""
Serializers for flashcard generation
"""

from rest_framework import serializers
from .models import FlashcardSet, Flashcard, StudentFlashcardProgress


class FlashcardGenerationRequestSerializer(serializers.Serializer):
    """
    Serializer for AI flashcard generation request
    """
    
    card_type = serializers.ChoiceField(
        choices=['DEFINITION', 'CONCEPT', 'MIXED', 'FORMULA', 'APPLICATION'],
        default='MIXED',
        help_text='Type of flashcards (DEFINITION: terms, CONCEPT: understanding, FORMULA: equations, APPLICATION: real-world, MIXED: balanced mix)'
    )
    
    style = serializers.ChoiceField(
        choices=['CONCISE', 'DETAILED'],
        default='CONCISE',
        help_text='Card style (CONCISE: quick review 20-40 words, DETAILED: deep understanding 40-80 words)'
    )
    
    count = serializers.CharField(
        default='auto',
        help_text='Number of flashcards (10, 20, 30, 40, 50, or "auto" for smart calculation)'
    )
    
    def validate_count(self, value):
        """Validate count is valid"""
        if value != 'auto':
            try:
                count_int = int(value)
                if count_int not in [10, 20, 30, 40, 50]:
                    raise serializers.ValidationError(
                        'Count must be 10, 20, 30, 40, 50, or "auto"'
                    )
                return count_int
            except ValueError:
                raise serializers.ValidationError(
                    'Count must be a number (10, 20, 30, 40, 50) or "auto"'
                )
        return value


class FlashcardItemSerializer(serializers.Serializer):
    """Single flashcard item"""
    question = serializers.CharField()
    answer = serializers.CharField()
    category = serializers.CharField()


class FlashcardGenerationResponseSerializer(serializers.Serializer):
    """
    Serializer for AI flashcard generation response
    """
    
    success = serializers.BooleanField()
    message = serializers.CharField()
    
    # Data fields (only if success=True)
    flashcards = FlashcardItemSerializer(many=True, required=False)
    count = serializers.IntegerField(required=False)
    type = serializers.CharField(required=False)
    style = serializers.CharField(required=False)
    
    # Error field (only if success=False)
    error_code = serializers.CharField(required=False)


# Model Serializers

class FlashcardSerializer(serializers.ModelSerializer):
    """Serializer for individual flashcards"""
    
    class Meta:
        model = Flashcard
        fields = [
            'id', 'flashcard_set', 'question', 'answer', 'hint',
            'order', 'is_ai_generated', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FlashcardSetSerializer(serializers.ModelSerializer):
    """Serializer for flashcard sets"""
    
    card_count = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    lecture_title = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()
    
    class Meta:
        model = FlashcardSet
        fields = [
            'id', 'lecture', 'classroom', 'teacher', 'title', 'description',
            'is_published', 'published_at', 'is_ai_generated', 'ai_generated_at',
            'view_count', 'study_count', 'card_count',
            'teacher_name', 'lecture_title', 'subject', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'teacher', 'view_count', 'study_count',
            'created_at', 'updated_at'
        ]
    
    def get_card_count(self, obj):
        """Get total number of flashcards in set"""
        try:
            return obj.flashcards.count()
        except Exception:
            return 0
    
    def get_teacher_name(self, obj):
        """Get teacher's full name"""
        try:
            if obj.teacher:
                return obj.teacher.get_full_name()
        except Exception:
            pass
        return None
    
    def get_lecture_title(self, obj):
        """Get lecture title"""
        try:
            if obj.lecture:
                return obj.lecture.title
        except Exception:
            pass
        return None
    
    def get_subject(self, obj):
        """Get subject name"""
        try:
            if obj.classroom and hasattr(obj.classroom, 'subject') and obj.classroom.subject:
                return obj.classroom.subject.name
            elif obj.lecture and hasattr(obj.lecture, 'subject'):
                return obj.lecture.subject
        except Exception:
            pass
        return None


class StudentFlashcardProgressSerializer(serializers.ModelSerializer):
    """Serializer for student flashcard progress"""
    
    flashcard_question = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentFlashcardProgress
        fields = [
            'id', 'flashcard', 'student', 'confidence_level',
            'times_studied', 'times_correct', 'times_incorrect',
            'last_studied_at', 'next_review_at', 'flashcard_question',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']
    
    def get_flashcard_question(self, obj):
        """Get the flashcard question"""
        return obj.flashcard.question if obj.flashcard else None
