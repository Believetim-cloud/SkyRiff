@echo off
chcp 65001 >nul
title SkyRiff 后端服务 - 一键启动
color 0A

echo.
echo ═══════════════════════════════════════════
echo    🚀 SkyRiff 后端服务 - 一键启动
echo ═══════════════════════════════════════════
echo.

:: 获取当前脚本所在目录
set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"

echo 📁 项目目录: %PROJECT_ROOT%
echo 📁 后端目录: %BACKEND_DIR%
echo.

:: 检查后端目录是否存在
if not exist "%BACKEND_DIR%" (
    echo ❌ 错误：找不到 backend 目录！
    echo.
    echo 请确保此脚本位于项目根目录 D:\Figma_skyriff\
    echo.
    pause
    exit /b 1
)

:: 进入后端目录
cd /d "%BACKEND_DIR%"
echo ✅ 已进入后端目录
echo.

:: 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到 Python！
    echo.
    echo 请先安装 Python 3.8 或更高版本
    echo 下载地址: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python 已安装
python --version
echo.

:: 检查依赖是否安装
echo 🔍 检查依赖...
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo.
    echo ⚠️  检测到依赖未安装，正在安装...
    echo.
    echo ════════════════════════════════════════
    echo    📦 安装 Python 依赖包
    echo ════════════════════════════════════════
    echo.
    
    pip install -r requirements.txt
    
    if errorlevel 1 (
        echo.
        echo ❌ 依赖安装失败！
        echo.
        echo 请手动运行以下命令：
        echo cd %BACKEND_DIR%
        echo pip install -r requirements.txt
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ 依赖安装完成！
    echo.
)

echo ✅ 依赖检查通过
echo.

:: 检查数据库是否存在
if not exist "skyriff.db" (
    echo ⚠️  检测到数据库不存在，正在初始化...
    echo.
    echo ════════════════════════════════════════
    echo    🗄️  初始化数据库
    echo ════════════════════════════════════════
    echo.
    
    python init_database.py
    
    if errorlevel 1 (
        echo.
        echo ❌ 数据库初始化失败！
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ 数据库初始化完成！
    echo.
) else (
    echo ✅ 数据库文件存在
    echo.
)

:: 启动服务器
echo ════════════════════════════════════════
echo    🚀 启动后端服务器
echo ════════════════════════════════════════
echo.
echo 📍 服务地址: http://localhost:8000
echo 📖 API 文档: http://localhost:8000/docs
echo 💚 健康检查: http://localhost:8000/health
echo.
echo ⚠️  注意：请保持此窗口打开，关闭窗口将停止服务
echo ⚠️  按 Ctrl+C 可以停止服务
echo.
echo ════════════════════════════════════════
echo.

:: 启动服务器
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

:: 如果服务器停止
echo.
echo.
echo ════════════════════════════════════════
echo    服务器已停止
echo ════════════════════════════════════════
echo.
pause
