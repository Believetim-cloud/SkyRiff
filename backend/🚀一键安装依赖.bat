@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 SkyRiff 后端依赖安装脚本
echo ========================================
echo.

:: 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到 Python
    echo 请先安装 Python 3.10 或更高版本
    echo 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ 检测到 Python：
python --version
echo.

:: 检查pip
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：pip 未安装
    pause
    exit /b 1
)

echo ✅ 检测到 pip：
python -m pip --version
echo.

echo ========================================
echo 📦 开始安装依赖...
echo ========================================
echo.

:: 升级pip
echo 📦 升级 pip...
python -m pip install --upgrade pip
echo.

:: 安装依赖
echo 📦 安装项目依赖（这可能需要几分钟）...
python -m pip install -r requirements.txt
echo.

if errorlevel 1 (
    echo ❌ 依赖安装失败！
    echo.
    echo 💡 常见解决方法：
    echo 1. 检查网络连接
    echo 2. 使用国内镜像：
    echo    python -m pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
    echo 3. 确保 Python 版本 ^>= 3.10
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 依赖安装完成！
echo ========================================
echo.

:: 检查关键依赖
echo 🔍 验证关键依赖...
python -c "import fastapi; print('✅ FastAPI:', fastapi.__version__)" 2>nul
python -c "import uvicorn; print('✅ Uvicorn:', uvicorn.__version__)" 2>nul
python -c "import sqlalchemy; print('✅ SQLAlchemy:', sqlalchemy.__version__)" 2>nul
python -c "import pydantic; print('✅ Pydantic:', pydantic.__version__)" 2>nul
python -c "import pydantic_settings; print('✅ Pydantic Settings: 已安装')" 2>nul
python -c "import jwt; print('✅ PyJWT: 已安装')" 2>nul
echo.

echo ========================================
echo 🎉 安装成功！
echo ========================================
echo.
echo 💡 下一步：
echo 1. 确保 PostgreSQL 已启动（端口 5432）
echo 2. 运行 "启动后端.bat" 启动服务器
echo 3. 访问 http://localhost:8000/health 测试
echo.

pause
