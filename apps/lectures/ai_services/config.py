"""
AI provider configuration and selection for transcription
"""

from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class AIConfig:
    """AI services configuration"""
    
    # Transcription providers
    PROVIDER_WHISPER = 'whisper'
    PROVIDER_ASSEMBLYAI = 'assemblyai'
    
    # File size limits
    MAX_FILE_SIZE = settings.TRANSCRIPTION_MAX_FILE_SIZE  # 200 MB
    CHUNK_SIZE = settings.TRANSCRIPTION_CHUNK_SIZE  # 24 MB
    WHISPER_API_LIMIT = 25 * 1024 * 1024  # 25 MB (Whisper API limit)
    
    # Supported formats
    SUPPORTED_FORMATS = settings.TRANSCRIPTION_SUPPORTED_FORMATS
    
    # API Keys
    OPENAI_API_KEY = settings.OPENAI_API_KEY
    OPENAI_ORG_ID = settings.OPENAI_ORG_ID
    ASSEMBLYAI_API_KEY = settings.ASSEMBLYAI_API_KEY
    
    # Provider selection
    DEFAULT_PROVIDER = settings.AI_TRANSCRIPTION_PROVIDER
    
    # Whisper settings
    WHISPER_MODEL = settings.TRANSCRIPTION_WHISPER_MODEL
    
    @classmethod
    def get_provider(cls):
        """
        Get the configured transcription provider
        
        Returns:
            str: Provider name ('whisper' or 'assemblyai')
        
        Raises:
            ValueError: If no provider is configured
        """
        provider = cls.DEFAULT_PROVIDER
        
        if provider == cls.PROVIDER_WHISPER:
            if not cls.OPENAI_API_KEY:
                logger.warning("OpenAI API key not configured, falling back to AssemblyAI")
                provider = cls.PROVIDER_ASSEMBLYAI
        
        if provider == cls.PROVIDER_ASSEMBLYAI:
            if not cls.ASSEMBLYAI_API_KEY:
                raise ValueError(
                    "No transcription provider configured. "
                    "Please set OPENAI_API_KEY or ASSEMBLYAI_API_KEY in your environment."
                )
        
        logger.info(f"Using transcription provider: {provider}")
        return provider
    
    @classmethod
    def validate_file_format(cls, filename):
        """
        Validate if file format is supported
        
        Args:
            filename (str): Name of the file
        
        Returns:
            bool: True if supported, False otherwise
        """
        extension = filename.split('.')[-1].lower()
        return extension in cls.SUPPORTED_FORMATS
    
    @classmethod
    def validate_file_size(cls, file_size):
        """
        Validate if file size is within limits
        
        Args:
            file_size (int): Size of file in bytes
        
        Returns:
            bool: True if within limits, False otherwise
        """
        return file_size <= cls.MAX_FILE_SIZE
    
    @classmethod
    def needs_chunking(cls, file_size):
        """
        Check if file needs to be split into chunks
        
        Args:
            file_size (int): Size of file in bytes
        
        Returns:
            bool: True if file should be chunked, False otherwise
        """
        return file_size > cls.WHISPER_API_LIMIT
