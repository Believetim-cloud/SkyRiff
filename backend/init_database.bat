@echo off
chcp 65001 >nul
echo ========================================
echo SkyRiff Database Initialization
echo ========================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not detected
    echo Please install Python first
    pause
    exit /b 1
)

echo [OK] Python detected
echo.

:: Check if .env exists
if not exist .env (
    echo [WARNING] .env file not found
    echo Creating .env from template...
    copy .env.example .env >nul
    echo [OK] .env file created
    echo.
)

echo ========================================
echo Initializing database...
echo ========================================
echo.

:: Run initialization script
python init_database.py

if errorlevel 1 (
    echo.
    echo ========================================
    echo [ERROR] Database initialization failed!
    echo ========================================
    echo.
    echo Troubleshooting:
    echo   1. Check .env file configuration
    echo   2. Ensure database is accessible
    echo   3. Check Python dependencies installed
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Database initialized successfully!
echo ========================================
echo.
echo Next step:
echo   Run "start_backend.bat" to start the server
echo.

pause
