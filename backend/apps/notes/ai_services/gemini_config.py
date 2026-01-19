"""
Google Gemini API configuration and initialization
"""

from django.conf import settings
from google import genai
import logging

logger = logging.getLogger(__name__)


class GeminiConfig:
    """Gemini AI configuration for notes generation"""
    
    # API Configuration
    API_KEY = settings.GEMINI_API_KEY
    MODEL_NAME = settings.GEMINI_MODEL
    
    # Generation Settings
    GENERATION_CONFIG = {
        'temperature': 0.7,        # Balance creativity and consistency
        'top_p': 0.95,            # Nucleus sampling
        'top_k': 40,              # Top-k sampling
        'max_output_tokens': 8192, # Allow long notes
    }
    
    # Safety Settings (optional - adjust based on needs)
    SAFETY_SETTINGS = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
    ]
    
    @classmethod
    def initialize(cls):
        """
        Initialize Gemini API with configuration
        
        Raises:
            ValueError: If API key is not configured
        """
        if not cls.API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is not set. "
                "Please configure it in your .env file. "
                "Get your API key from: https://makersuite.google.com/app/apikey"
            )
        
        logger.info(f"[GEMINI] API initialized with model: {cls.MODEL_NAME}")
    
    @classmethod
    def get_client(cls):
        """
        Get configured Gemini client instance (NEW SDK)
        
        Returns:
            genai.Client: Configured Gemini client
        """
        cls.initialize()
        # The client automatically picks up GEMINI_API_KEY from environment
        return genai.Client(api_key=cls.API_KEY)
    
    @classmethod
    def validate_model_name(cls, model_name: str) -> bool:
        """
        Validate if model name is supported
        
        Args:
            model_name: Name of the model
        
        Returns:
            bool: True if valid
        """
        valid_models = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-2.0-flash-exp',
            'gemini-pro',
        ]
        return model_name in valid_models
