@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 SkyRiff 后端服务器
echo ========================================
echo.

:: 检查依赖
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo ❌ 错误：依赖未安装
    echo.
    echo 💡 请先运行 "🚀一键安装依赖.bat" 安装依赖
    pause
    exit /b 1
)

:: 检查 .env 文件
if not exist .env (
    echo ⚠️  警告：.env 文件不存在
    echo 将使用默认配置...
    echo.
)

echo ✅ 依赖检查通过
echo.
echo ========================================
echo 📝 服务器配置
echo ========================================
echo 地址: http://localhost:8000
echo 文档: http://localhost:8000/docs
echo 健康检查: http://localhost:8000/health
echo.
echo ========================================
echo 🔧 启动中...
echo ========================================
echo.

:: 启动服务器
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
