"""
Reusable model mixins
"""

from django.db import models


class CreatedByMixin(models.Model):
    """
    Mixin to track who created the object
    """
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='%(class)s_created',
        editable=False
    )
    
    class Meta:
        abstract = True


class UpdatedByMixin(models.Model):
    """
    Mixin to track who last updated the object
    """
    updated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='%(class)s_updated',
        editable=False
    )
    
    class Meta:
        abstract = True


class PublishableMixin(models.Model):
    """
    Mixin for publishable content
    """
    is_published = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        abstract = True
    
    def publish(self):
        """Publish the content"""
        from django.utils import timezone
        self.is_published = True
        self.published_at = timezone.now()
        self.save()
    
    def unpublish(self):
        """Unpublish the content"""
        self.is_published = False
        self.published_at = None
        self.save()
