@echo off
echo ========================================
echo Creating Migrations for Lectures Module
echo ========================================
echo.

call venv\Scripts\activate.bat

echo Creating migrations...
python manage.py makemigrations lectures

echo.
echo Applying migrations...
python manage.py migrate

echo.
echo ========================================
echo Lectures Module Setup Complete!
echo ========================================
echo.
echo API Endpoints Available:
echo - POST   /api/v1/lectures/lectures/
echo - GET    /api/v1/lectures/lectures/
echo - GET    /api/v1/lectures/lectures/{id}/
echo - PUT    /api/v1/lectures/lectures/{id}/
echo - DELETE /api/v1/lectures/lectures/{id}/
echo - POST   /api/v1/lectures/lectures/{id}/share/
echo - POST   /api/v1/lectures/lectures/{id}/upload/
echo - GET    /api/v1/lectures/lectures/{id}/analytics/
echo - POST   /api/v1/lectures/lectures/{id}/start/
echo - PUT    /api/v1/lectures/lectures/{id}/progress/
echo - POST   /api/v1/lectures/lectures/{id}/complete/
echo.
echo - GET/POST /api/v1/lectures/bookmarks/
echo - GET/POST /api/v1/lectures/views/
echo - GET      /api/v1/lectures/views/summary/
echo - GET/POST /api/v1/lectures/resources/
echo - GET      /api/v1/lectures/resources/{id}/download/
echo.
echo Visit: http://localhost:8000/swagger/
echo.
pause
