from django.contrib import admin
from .models import Lecture, LectureBookmark, LectureView, LectureResource


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ['title', 'classroom', 'teacher', 'status', 'is_shared_with_students', 'created_at']
    list_filter = ['status', 'is_shared_with_students', 'recording_type']
    search_fields = ['title', 'chapter', 'topic']


@admin.register(LectureBookmark)
class LectureBookmarkAdmin(admin.ModelAdmin):
    list_display = ['lecture', 'created_by', 'timestamp', 'title']


@admin.register(LectureView)
class LectureViewAdmin(admin.ModelAdmin):
    list_display = ['lecture', 'student', 'completion_percentage', 'started_at']


@admin.register(LectureResource)
class LectureResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'lecture', 'file_type', 'file_size']
