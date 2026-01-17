@echo off
echo ========================================
echo Creating Frontend INSIDE Project
echo ========================================
echo.

cd C:\Users\HOME\Desktop\premium_edu_platform

echo Creating React frontend in ./frontend folder...
call npm create vite@latest frontend -- --template react

echo.
echo ========================================
echo Frontend folder created!
echo ========================================
echo.
echo Next: cd frontend and install dependencies
echo.
pause
