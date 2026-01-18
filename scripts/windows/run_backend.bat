@echo off
REM Quick start script for backend server

echo Starting Premium Edu Platform Backend...
echo.

REM Activate virtual environment
call venv\Scripts\activate

REM Navigate to backend and run server
cd backend
python manage.py runserver

pause
