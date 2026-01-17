"""
Signals for automatic profile creation
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, StudentProfile, TeacherProfile, ParentProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create profile based on user role
    """
    if created:
        if instance.role == 'student':
            StudentProfile.objects.create(user=instance)
        elif instance.role == 'teacher':
            TeacherProfile.objects.create(user=instance)
        elif instance.role == 'parent':
            ParentProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Save profile when user is saved
    """
    try:
        if instance.role == 'student' and hasattr(instance, 'student_profile'):
            instance.student_profile.save()
        elif instance.role == 'teacher' and hasattr(instance, 'teacher_profile'):
            instance.teacher_profile.save()
        elif instance.role == 'parent' and hasattr(instance, 'parent_profile'):
            instance.parent_profile.save()
    except:
        pass  # Profile doesn't exist yet
