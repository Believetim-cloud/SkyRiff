@echo off
chcp 65001 >nul
echo ========================================
echo 🔍 SkyRiff 环境检查工具
echo ========================================
echo.

:: 1. 检查Python
echo [1/7] 检查 Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装
    echo 请安装 Python 3.10+: https://www.python.org/downloads/
    goto :end
) else (
    for /f "tokens=*" %%i in ('python --version') do echo ✅ %%i
)
echo.

:: 2. 检查 pip
echo [2/7] 检查 pip...
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip 未安装
    goto :end
) else (
    for /f "tokens=*" %%i in ('python -m pip --version') do echo ✅ %%i
)
echo.

:: 3. 检查关键依赖
echo [3/7] 检查 Python 依赖...
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo ❌ FastAPI 未安装
    echo 请运行: 🚀一键安装依赖.bat
) else (
    python -c "import fastapi; print('✅ FastAPI:', fastapi.__version__)"
)

python -c "import uvicorn" 2>nul
if errorlevel 1 (
    echo ❌ Uvicorn 未安装
) else (
    python -c "import uvicorn; print('✅ Uvicorn:', uvicorn.__version__)"
)

python -c "import sqlalchemy" 2>nul
if errorlevel 1 (
    echo ❌ SQLAlchemy 未安装
) else (
    python -c "import sqlalchemy; print('✅ SQLAlchemy:', sqlalchemy.__version__)"
)

python -c "import pydantic_settings" 2>nul
if errorlevel 1 (
    echo ❌ Pydantic Settings 未安装
) else (
    echo ✅ Pydantic Settings: 已安装
)

python -c "import jwt" 2>nul
if errorlevel 1 (
    echo ❌ PyJWT 未安装
) else (
    echo ✅ PyJWT: 已安装
)
echo.

:: 4. 检查 PostgreSQL
echo [4/7] 检查 PostgreSQL...
python -c "import psycopg2" 2>nul
if errorlevel 1 (
    echo ❌ psycopg2 未安装
) else (
    echo ✅ psycopg2: 已安装
)

:: 尝试连接数据库
python -c "import psycopg2; psycopg2.connect('postgresql://skyriff:skyriff123@localhost:5432/skyriff_db')" 2>nul
if errorlevel 1 (
    echo ⚠️  无法连接到 PostgreSQL
    echo    请确保 PostgreSQL 已启动（端口 5432）
    echo    数据库: skyriff_db
    echo    用户: skyriff
    echo    密码: skyriff123
) else (
    echo ✅ PostgreSQL 连接成功
)
echo.

:: 5. 检查 .env 文件
echo [5/7] 检查配置文件...
if exist .env (
    echo ✅ .env 文件存在
    echo.
    echo 配置内容:
    type .env
) else (
    echo ⚠️  .env 文件不存在
    echo 将使用默认配置
)
echo.

:: 6. 检查端口占用
echo [6/7] 检查端口 8000...
netstat -ano | findstr :8000 >nul
if errorlevel 1 (
    echo ✅ 端口 8000 可用
) else (
    echo ⚠️  端口 8000 已被占用
    echo.
    echo 占用端口的进程:
    netstat -ano | findstr :8000
)
echo.

:: 7. 检查目录结构
echo [7/7] 检查项目结构...
if exist app\main.py (
    echo ✅ app\main.py 存在
) else (
    echo ❌ app\main.py 不存在
)

if exist app\api (
    echo ✅ app\api 目录存在
) else (
    echo ❌ app\api 目录不存在
)

if exist requirements.txt (
    echo ✅ requirements.txt 存在
) else (
    echo ❌ requirements.txt 不存在
)
echo.

:: 总结
echo ========================================
echo 📊 检查完成
echo ========================================
echo.
echo 💡 下一步:
echo 1. 如果依赖未安装，运行 "🚀一键安装依赖.bat"
echo 2. 如果 PostgreSQL 未启动，启动数据库服务
echo 3. 运行 "启动后端.bat" 启动服务器
echo.

:end
pause
