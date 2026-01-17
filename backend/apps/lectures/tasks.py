"""
Celery tasks for LOCAL lecture transcription

CRITICAL: Tasks are for compute-heavy local processing ONLY.
NOT for cloud API retries or network reliability.
"""

from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2)
def transcribe_lecture_async(self, lecture_id):
    """
    Async task for LOCAL transcription (compute-heavy)
    
    Used for:
    - Long audio files (>30 minutes)
    - Queueing heavy CPU/GPU jobs
    - Background processing to avoid blocking requests
    
    NOT used for:
    - Cloud API retries (we don't use cloud APIs)
    - Network reliability (all processing is local)
    
    Args:
        lecture_id: UUID of the lecture to transcribe
    
    Returns:
        dict: Transcription result
    """
    from apps.lectures.models import Lecture
    from apps.lectures.ai_services.transcription import LocalWhisperService
    from apps.notifications.views import create_notification
    
    try:
        # Get lecture
        lecture = Lecture.objects.get(id=lecture_id)
        
        # Update status to processing
        lecture.transcript_status = 'processing'
        lecture.save(update_fields=['transcript_status'])
        
        logger.info(f"Starting LOCAL transcription for lecture {lecture_id}")
        
        # Transcribe using LOCAL Whisper
        service = LocalWhisperService()
        result = service.transcribe_lecture(lecture)
        
        if result['success']:
            # Update lecture with transcript (DRAFT - needs teacher approval)
            lecture.transcript = result['transcript']
            lecture.has_auto_generated_transcript = True
            lecture.transcript_status = 'completed'
            lecture.transcript_approved_by_teacher = False  # CRITICAL: Requires approval
            lecture.save(update_fields=[
                'transcript', 'has_auto_generated_transcript',
                'transcript_status', 'transcript_approved_by_teacher'
            ])
            
            logger.info(f"✅ LOCAL transcription completed for lecture {lecture_id}: {result['word_count']} words")
            
            # Notify teacher (transcript needs approval)
            try:
                create_notification(
                    recipient=lecture.teacher,
                    notification_type='system_alert',
                    title='Lecture Transcript Ready for Review',
                    message=f'Transcript for "{lecture.title}" is ready ({result["word_count"]} words). Please review and approve before using AI features.',
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
                'processing_time': result['processing_time'],
                'mode': 'local',
                'cost': 0.00
            }
        else:
            # Update status to failed
            lecture.transcript_status = 'failed'
            lecture.save(update_fields=['transcript_status'])
            
            logger.error(f"LOCAL transcription failed for lecture {lecture_id}: {result['error']}")
            
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
                'error': result['error'],
                'mode': 'local'
            }
    
    except Lecture.DoesNotExist:
        logger.error(f"Lecture {lecture_id} not found")
        return {
            'status': 'failed',
            'lecture_id': str(lecture_id),
            'error': 'Lecture not found'
        }
    
    except Exception as exc:
        logger.error(f"LOCAL transcription task error for lecture {lecture_id}: {str(exc)}", exc_info=True)
        
        # Update lecture status
        try:
            lecture = Lecture.objects.get(id=lecture_id)
            lecture.transcript_status = 'failed'
            lecture.save(update_fields=['transcript_status'])
        except:
            pass
        
        # Retry ONLY on local compute failures (memory, disk, etc.)
        # NOT on network failures (we don't use network for transcription)
        if self.request.retries < self.max_retries:
            countdown = 60 * (2 ** self.request.retries)  # 1min, 2min
            logger.info(f"Retrying LOCAL transcription in {countdown}s (attempt {self.request.retries + 1}/{self.max_retries})")
            raise self.retry(exc=exc, countdown=countdown)
        
        return {
            'status': 'failed',
            'lecture_id': str(lecture_id),
            'error': str(exc),
            'mode': 'local'
        }
