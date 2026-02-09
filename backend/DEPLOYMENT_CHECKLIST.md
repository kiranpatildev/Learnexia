# Django Production Deployment Checklist

## ✅ COMPLETED CONFIGURATION

### 1. Requirements (requirements/requirements.txt)
- ✅ Django==4.2.7
- ✅ gunicorn==21.2.0
- ✅ psycopg2-binary==2.9.9
- ✅ dj-database-url==2.1.0 (ADDED)
- ✅ python-decouple==3.8
- ✅ django-cors-headers==4.3.0
- ✅ whitenoise==6.6.0

### 2. Production Settings (config/settings/production.py)
- ✅ Imports: os, dj_database_url, config from decouple
- ✅ SECRET_KEY = config("SECRET_KEY", default="...")
- ✅ DEBUG = config("DEBUG", default=False, cast=bool)
- ✅ ALLOWED_HOSTS = config("ALLOWED_HOSTS", ...).split(",")
- ✅ DATABASES using dj_database_url with DATABASE_URL
- ✅ CORS_ALLOWED_ORIGINS configuration
- ✅ SSL/Security settings configured
- ✅ WhiteNoise for static files

### 3. Base Settings (config/settings/base.py)
- ✅ corsheaders in INSTALLED_APPS
- ✅ CorsMiddleware in MIDDLEWARE
- ✅ WhiteNoiseMiddleware in MIDDLEWARE
- ✅ STATIC_URL = '/static/'
- ✅ STATIC_ROOT = BASE_DIR / 'staticfiles'
- ✅ STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

### 4. Deployment Files
- ✅ Procfile created: `web: gunicorn config.wsgi --log-file -`
- ✅ runtime.txt created: `python-3.11.0`

## 📋 ENVIRONMENT VARIABLES NEEDED FOR RAILWAY

Create these in Railway dashboard:

```env
# Django Core
SECRET_KEY=<generate-a-strong-secret-key>
DEBUG=False
DJANGO_SETTINGS_MODULE=config.settings.production

# Database (from Supabase)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Hosts
ALLOWED_HOSTS=your-app.railway.app,yourdomain.com

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://yourdomain.com

# Optional
SENTRY_DSN=<your-sentry-dsn-if-using>
```

## 🚀 DEPLOYMENT STEPS

1. Push code to GitHub
2. Create Railway project
3. Connect GitHub repository
4. Add environment variables
5. Deploy!

## ⚠️ IMPORTANT NOTES

- Your project uses split settings (base.py, production.py, development.py)
- Make sure DJANGO_SETTINGS_MODULE=config.settings.production in Railway
- Database uses SSL by default (ssl_require=True)
- Static files handled by WhiteNoise
- WSGI application is at config.wsgi (not learnexia.wsgi)

## 🔐 SECURITY CHECKLIST

- ✅ DEBUG=False in production
- ✅ SECRET_KEY from environment variable
- ✅ ALLOWED_HOSTS configured
- ✅ SSL redirect enabled
- ✅ Secure cookies enabled
- ✅ HSTS enabled
- ✅ CORS properly configured
