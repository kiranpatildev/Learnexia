"""
Custom managers for querysets
"""

from django.db import models


class SoftDeleteManager(models.Manager):
    """
    Manager that excludes soft-deleted objects by default
    """
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def with_deleted(self):
        """Include soft-deleted objects"""
        return super().get_queryset()
    
    def deleted_only(self):
        """Return only soft-deleted objects"""
        return super().get_queryset().filter(is_deleted=True)
