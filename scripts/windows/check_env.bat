@echo off
echo ========================================
echo Checking Database Configuration
echo ========================================
echo.

call venv\Scripts\activate.bat

echo Checking if .env file exists...
if exist .env (
    echo .env file found
    echo.
    echo Current .env contents:
    type .env
) else (
    echo .env file NOT found! Creating from .env.example...
    copy .env.example .env
    echo.
    echo Please edit .env file and set DB_PASSWORD=KIRAN
)

echo.
echo ========================================
echo Testing Database Connection
echo ========================================
python -c "from decouple import config; print(f'DB_NAME: {config(\"DB_NAME\", default=\"not set\")}'); print(f'DB_USER: {config(\"DB_USER\", default=\"not set\")}'); print(f'DB_PASSWORD: {config(\"DB_PASSWORD\", default=\"not set\")}'); print(f'DB_HOST: {config(\"DB_HOST\", default=\"not set\")}'); print(f'DB_PORT: {config(\"DB_PORT\", default=\"not set\")}')"

echo.
pause
