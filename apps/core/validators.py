"""
Custom validators
"""

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import os


def validate_file_size(file, max_size_mb=10):
    """
    Validate file size
    """
    max_size = max_size_mb * 1024 * 1024  # Convert to bytes
    if file.size > max_size:
        raise ValidationError(
            _('File size cannot exceed %(max_size)s MB'),
            params={'max_size': max_size_mb}
        )


def validate_file_extension(file, allowed_extensions):
    """
    Validate file extension
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in allowed_extensions:
        raise ValidationError(
            _('File extension "%(ext)s" is not allowed. Allowed extensions: %(allowed)s'),
            params={'ext': ext, 'allowed': ', '.join(allowed_extensions)}
        )


def validate_image_file(file):
    """
    Validate image file
    """
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    validate_file_extension(file, allowed_extensions)
    validate_file_size(file, max_size_mb=5)


def validate_video_file(file):
    """
    Validate video file
    """
    allowed_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    validate_file_extension(file, allowed_extensions)
    validate_file_size(file, max_size_mb=100)


def validate_audio_file(file):
    """
    Validate audio file
    """
    allowed_extensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac']
    validate_file_extension(file, allowed_extensions)
    validate_file_size(file, max_size_mb=50)


def validate_document_file(file):
    """
    Validate document file
    """
    allowed_extensions = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.xls', '.xlsx']
    validate_file_extension(file, allowed_extensions)
    validate_file_size(file, max_size_mb=20)
