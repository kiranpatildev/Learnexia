# Environment Setup Guide

## 📋 Quick Start

### 1. Create Your Environment File

Copy the example file and update with your actual credentials:

```bash
copy .env.example .env
```

### 2. Update Required Variables

Open `.env` and replace the placeholders with your actual values:

#### **Django Settings**
```bash
SECRET_KEY=generate-a-secure-random-key-here
DEBUG=True  # Set to False in production
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
```

**Generate a secure SECRET_KEY:**
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### **Database (PostgreSQL)**
```bash
DB_NAME=premium_edu_platform
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

**Note:** For development, you can use SQLite by setting `USE_POSTGRES=False` in `.env`

#### **Email (Optional for development)**
```bash
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
```

**Gmail App Password:** https://support.google.com/accounts/answer/185833

#### **AWS S3 (Optional - for production file storage)**
```bash
AWS_ACCESS_KEY_ID=your_actual_aws_key
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret
AWS_STORAGE_BUCKET_NAME=your_bucket_name
```

#### **Sentry (Optional - for error tracking)**
```bash
SENTRY_DSN=https://your-sentry-dsn-url
```

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep `.env` file in `.gitignore` (already configured)
- ✅ Use strong, unique passwords for database
- ✅ Generate a new SECRET_KEY for production
- ✅ Use environment-specific settings (dev/staging/prod)
- ✅ Rotate credentials regularly
- ✅ Use app-specific passwords for email

### ❌ DON'T:
- ❌ Never commit `.env` to version control
- ❌ Never share your `.env` file
- ❌ Never use default/example passwords in production
- ❌ Never expose SECRET_KEY publicly
- ❌ Never use DEBUG=True in production

---

## 🗄️ Database Setup

### Option 1: PostgreSQL (Recommended)

1. **Install PostgreSQL:**
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=yourpassword postgres`

2. **Create Database:**
   ```sql
   CREATE DATABASE premium_edu_platform;
   ```

3. **Update `.env`:**
   ```bash
   DB_NAME=premium_edu_platform
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

### Option 2: SQLite (Development Only)

Add to `.env`:
```bash
USE_POSTGRES=False
```

SQLite requires no additional setup but is not recommended for production.

---

## 🚀 After Configuration

1. **Run Migrations:**
   ```bash
   python manage.py migrate
   ```

2. **Create Superuser:**
   ```bash
   python manage.py createsuperuser
   ```

3. **Start Development Server:**
   ```bash
   python manage.py runserver
   ```

4. **Visit:**
   - Admin: http://localhost:8000/admin/
   - API Docs: http://localhost:8000/swagger/

---

## 📝 Example .env File

Here's a complete example with dummy values:

```bash
# Django Settings
SECRET_KEY=django-insecure-example-key-change-this-in-production-abc123xyz789
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=premium_edu_platform
DB_USER=postgres
DB_PASSWORD=MySecurePassword123!
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email (Gmail example)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=myapp@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop

# AWS S3 (leave empty if not using)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=us-east-1

# Sentry (leave empty if not using)
SENTRY_DSN=

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440
```

---

## ❓ Troubleshooting

### Database Connection Errors

**Error:** `password authentication failed for user "postgres"`

**Solution:**
1. Verify PostgreSQL is running
2. Check password in `.env` matches PostgreSQL password
3. Try connecting with `psql -U postgres` to verify credentials

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'decouple'`

**Solution:**
```bash
pip install python-decouple
```

### SECRET_KEY Errors

**Error:** `django.core.exceptions.ImproperlyConfigured: The SECRET_KEY setting must not be empty`

**Solution:**
Generate a new key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## 🔗 Additional Resources

- [Django Settings Best Practices](https://docs.djangoproject.com/en/stable/topics/settings/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [python-decouple Documentation](https://github.com/HBNetwork/python-decouple)
- [Django Environment Variables](https://django-environ.readthedocs.io/)
