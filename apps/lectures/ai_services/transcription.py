"""
Main transcription service - handles speech-to-text conversion
"""

import os
import time
import logging
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, List, Optional

import openai
import assemblyai as aai
import requests
from pydub import AudioSegment
from django.core.exceptions import ValidationError

from .config import AIConfig

logger = logging.getLogger(__name__)


class TranscriptionService:
    """Service for converting lecture audio/video to text"""
    
    def __init__(self):
        """Initialize transcription service"""
        self.provider = AIConfig.get_provider()
        
        # Configure OpenAI
        if self.provider == AIConfig.PROVIDER_WHISPER:
            openai.api_key = AIConfig.OPENAI_API_KEY
            if AIConfig.OPENAI_ORG_ID:
                openai.organization = AIConfig.OPENAI_ORG_ID
        
        # Configure AssemblyAI
        if self.provider == AIConfig.PROVIDER_ASSEMBLYAI:
            aai.settings.api_key = AIConfig.ASSEMBLYAI_API_KEY
    
    def transcribe_lecture(self, lecture) -> Dict:
        """
        Main entry point for transcription
        
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
                    'error': 'No audio or video file found for this lecture'
                }
            
            # Validate file
            self.validate_audio_file(file_path)
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            # Extract audio if video file
            if lecture.recording_type == 'video':
                logger.info(f"Extracting audio from video: {file_path}")
                file_path = self._extract_audio_from_video(file_path)
            
            # Check if file needs chunking
            if AIConfig.needs_chunking(file_size):
                logger.info(f"File size {file_size} bytes exceeds limit, chunking required")
                transcript = self._transcribe_large_file(file_path)
            else:
                # Transcribe based on provider
                if self.provider == AIConfig.PROVIDER_WHISPER:
                    transcript = self._transcribe_with_whisper(file_path)
                else:
                    transcript = self._transcribe_with_assemblyai(file_path)
            
            # Calculate metrics
            word_count = len(transcript.split())
            processing_time = time.time() - start_time
            
            # Clean up temp files if video was converted
            if lecture.recording_type == 'video' and file_path != self._get_media_file_path(lecture):
                try:
                    os.remove(file_path)
                except:
                    pass
            
            logger.info(f"Transcription completed: {word_count} words in {processing_time:.2f}s")
            
            return {
                'success': True,
                'transcript': transcript,
                'word_count': word_count,
                'duration': lecture.duration or 0,
                'language': 'en',  # Auto-detected by Whisper
                'processing_time': processing_time,
                'error': None
            }
        
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'transcript': None,
                'word_count': 0,
                'processing_time': time.time() - start_time
            }
    
    def _get_media_file_path(self, lecture) -> Optional[str]:
        """Get the file path for audio or video"""
        if lecture.audio_file:
            return lecture.audio_file.path
        elif lecture.video_file:
            return lecture.video_file.path
        return None
    
    def _transcribe_with_whisper(self, file_path: str) -> str:
        """
        Transcribe using OpenAI Whisper API
        
        Args:
            file_path: Path to audio file
        
        Returns:
            str: Transcript text
        """
        logger.info(f"Transcribing with Whisper: {file_path}")
        
        try:
            with open(file_path, 'rb') as audio_file:
                response = openai.audio.transcriptions.create(
                    model=AIConfig.WHISPER_MODEL,
                    file=audio_file,
                    response_format="text"
                )
            
            return response
        
        except openai.AuthenticationError:
            raise ValidationError("Invalid OpenAI API key")
        except openai.RateLimitError:
            raise ValidationError("OpenAI API rate limit exceeded. Please try again later.")
        except Exception as e:
            logger.error(f"Whisper API error: {str(e)}")
            raise ValidationError(f"Transcription failed: {str(e)}")
    
    def _transcribe_with_assemblyai(self, file_path: str) -> str:
        """
        Transcribe using AssemblyAI API
        
        Args:
            file_path: Path to audio file
        
        Returns:
            str: Transcript text
        """
        logger.info(f"Transcribing with AssemblyAI: {file_path}")
        
        try:
            # Upload file
            transcriber = aai.Transcriber()
            
            # Transcribe
            transcript = transcriber.transcribe(file_path)
            
            # Wait for completion
            if transcript.status == aai.TranscriptStatus.error:
                raise ValidationError(f"AssemblyAI transcription failed: {transcript.error}")
            
            return transcript.text
        
        except Exception as e:
            logger.error(f"AssemblyAI error: {str(e)}")
            raise ValidationError(f"Transcription failed: {str(e)}")
    
    def _extract_audio_from_video(self, video_path: str) -> str:
        """
        Extract audio track from video file
        
        Args:
            video_path: Path to video file
        
        Returns:
            str: Path to extracted audio file
        """
        try:
            # Create temp file for audio
            temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
            temp_audio_path = temp_audio.name
            temp_audio.close()
            
            # Extract audio using ffmpeg
            command = [
                'ffmpeg',
                '-i', video_path,
                '-vn',  # No video
                '-acodec', 'libmp3lame',  # MP3 codec
                '-ar', '16000',  # 16kHz sample rate (good for speech)
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
            
            logger.info(f"Audio extracted to: {temp_audio_path}")
            return temp_audio_path
        
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error: {e.stderr.decode()}")
            raise ValidationError("Failed to extract audio from video. Ensure FFmpeg is installed.")
        except Exception as e:
            logger.error(f"Audio extraction error: {str(e)}")
            raise ValidationError(f"Failed to extract audio: {str(e)}")
    
    def _transcribe_large_file(self, file_path: str) -> str:
        """
        Transcribe large file by splitting into chunks
        
        Args:
            file_path: Path to audio file
        
        Returns:
            str: Combined transcript
        """
        logger.info(f"Splitting large file into chunks: {file_path}")
        
        try:
            # Load audio file
            audio = AudioSegment.from_file(file_path)
            
            # Calculate chunk duration (20 minutes = 1,200,000 ms)
            chunk_duration_ms = 20 * 60 * 1000
            
            # Split into chunks
            chunks = []
            for i in range(0, len(audio), chunk_duration_ms):
                chunk = audio[i:i + chunk_duration_ms]
                chunks.append(chunk)
            
            logger.info(f"Split into {len(chunks)} chunks")
            
            # Transcribe each chunk
            transcripts = []
            temp_files = []
            
            for idx, chunk in enumerate(chunks):
                # Save chunk to temp file
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                chunk.export(temp_file.name, format='mp3')
                temp_files.append(temp_file.name)
                
                logger.info(f"Transcribing chunk {idx + 1}/{len(chunks)}")
                
                # Transcribe chunk
                if self.provider == AIConfig.PROVIDER_WHISPER:
                    chunk_transcript = self._transcribe_with_whisper(temp_file.name)
                else:
                    chunk_transcript = self._transcribe_with_assemblyai(temp_file.name)
                
                transcripts.append(chunk_transcript)
            
            # Clean up temp files
            for temp_file in temp_files:
                try:
                    os.remove(temp_file)
                except:
                    pass
            
            # Merge transcripts
            return self._merge_transcripts(transcripts)
        
        except Exception as e:
            logger.error(f"Large file transcription error: {str(e)}")
            raise ValidationError(f"Failed to transcribe large file: {str(e)}")
    
    def _merge_transcripts(self, transcripts: List[str]) -> str:
        """
        Merge multiple transcript segments
        
        Args:
            transcripts: List of transcript strings
        
        Returns:
            str: Combined transcript
        """
        # Simply join with space (could be improved with smarter merging)
        return ' '.join(transcripts)
    
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
