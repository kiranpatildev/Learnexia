"""
User models and profiles
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator
from apps.core.models import TimeStampedModel, SoftDeleteModel


class CustomUserManager(BaseUserManager):
    """
    Custom user manager for email-based authentication
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser, TimeStampedModel, SoftDeleteModel):
    """
    Custom User model supporting multiple roles
    """
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent'),
        ('admin', 'Admin'),
    ]
    
    username = None  # Remove username, use email instead
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, db_index=True)
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    avatar = models.ImageField(upload_to='avatars/%Y/%m/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role', 'first_name', 'last_name']
    
    objects = CustomUserManager()
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email', 'role']),
            models.Index(fields=['is_active', 'role']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
    
    @property
    def full_name(self):
        return self.get_full_name()


class StudentProfile(TimeStampedModel):
    """
    Extended profile for students
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    grade = models.IntegerField(choices=[(i, f'Grade {i}') for i in range(1, 6)], null=True, blank=True)  # Grades 1-5
    date_of_birth = models.DateField(null=True, blank=True)
    guardian_name = models.CharField(max_length=255, blank=True)
    guardian_relationship = models.CharField(max_length=50, blank=True)
    emergency_contact = models.CharField(max_length=17, blank=True)
    address = models.TextField(blank=True)
    medical_notes = models.TextField(blank=True)
    
    # Gamification fields
    total_xp = models.PositiveIntegerField(default=0, db_index=True)
    current_level = models.PositiveIntegerField(default=1)
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'
        indexes = [
            models.Index(fields=['grade', '-total_xp']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Grade {self.grade if self.grade else 'N/A'}"


class TeacherProfile(TimeStampedModel):
    """
    Extended profile for teachers
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    specialization = models.CharField(max_length=100, blank=True)
    qualification = models.CharField(max_length=255, blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    date_of_joining = models.DateField(null=True, blank=True)
    bio = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Teacher Profile'
        verbose_name_plural = 'Teacher Profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.specialization if self.specialization else 'Teacher'}"


class ParentProfile(TimeStampedModel):
    """
    Extended profile for parents
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    occupation = models.CharField(max_length=100, blank=True)
    
    class Meta:
        verbose_name = 'Parent Profile'
        verbose_name_plural = 'Parent Profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name()}"


class ParentStudentRelationship(TimeStampedModel):
    """
    Links parents to their children
    """
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='children_relationships')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parent_relationships')
    relationship_type = models.CharField(
        max_length=50,
        choices=[
            ('father', 'Father'),
            ('mother', 'Mother'),
            ('guardian', 'Guardian'),
            ('other', 'Other'),
        ]
    )
    is_primary = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['parent', 'student']
        verbose_name = 'Parent-Student Relationship'
        verbose_name_plural = 'Parent-Student Relationships'
    
    def __str__(self):
        return f"{self.parent.get_full_name()} - {self.student.get_full_name()} ({self.relationship_type})"
