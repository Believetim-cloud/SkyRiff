@echo off
chcp 65001 >nul
echo.
echo ========================================
echo SkyRiff Quick Setup and Start
echo ========================================
echo.

:: Step 1: Check Python
echo [Step 1/4] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not installed
    echo Please install Python 3.10+ first
    pause
    exit /b 1
)
python --version
echo.

:: Step 2: Check dependencies
echo [Step 2/4] Checking dependencies...
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo [WARNING] Dependencies not installed
    echo Installing dependencies...
    echo.
    call install_dependencies.bat
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies already installed
)
echo.

:: Step 3: Initialize database
echo [Step 3/4] Initializing database...
if exist skyriff.db (
    echo [INFO] Database file already exists
    choice /M "Do you want to recreate the database (this will delete all data)?"
    if errorlevel 2 (
        echo [INFO] Keeping existing database
        goto :skip_init
    )
    echo [INFO] Deleting existing database...
    del skyriff.db
)

python init_database.py
if errorlevel 1 (
    echo [ERROR] Database initialization failed
    pause
    exit /b 1
)
echo.

:skip_init

:: Step 4: Start backend
echo [Step 4/4] Starting backend server...
echo.
echo ========================================
echo Server will start in 3 seconds...
echo ========================================
echo.
timeout /t 3 /nobreak >nul

start_backend.bat
