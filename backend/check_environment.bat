@echo off
chcp 65001 >nul
echo ========================================
echo SkyRiff Environment Check Tool
echo ========================================
echo.

:: 1. Check Python
echo [1/7] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python not installed
    echo Please install Python 3.10+: https://www.python.org/downloads/
    goto :end
) else (
    for /f "tokens=*" %%i in ('python --version') do echo [OK] %%i
)
echo.

:: 2. Check pip
echo [2/7] Checking pip...
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo [X] pip not installed
    goto :end
) else (
    for /f "tokens=*" %%i in ('python -m pip --version') do echo [OK] %%i
)
echo.

:: 3. Check Python dependencies
echo [3/7] Checking Python dependencies...
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo [X] FastAPI not installed
    echo Please run: install_dependencies.bat
) else (
    python -c "import fastapi; print('[OK] FastAPI:', fastapi.__version__)"
)

python -c "import uvicorn" 2>nul
if errorlevel 1 (
    echo [X] Uvicorn not installed
) else (
    python -c "import uvicorn; print('[OK] Uvicorn:', uvicorn.__version__)"
)

python -c "import sqlalchemy" 2>nul
if errorlevel 1 (
    echo [X] SQLAlchemy not installed
) else (
    python -c "import sqlalchemy; print('[OK] SQLAlchemy:', sqlalchemy.__version__)"
)

python -c "import pydantic_settings" 2>nul
if errorlevel 1 (
    echo [X] Pydantic Settings not installed
) else (
    echo [OK] Pydantic Settings: installed
)

python -c "import jwt" 2>nul
if errorlevel 1 (
    echo [X] PyJWT not installed
) else (
    echo [OK] PyJWT: installed
)
echo.

:: 4. Check PostgreSQL
echo [4/7] Checking PostgreSQL...
python -c "import psycopg2" 2>nul
if errorlevel 1 (
    echo [X] psycopg2 not installed
) else (
    echo [OK] psycopg2: installed
)

:: Try to connect to database
python -c "import psycopg2; psycopg2.connect('postgresql://skyriff:skyriff123@localhost:5432/skyriff_db')" 2>nul
if errorlevel 1 (
    echo [WARNING] Cannot connect to PostgreSQL
    echo    Please ensure PostgreSQL is running (port 5432)
    echo    Database: skyriff_db
    echo    User: skyriff
    echo    Password: skyriff123
) else (
    echo [OK] PostgreSQL connection successful
)
echo.

:: 5. Check .env file
echo [5/7] Checking configuration file...
if exist .env (
    echo [OK] .env file exists
    echo.
    echo Configuration content:
    type .env
) else (
    echo [WARNING] .env file not found
    echo Using default configuration
)
echo.

:: 6. Check port availability
echo [6/7] Checking port 8000...
netstat -ano | findstr :8000 >nul
if errorlevel 1 (
    echo [OK] Port 8000 is available
) else (
    echo [WARNING] Port 8000 is already in use
    echo.
    echo Processes using port 8000:
    netstat -ano | findstr :8000
)
echo.

:: 7. Check project structure
echo [7/7] Checking project structure...
if exist app\main.py (
    echo [OK] app\main.py exists
) else (
    echo [X] app\main.py not found
)

if exist app\api (
    echo [OK] app\api directory exists
) else (
    echo [X] app\api directory not found
)

if exist requirements.txt (
    echo [OK] requirements.txt exists
) else (
    echo [X] requirements.txt not found
)
echo.

:: Summary
echo ========================================
echo Check completed
echo ========================================
echo.
echo Next steps:
echo 1. If dependencies not installed, run "install_dependencies.bat"
echo 2. If PostgreSQL not running, start database service
echo 3. Run "start_backend.bat" to start the server
echo.

:end
pause
