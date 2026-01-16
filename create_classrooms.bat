@echo off
echo ========================================
echo   Creating Sample Classrooms
echo ========================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run the script
python create_classrooms.py

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo Press any key to exit...
pause >nul
