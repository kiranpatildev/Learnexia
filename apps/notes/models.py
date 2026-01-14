"""
Models for notes app
"""

from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.lectures.models import Lecture
from apps.schools.models import Classroom


class NoteTemplate(TimeStampedModel):
    """Predefined note templates for teachers"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content = models.TextField(help_text='Template content in HTML/Markdown')
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='note_templates')
    
    class Meta:
        verbose_name = 'Note Template'
        verbose_name_plural = 'Note Templates'
    
    def __str__(self):
        return self.name


class LectureNote(TimeStampedModel, SoftDeleteModel):
    """Teacher-created lecture notes"""
    lecture = models.OneToOneField(Lecture, on_delete=models.CASCADE, related_name='notes')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='lecture_notes')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_notes')
    
    title = models.CharField(max_length=255)
    content = models.TextField(help_text='Rich text content')
    summary = models.TextField(blank=True, max_length=500)
    
    template = models.ForeignKey(NoteTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_auto_generated = models.BooleanField(default=False)
    auto_generated_at = models.DateTimeField(null=True, blank=True)
    
    is_published = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    pdf_file = models.FileField(upload_to='notes/pdfs/%Y/%m/%d/', null=True, blank=True)
    pdf_generated_at = models.DateTimeField(null=True, blank=True)
    
    view_count = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    bookmark_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Lecture Note'
        verbose_name_plural = 'Lecture Notes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['classroom', '-published_at']),
            models.Index(fields=['teacher', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.lecture.title}"


class StudentNoteBookmark(TimeStampedModel):
    """Students bookmarking lecture notes"""
    note = models.ForeignKey(LectureNote, on_delete=models.CASCADE, related_name='bookmarks')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarked_notes')
    
    class Meta:
        unique_together = ['note', 'student']
        verbose_name = 'Student Note Bookmark'
        verbose_name_plural = 'Student Note Bookmarks'
    
    def __str__(self):
        return f"{self.student.get_full_name()} bookmarked {self.note.title}"


class StudentNoteView(TimeStampedModel):
    """Track when students view notes"""
    note = models.ForeignKey(LectureNote, on_delete=models.CASCADE, related_name='student_views')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='note_views')
    viewed_at = models.DateTimeField(auto_now_add=True)
    time_spent = models.PositiveIntegerField(default=0, help_text='Time spent reading in seconds')
    
    class Meta:
        unique_together = ['note', 'student']
        verbose_name = 'Student Note View'
        verbose_name_plural = 'Student Note Views'
    
    def __str__(self):
        return f"{self.student.get_full_name()} viewed {self.note.title}"


class StudentPersonalNote(TimeStampedModel, SoftDeleteModel):
    """Students' personal notes on lecture notes"""
    lecture_note = models.ForeignKey(LectureNote, on_delete=models.CASCADE, related_name='student_notes')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='personal_notes')
    content = models.TextField()
    highlighted_text = models.TextField(blank=True)
    position = models.JSONField(null=True, blank=True, help_text='Position in the document')
    
    class Meta:
        verbose_name = 'Student Personal Note'
        verbose_name_plural = 'Student Personal Notes'
    
    def __str__(self):
        return f"{self.student.get_full_name()}'s note on {self.lecture_note.title}"
