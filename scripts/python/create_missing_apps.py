"""
Quick script to create all missing app files
"""
import os

APPS = [
    'assignments', 'assessments', 'gamification', 'attendance',
    'performance', 'communication', 'behavior', 'resources',
    'notifications', 'reports'
]

for app in APPS:
    app_dir = f'apps/{app}'
    os.makedirs(app_dir, exist_ok=True)
    
    # apps.py
    with open(f'{app_dir}/apps.py', 'w') as f:
        class_name = ''.join(word.capitalize() for word in app.split('_'))
        f.write(f"""from django.apps import AppConfig


class {class_name}Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.{app}'
""")
    
    # models.py
    with open(f'{app_dir}/models.py', 'w') as f:
        f.write(f"# {app.capitalize()} models\nfrom django.db import models\n")
    
    # admin.py
    with open(f'{app_dir}/admin.py', 'w') as f:
        f.write("from django.contrib import admin\n")
    
    # urls.py
    with open(f'{app_dir}/urls.py', 'w') as f:
        f.write("from django.urls import path\n\nurlpatterns = []\n")
    
    print(f"✓ Created {app}")

print("\n✓ All apps created successfully!")
