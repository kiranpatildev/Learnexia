"""
AI provider configuration for LOCAL transcription (Privacy-First)

CRITICAL: Audio files NEVER leave the server.
Transcription runs entirely on local CPU/GPU using open-source Whisper.
"""

from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class AIConfig:
    """AI services configuration - LOCAL PROCESSING ONLY"""
    
    # Transcription Mode: LOCAL ONLY (no cloud providers)
    TRANSCRIPTION_MODE = settings.TRANSCRIPTION_MODE  # Must be 'local'
    
    # Local Whisper Configuration
    WHISPER_MODEL = settings.LOCAL_WHISPER_MODEL  # tiny, base, small, medium, large
    WHISPER_DEVICE = settings.WHISPER_DEVICE  # cpu or cuda
    WHISPER_COMPUTE_TYPE = settings.WHISPER_COMPUTE_TYPE  # int8, float16, float32
    
    # File size limits (local processing has higher limits)
    MAX_FILE_SIZE = settings.TRANSCRIPTION_MAX_FILE_SIZE  # 500 MB
    CHUNK_DURATION = settings.TRANSCRIPTION_CHUNK_DURATION  # 30 minutes
    
    # Supported formats
    SUPPORTED_FORMATS = settings.TRANSCRIPTION_SUPPORTED_FORMATS
    
    # Gemini Configuration (Text-Only, Teacher-Approved)
    GEMINI_API_KEY = settings.GEMINI_API_KEY
    GEMINI_MODEL = settings.GEMINI_MODEL
    
    @classmethod
    def validate_local_mode(cls):
        """
        Validate that transcription is configured for local processing
        
        Raises:
            ValueError: If cloud mode is detected
        """
        if cls.TRANSCRIPTION_MODE != 'local':
            raise ValueError(
                f"TRANSCRIPTION_MODE must be 'local' for privacy compliance. "
                f"Found: {cls.TRANSCRIPTION_MODE}"
            )
        
        logger.info(f"✅ Transcription mode: LOCAL (Privacy-compliant)")
        logger.info(f"✅ Whisper model: {cls.WHISPER_MODEL}")
        logger.info(f"✅ Device: {cls.WHISPER_DEVICE}")
        logger.info(f"✅ Audio stays on-premise")
    
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
    def get_model_info(cls):
        """
        Get information about the Whisper model
        
        Returns:
            dict: Model configuration details
        """
        model_sizes = {
            'tiny': '39M parameters, ~1GB RAM, fastest',
            'base': '74M parameters, ~1GB RAM, good balance',
            'small': '244M parameters, ~2GB RAM, better accuracy',
            'medium': '769M parameters, ~5GB RAM, high accuracy',
            'large': '1550M parameters, ~10GB RAM, best accuracy'
        }
        
        return {
            'model': cls.WHISPER_MODEL,
            'device': cls.WHISPER_DEVICE,
            'compute_type': cls.WHISPER_COMPUTE_TYPE,
            'description': model_sizes.get(cls.WHISPER_MODEL, 'Unknown model'),
            'mode': 'LOCAL (Privacy-First)'
        }
