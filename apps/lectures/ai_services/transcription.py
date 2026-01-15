"""
Local Whisper transcription service - PRIVACY-FIRST ARCHITECTURE

CRITICAL DESIGN PRINCIPLES:
1. Audio files NEVER leave the server
2. Transcription runs entirely on local CPU/GPU
3. Zero cost per transcription (local compute only)
4. No API keys required for transcription
5. Predictable, deterministic processing

Architecture:
Audio → Local Whisper → Draft Transcript → Teacher Approval → Gemini (text-only)
"""

import os
import time
import logging
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, Optional

import whisper
import torch
from pydub import AudioSegment
from django.core.exceptions import ValidationError

from .config import AIConfig

logger = logging.getLogger(__name__)


class LocalWhisperService:
    """
    Local Whisper transcription service
    
    Runs open-source Whisper model on local CPU/GPU.
    Audio files never leave the server.
    """
    
    def __init__(self):
        """Initialize local Whisper service"""
        # Validate local mode
        AIConfig.validate_local_mode()
        
        # Load Whisper model (cached after first load)
        logger.info(f"Loading Whisper model: {AIConfig.WHISPER_MODEL}")
        self.model = whisper.load_model(
            AIConfig.WHISPER_MODEL,
            device=AIConfig.WHISPER_DEVICE
        )
        logger.info(f"✅ Whisper model loaded on {AIConfig.WHISPER_DEVICE}")
    
    def transcribe_lecture(self, lecture) -> Dict:
        """
        Main entry point for local transcription
        
        Args:
            lecture: Lecture model instance
        
        Returns:
            dict: {
                'success': bool,
                'transcript': str,
                'word_count': int,
                'duration': int,
                'language': str,
                'processing_time': float,
                'mode': 'local',
                'error': str (if failed)
            }
        """
        start_time = time.time()
        
        try:
            # Validate lecture has media file
            file_path = self._get_media_file_path(lecture)
            if not file_path:
                return {
                    'success': False,
                    'error': 'No audio or video file found for this lecture',
                    'mode': 'local'
                }
            
            # Validate file
            self.validate_audio_file(file_path)
            
            # Extract audio if video file
            if lecture.recording_type == 'video':
                logger.info(f"Extracting audio from video: {file_path}")
                file_path = self._extract_audio_from_video(file_path)
            
            # Transcribe using local Whisper
            logger.info(f"Starting local transcription: {file_path}")
            result = self.model.transcribe(
                file_path,
                language='en',  # Auto-detect or specify
                task='transcribe',
                verbose=False
            )
            
            transcript = result['text'].strip()
            
            # Calculate metrics
            word_count = len(transcript.split())
            processing_time = time.time() - start_time
            
            # Clean up temp files if video was converted
            if lecture.recording_type == 'video' and file_path != self._get_media_file_path(lecture):
                try:
                    os.remove(file_path)
                except:
                    pass
            
            logger.info(f"✅ Local transcription completed: {word_count} words in {processing_time:.2f}s")
            
            return {
                'success': True,
                'transcript': transcript,
                'word_count': word_count,
                'duration': lecture.duration or 0,
                'language': result.get('language', 'en'),
                'processing_time': processing_time,
                'mode': 'local',
                'cost': 0.00,  # Zero cost for local processing
                'error': None
            }
        
        except Exception as e:
            logger.error(f"Local transcription failed: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'transcript': None,
                'word_count': 0,
                'processing_time': time.time() - start_time,
                'mode': 'local'
            }
    
    def _get_media_file_path(self, lecture) -> Optional[str]:
        """Get the file path for audio or video"""
        if lecture.audio_file:
            return lecture.audio_file.path
        elif lecture.video_file:
            return lecture.video_file.path
        return None
    
    def _extract_audio_from_video(self, video_path: str) -> str:
        """
        Extract audio track from video file using FFmpeg
        
        Args:
            video_path: Path to video file
        
        Returns:
            str: Path to extracted audio file
        """
        try:
            # Create temp file for audio
            temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            temp_audio_path = temp_audio.name
            temp_audio.close()
            
            # Extract audio using ffmpeg
            command = [
                'ffmpeg',
                '-i', video_path,
                '-vn',  # No video
                '-acodec', 'pcm_s16le',  # WAV codec
                '-ar', '16000',  # 16kHz sample rate (Whisper optimal)
                '-ac', '1',  # Mono
                '-y',  # Overwrite output file
                temp_audio_path
            ]
            
            result = subprocess.run(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True
            )
            
            logger.info(f"✅ Audio extracted to: {temp_audio_path}")
            return temp_audio_path
        
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error: {e.stderr.decode()}")
            raise ValidationError("Failed to extract audio from video. Ensure FFmpeg is installed.")
        except Exception as e:
            logger.error(f"Audio extraction error: {str(e)}")
            raise ValidationError(f"Failed to extract audio: {str(e)}")
    
    def validate_audio_file(self, file_path: str) -> bool:
        """
        Validate audio file before transcription
        
        Args:
            file_path: Path to audio file
        
        Returns:
            bool: True if valid
        
        Raises:
            ValidationError: If file is invalid
        """
        # Check file exists
        if not os.path.exists(file_path):
            raise ValidationError("Audio file not found")
        
        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            raise ValidationError("Audio file is empty")
        
        if not AIConfig.validate_file_size(file_size):
            max_size_mb = AIConfig.MAX_FILE_SIZE / (1024 * 1024)
            raise ValidationError(f"File size exceeds maximum limit of {max_size_mb:.0f} MB")
        
        # Check file format
        filename = os.path.basename(file_path)
        if not AIConfig.validate_file_format(filename):
            raise ValidationError(
                f"Unsupported file format. Supported formats: {', '.join(AIConfig.SUPPORTED_FORMATS)}"
            )
        
        # Check file is readable
        try:
            with open(file_path, 'rb') as f:
                f.read(1024)  # Read first 1KB
        except Exception as e:
            raise ValidationError(f"Cannot read audio file: {str(e)}")
        
        return True


# Maintain backward compatibility
TranscriptionService = LocalWhisperService
