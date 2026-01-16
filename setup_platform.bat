@echo off
echo ========================================
echo   COMPLETE PLATFORM SETUP
echo ========================================
echo.
echo This will create:
echo   - School structure
echo   - Admin, Teachers, Students
echo   - Classrooms with enrollments
echo   - All necessary relationships
echo.
pause

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run setup script
python setup_complete_platform.py

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Press any key to exit...
pause >nul
