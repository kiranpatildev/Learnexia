"""
Script to create placeholder files for remaining Django apps
Run this script to generate basic structure for all remaining apps
"""

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Apps to create with their basic info
APPS_TO_CREATE = [
    'notes',
    'assignments',
    'assessments',
    'gamification',
    'attendance',
    'performance',
    'communication',
    'behavior',
    'resources',
    'notifications',
    'reports',
]

def create_app_structure(app_name):
    """Create basic structure for a Django app"""
    app_dir = BASE_DIR / 'apps' / app_name
    app_dir.mkdir(parents=True, exist_ok=True)
    
    # Create __init__.py
    (app_dir / '__init__.py').write_text(f"# {app_name.capitalize()} app\n")
    
    # Create apps.py
    class_name = ''.join(word.capitalize() for word in app_name.split('_'))
    apps_content = f"""from django.apps import AppConfig


class {class_name}Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.{app_name}'
    verbose_name = '{app_name.capitalize()}'
"""
    (app_dir / 'apps.py').write_text(apps_content)
    
    # Create models.py placeholder
    models_content = f"""\"\"\"
Models for {app_name} app
TODO: Copy models from the specification document
\"\"\"

from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User
from apps.schools.models import Classroom

# TODO: Add your models here
"""
    (app_dir / 'models.py').write_text(models_content)
    
    # Create serializers.py placeholder
    serializers_content = f"""\"\"\"
Serializers for {app_name} app
\"\"\"

from rest_framework import serializers
from .models import *

# TODO: Add your serializers here
"""
    (app_dir / 'serializers.py').write_text(serializers_content)
    
    # Create views.py placeholder
    views_content = f"""\"\"\"
Views for {app_name} app
\"\"\"

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *

# TODO: Add your viewsets here
"""
    (app_dir / 'views.py').write_text(views_content)
    
    # Create urls.py
    urls_content = f"""\"\"\"
URL Configuration for {app_name} app
\"\"\"

from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# TODO: Register your viewsets here

urlpatterns = [
    path('', include(router.urls)),
]
"""
    (app_dir / 'urls.py').write_text(urls_content)
    
    # Create admin.py
    admin_content = f"""\"\"\"
Admin configuration for {app_name} app
\"\"\"

from django.contrib import admin
from .models import *

# TODO: Register your models here
"""
    (app_dir / 'admin.py').write_text(admin_content)
    
    print(f"✓ Created app structure for: {app_name}")


if __name__ == '__main__':
    print("Creating Django app structures...")
    print("=" * 50)
    
    for app_name in APPS_TO_CREATE:
        create_app_structure(app_name)
    
    print("=" * 50)
    print(f"✓ Successfully created {len(APPS_TO_CREATE)} app structures!")
    print("\nNext steps:")
    print("1. Copy models from specification to each app's models.py")
    print("2. Create serializers for each model")
    print("3. Create viewsets for each model")
    print("4. Register viewsets in urls.py")
    print("5. Register models in admin.py")
    print("6. Run: python manage.py makemigrations")
    print("7. Run: python manage.py migrate")
