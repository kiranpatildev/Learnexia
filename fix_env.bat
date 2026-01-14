@echo off
echo ========================================
echo Fixing .env File
echo ========================================
echo.

echo Creating correct .env file...

(
echo # Django Settings
echo SECRET_KEY=your-secret-key-here-change-in-production
echo DEBUG=True
echo ALLOWED_HOSTS=localhost,127.0.0.1
echo.
echo # Database
echo DB_NAME=premium_edu_platform
echo DB_USER=postgres
echo DB_PASSWORD=KIRAN
echo DB_HOST=localhost
echo DB_PORT=5432
echo.
echo # Redis
echo REDIS_URL=redis://localhost:6379/0
echo.
echo # Email Configuration
echo EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
echo EMAIL_HOST=smtp.gmail.com
echo EMAIL_PORT=587
echo EMAIL_USE_TLS=True
echo EMAIL_HOST_USER=your-email@gmail.com
echo EMAIL_HOST_PASSWORD=your-email-password
echo.
echo # AWS S3 ^(for production file storage^)
echo AWS_ACCESS_KEY_ID=
echo AWS_SECRET_ACCESS_KEY=
echo AWS_STORAGE_BUCKET_NAME=
echo AWS_S3_REGION_NAME=us-east-1
echo.
echo # Sentry ^(for error tracking^)
echo SENTRY_DSN=
echo.
echo # CORS Settings
echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
echo.
echo # JWT Settings
echo JWT_ACCESS_TOKEN_LIFETIME=60
echo JWT_REFRESH_TOKEN_LIFETIME=1440
) > .env

echo .env file created successfully!
echo.
echo Verifying configuration...
call venv\Scripts\activate.bat
python -c "from decouple import config; print(f'DB_NAME: {config(\"DB_NAME\")}'); print(f'DB_USER: {config(\"DB_USER\")}'); print(f'DB_PASSWORD: {config(\"DB_PASSWORD\")}'); print(f'DB_HOST: {config(\"DB_HOST\")}'); print(f'DB_PORT: {config(\"DB_PORT\")}')"

echo.
echo ========================================
echo Configuration Fixed!
echo ========================================
echo.
echo Now run: python manage.py migrate
echo.
pause
