@echo off
echo ========================================
echo Setting Up Assignments, Assessments, and Attendance Apps
echo ========================================
echo.

call venv\Scripts\activate.bat

echo Creating migrations for all three apps...
python manage.py makemigrations assignments assessments attendance

echo.
echo Applying migrations...
python manage.py migrate

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Apps Ready:
echo - Assignments (homework, submissions, grading)
echo - Assessments (quizzes, questions, attempts)
echo - Attendance (daily tracking, statistics)
echo.
echo All apps include AI placeholders for future implementation
echo.
echo Visit: http://localhost:8000/swagger/
echo.
pause
