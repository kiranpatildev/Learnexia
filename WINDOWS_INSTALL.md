# Windows Installation Guide

## Issue: psycopg2-binary build error

The error you're seeing is common on Windows. Here are the solutions:

## Solution 1: Use SQLite for Development (Easiest)

Instead of PostgreSQL, use SQLite which requires no installation:

1. **Activate virtual environment:**
```bash
venv\Scripts\activate
```

2. **Install minimal requirements:**
```bash
pip install -r requirements-minimal.txt
```

3. **Update settings to use SQLite:**
Edit `config/settings/development.py` and change the database to:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

4. **Run migrations:**
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Solution 2: Install PostgreSQL Binary (Recommended for Production-like Setup)

1. **Download and install PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 14 or later
   - Install with default settings
   - Remember the password you set for the 'postgres' user

2. **Activate virtual environment:**
```bash
venv\Scripts\activate
```

3. **Try installing again:**
```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements-minimal.txt
```

4. **Create database:**
```bash
# Open Command Prompt as Administrator
psql -U postgres
CREATE DATABASE premium_edu_db;
\q
```

5. **Update .env file:**
```
DB_NAME=premium_edu_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

6. **Run migrations:**
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Solution 3: Use Docker (Best for Consistency)

This avoids all Windows-specific issues:

1. **Install Docker Desktop:**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and restart your computer

2. **Start the application:**
```bash
docker-compose up -d
```

3. **Create superuser:**
```bash
docker-compose exec web python manage.py createsuperuser
```

4. **Access the application:**
   - Admin: http://localhost:8000/admin/
   - API: http://localhost:8000/api/v1/
   - Swagger: http://localhost:8000/swagger/

## Quick Fix for Current Error

The immediate issue is that `psycopg2-binary` version 2.9.9 has build issues on Windows.

**Quick fix:**
```bash
# Activate virtual environment
venv\Scripts\activate

# Install just the core packages one by one
pip install Django==4.2.7
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.0
pip install djangorestframework-simplejwt==5.3.0
pip install python-decouple==3.8
pip install drf-yasg==1.21.7
pip install whitenoise==6.6.0

# For database, choose ONE:
# Option A: Skip PostgreSQL, use SQLite (built into Python)
# Option B: Install PostgreSQL binary
pip install psycopg2-binary==2.9.10
```

## Recommended Approach for You

**Use SQLite for now** (fastest way to get started):

1. Activate venv: `venv\Scripts\activate`
2. Install core packages: `pip install -r requirements-minimal.txt`
3. Edit `config/settings/development.py` to use SQLite (see Solution 1)
4. Run: `python manage.py migrate`
5. Run: `python manage.py createsuperuser`
6. Run: `python manage.py runserver`

You can always switch to PostgreSQL later when you're ready to deploy!
