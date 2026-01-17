"""
School structure models
"""

from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User


class School(TimeStampedModel, SoftDeleteModel):
    """
    School/Institution model
    """
    name = models.CharField(max_length=255, db_index=True)
    code = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    pincode = models.CharField(max_length=10)
    phone = models.CharField(max_length=17)
    email = models.EmailField()
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='schools/logos/', null=True, blank=True)
    principal_name = models.CharField(max_length=255)
    established_year = models.PositiveIntegerField()
    
    class Meta:
        verbose_name = 'School'
        verbose_name_plural = 'Schools'
    
    def __str__(self):
        return self.name


class AcademicYear(TimeStampedModel):
    """
    Academic year tracking
    """
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='academic_years')
    name = models.CharField(max_length=50)  # e.g., "2024-2025"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False, db_index=True)
    
    class Meta:
        unique_together = ['school', 'name']
        verbose_name = 'Academic Year'
        verbose_name_plural = 'Academic Years'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.school.name} - {self.name}"


class Subject(TimeStampedModel):
    """
    Subject/Course model
    """
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Icon name for frontend
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color code
    grade = models.IntegerField(choices=[(i, f'Grade {i}') for i in range(1, 6)])
    
    class Meta:
        unique_together = ['name', 'grade']
        verbose_name = 'Subject'
        verbose_name_plural = 'Subjects'
        ordering = ['grade', 'name']
    
    def __str__(self):
        return f"{self.name} - Grade {self.grade}"


class Classroom(TimeStampedModel, SoftDeleteModel):
    """
    Class/Section model
    """
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='classrooms')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='classrooms')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='classrooms')
    grade = models.IntegerField(choices=[(i, f'Grade {i}') for i in range(1, 6)])
    section = models.CharField(max_length=10)  # A, B, C, etc.
    teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='teaching_classes',
        limit_choices_to={'role': 'teacher'}
    )
    room_number = models.CharField(max_length=20, blank=True)
    max_students = models.PositiveIntegerField(default=30)
    class_code = models.CharField(max_length=20, unique=True)  # For student enrollment
    
    class Meta:
        unique_together = ['school', 'academic_year', 'subject', 'grade', 'section']
        verbose_name = 'Classroom'
        verbose_name_plural = 'Classrooms'
        indexes = [
            models.Index(fields=['school', 'academic_year', 'teacher']),
        ]
    
    def __str__(self):
        return f"{self.subject.name} - Grade {self.grade}{self.section}"


class ClassroomEnrollment(TimeStampedModel):
    """
    Student enrollment in classes
    """
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrolled_classes',
        limit_choices_to={'role': 'student'}
    )
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        unique_together = ['classroom', 'student']
        verbose_name = 'Classroom Enrollment'
        verbose_name_plural = 'Classroom Enrollments'
    
    def __str__(self):
        return f"{self.student.get_full_name()} in {self.classroom}"
