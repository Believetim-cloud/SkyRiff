@echo off
chcp 65001 >nul
echo ========================================
echo SkyRiff Backend Server Startup
echo ========================================
echo.

:: Check dependencies
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo [ERROR] Dependencies not installed
    echo.
    echo Please run: install_dependencies.bat first
    pause
    exit /b 1
)

:: Check .env file
if not exist .env (
    echo [WARNING] .env file not found
    echo Using default configuration...
    echo.
)

echo [OK] Dependencies check passed
echo.
echo ========================================
echo Server Configuration
echo ========================================
echo Address: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Health Check: http://localhost:8000/health
echo.
echo ========================================
echo Starting server...
echo ========================================
echo.

:: Start server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
