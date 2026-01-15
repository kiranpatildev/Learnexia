"""
Celery tasks for async lecture transcription
"""

from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def transcribe_lecture_async(self, lecture_id):
    """
    Async task to transcribe lecture
    
    Args:
        lecture_id: UUID of the lecture to transcribe
    
    Returns:
        dict: Transcription result
    """
    from apps.lectures.models import Lecture
    from apps.lectures.ai_services.transcription import TranscriptionService
    from apps.notifications.views import create_notification
    
    try:
        # Get lecture
        lecture = Lecture.objects.get(id=lecture_id)
        
        # Update status to processing
        lecture.transcript_status = 'processing'
        lecture.save(update_fields=['transcript_status'])
        
        logger.info(f"Starting transcription for lecture {lecture_id}")
        
        # Transcribe
        service = TranscriptionService()
        result = service.transcribe_lecture(lecture)
        
        if result['success']:
            # Update lecture with transcript
            lecture.transcript = result['transcript']
            lecture.has_auto_generated_transcript = True
            lecture.transcript_status = 'completed'
            lecture.save(update_fields=['transcript', 'has_auto_generated_transcript', 'transcript_status'])
            
            logger.info(f"Transcription completed for lecture {lecture_id}: {result['word_count']} words")
            
            # Notify teacher
            try:
                create_notification(
                    recipient=lecture.teacher,
                    notification_type='system_alert',
                    title='Lecture Transcription Complete',
                    message=f'Transcript for "{lecture.title}" is ready ({result["word_count"]} words)',
                    priority='normal',
                    reference_type='lecture',
                    reference_id=str(lecture.id),
                    action_url=f'/lectures/{lecture.id}/'
                )
            except Exception as e:
                logger.warning(f"Failed to send notification: {e}")
            
            return {
                'status': 'success',
                'lecture_id': str(lecture_id),
                'word_count': result['word_count'],
                'processing_time': result['processing_time']
            }
        else:
            # Update status to failed
            lecture.transcript_status = 'failed'
            lecture.save(update_fields=['transcript_status'])
            
            logger.error(f"Transcription failed for lecture {lecture_id}: {result['error']}")
            
            # Notify teacher of failure
            try:
                create_notification(
                    recipient=lecture.teacher,
                    notification_type='system_alert',
                    title='Lecture Transcription Failed',
                    message=f'Failed to transcribe "{lecture.title}": {result["error"]}',
                    priority='high',
                    reference_type='lecture',
                    reference_id=str(lecture.id)
                )
            except Exception as e:
                logger.warning(f"Failed to send notification: {e}")
            
            return {
                'status': 'failed',
                'lecture_id': str(lecture_id),
                'error': result['error']
            }
    
    except Lecture.DoesNotExist:
        logger.error(f"Lecture {lecture_id} not found")
        return {
            'status': 'failed',
            'lecture_id': str(lecture_id),
            'error': 'Lecture not found'
        }
    
    except Exception as exc:
        logger.error(f"Transcription task error for lecture {lecture_id}: {str(exc)}", exc_info=True)
        
        # Update lecture status
        try:
            lecture = Lecture.objects.get(id=lecture_id)
            lecture.transcript_status = 'failed'
            lecture.save(update_fields=['transcript_status'])
        except:
            pass
        
        # Retry on transient errors
        if self.request.retries < self.max_retries:
            # Exponential backoff: 1min, 2min, 4min
            countdown = 60 * (2 ** self.request.retries)
            logger.info(f"Retrying transcription in {countdown}s (attempt {self.request.retries + 1}/{self.max_retries})")
            raise self.retry(exc=exc, countdown=countdown)
        
        return {
            'status': 'failed',
            'lecture_id': str(lecture_id),
            'error': str(exc)
        }
