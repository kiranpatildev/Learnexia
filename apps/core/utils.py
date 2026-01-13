"""
Utility functions
"""

import hashlib
import random
import string
from datetime import datetime, timedelta
from django.utils import timezone


def generate_unique_code(length=8):
    """
    Generate a unique alphanumeric code
    """
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=length))


def generate_hash(text):
    """
    Generate SHA256 hash of text
    """
    return hashlib.sha256(text.encode()).hexdigest()


def get_academic_year():
    """
    Get current academic year (e.g., "2024-2025")
    """
    now = timezone.now()
    if now.month >= 4:  # Academic year starts in April
        return f"{now.year}-{now.year + 1}"
    else:
        return f"{now.year - 1}-{now.year}"


def calculate_percentage(obtained, total):
    """
    Calculate percentage with 2 decimal places
    """
    if total == 0:
        return 0
    return round((obtained / total) * 100, 2)


def get_grade_from_percentage(percentage):
    """
    Convert percentage to letter grade
    """
    if percentage >= 90:
        return 'A+'
    elif percentage >= 80:
        return 'A'
    elif percentage >= 70:
        return 'B+'
    elif percentage >= 60:
        return 'B'
    elif percentage >= 50:
        return 'C+'
    elif percentage >= 40:
        return 'C'
    elif percentage >= 33:
        return 'D'
    else:
        return 'F'


def get_file_extension(filename):
    """
    Get file extension from filename
    """
    return filename.split('.')[-1].lower() if '.' in filename else ''


def format_duration(seconds):
    """
    Format duration in seconds to HH:MM:SS
    """
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    else:
        return f"{minutes:02d}:{secs:02d}"


def get_date_range(period='week'):
    """
    Get start and end date for a period
    """
    now = timezone.now()
    
    if period == 'today':
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif period == 'week':
        start = now - timedelta(days=now.weekday())
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=6, hours=23, minutes=59, seconds=59)
    elif period == 'month':
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_month = start + timedelta(days=32)
        end = next_month.replace(day=1) - timedelta(seconds=1)
    elif period == 'year':
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)
    else:
        start = now
        end = now
    
    return start, end
