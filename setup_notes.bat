@echo off
echo ========================================
echo Creating Migrations for Notes Module
echo ========================================
echo.

call venv\Scripts\activate.bat

echo Creating migrations...
python manage.py makemigrations notes

echo.
echo Applying migrations...
python manage.py migrate

echo.
echo ========================================
echo Notes Module Setup Complete!
echo ========================================
echo.
echo API Endpoints Available:
echo.
echo Templates:
echo - GET/POST /api/v1/notes/templates/
echo - GET/PUT/DELETE /api/v1/notes/templates/{id}/
echo.
echo Notes:
echo - GET/POST /api/v1/notes/notes/
echo - GET/PUT/DELETE /api/v1/notes/notes/{id}/
echo - POST /api/v1/notes/notes/{id}/publish/
echo - POST /api/v1/notes/notes/{id}/unpublish/
echo - POST /api/v1/notes/notes/{id}/duplicate/
echo - GET  /api/v1/notes/notes/{id}/analytics/
echo - POST /api/v1/notes/notes/{id}/bookmark/
echo - DELETE /api/v1/notes/notes/{id}/unbookmark/
echo - GET  /api/v1/notes/notes/my-bookmarks/
echo - POST /api/v1/notes/notes/{id}/track_view/
echo - POST /api/v1/notes/notes/{id}/generate_pdf/
echo - POST /api/v1/notes/notes/from_template/
echo.
echo Bookmarks:
echo - GET /api/v1/notes/bookmarks/
echo.
echo Annotations:
echo - GET/POST /api/v1/notes/annotations/
echo - GET/PUT/DELETE /api/v1/notes/annotations/{id}/
echo.
echo Visit: http://localhost:8000/swagger/
echo.
pause
