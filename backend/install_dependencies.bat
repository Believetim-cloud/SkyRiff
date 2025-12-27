@echo off
chcp 65001 >nul
echo ========================================
echo SkyRiff Dependencies Installation
echo Using Tsinghua Mirror (China Mainland)
echo ========================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not detected
    echo Please install Python 3.10 or higher
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python detected:
python --version
echo.

:: Check pip
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip not installed
    pause
    exit /b 1
)

echo [OK] pip detected:
python -m pip --version
echo.

echo ========================================
echo Installing dependencies...
echo ========================================
echo.

:: Upgrade pip
echo [1/2] Upgrading pip...
python -m pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple
echo.

:: Install dependencies
echo [2/2] Installing project dependencies (may take 2-5 minutes)...
python -m pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
echo.

if errorlevel 1 (
    echo [ERROR] Installation failed!
    echo.
    echo Common solutions:
    echo 1. Check network connection
    echo 2. Try international mirror:
    echo    python -m pip install -r requirements.txt
    echo 3. Ensure Python version ^>= 3.10
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.

:: Verify key dependencies
echo [INFO] Verifying key dependencies...
python -c "import fastapi; print('[OK] FastAPI:', fastapi.__version__)" 2>nul
python -c "import uvicorn; print('[OK] Uvicorn:', uvicorn.__version__)" 2>nul
python -c "import sqlalchemy; print('[OK] SQLAlchemy:', sqlalchemy.__version__)" 2>nul
python -c "import pydantic; print('[OK] Pydantic:', pydantic.__version__)" 2>nul
python -c "import pydantic_settings; print('[OK] Pydantic Settings: installed')" 2>nul
python -c "import jwt; print('[OK] PyJWT: installed')" 2>nul
echo.

echo ========================================
echo Success!
echo ========================================
echo.
echo Next steps:
echo 1. Ensure PostgreSQL is running (port 5432)
echo 2. Run "start_backend.bat" to start the server
echo 3. Visit http://localhost:8000/health to test
echo.

pause
