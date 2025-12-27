@echo off
chcp 65001 >nul
echo ========================================
echo SkyRiff Configuration Setup
echo ========================================
echo.

:: Check if .env exists
if exist .env (
    echo [INFO] .env file already exists
    echo.
    choice /M "Do you want to overwrite it with default configuration?"
    if errorlevel 2 (
        echo.
        echo [INFO] Keeping existing .env file
        goto :show_config
    )
    echo.
    echo [INFO] Creating backup of existing .env file...
    copy .env .env.backup >nul
    echo [OK] Backup saved to .env.backup
    echo.
)

:: Create .env from template
echo [INFO] Creating .env file from template...
copy .env.example .env >nul

if errorlevel 1 (
    echo [ERROR] Failed to create .env file
    pause
    exit /b 1
)

echo [OK] .env file created successfully!
echo.

:show_config
echo ========================================
echo Current Configuration
echo ========================================
echo.
type .env
echo.

echo ========================================
echo Configuration Ready!
echo ========================================
echo.
echo Default settings:
echo   - Database: SQLite (no PostgreSQL needed)
echo   - Storage: Local file system
echo   - SMS Provider: Mock (no real SMS)
echo.
echo You can now start the backend:
echo   start_backend.bat
echo.

pause
