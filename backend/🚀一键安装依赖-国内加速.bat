@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 SkyRiff 后端依赖安装脚本（国内加速）
echo ========================================
echo.
echo 💡 使用清华大学镜像源，速度更快！
echo.

:: 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到 Python
    echo 请先安装 Python 3.10 或更高版本
    pause
    exit /b 1
)

echo ✅ 检测到 Python：
python --version
echo.

echo ========================================
echo 📦 开始安装依赖（使用清华镜像源）...
echo ========================================
echo.

:: 升级pip（使用清华镜像）
echo 📦 升级 pip...
python -m pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple
echo.

:: 安装依赖（使用清华镜像）
echo 📦 安装项目依赖...
python -m pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
echo.

if errorlevel 1 (
    echo ❌ 依赖安装失败！
    echo.
    echo 💡 尝试使用阿里云镜像：
    echo python -m pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 依赖安装完成！
echo ========================================
echo.

:: 验证安装
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
echo 💡 下一步：运行 "启动后端.bat" 启动服务器
echo.

pause
