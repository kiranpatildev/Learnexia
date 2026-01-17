"""
Serializers for flashcard generation
"""

from rest_framework import serializers


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
