@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    🚀 SkyRiff 一键启动脚本
echo ========================================
echo.

REM 检查是否在正确的目录
if not exist "backend\" (
    echo ❌ 错误：找不到 backend 目录
    echo 请在项目根目录运行此脚本
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ 错误：找不到 package.json
    echo 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo ✅ 项目结构检测通过
echo.

REM 启动后端
echo [1/2] 🐍 启动 Python 后端...
echo.
start "SkyRiff Backend" cmd /k "cd backend && python -m app.main"
timeout /t 3 >nul

REM 启动前端
echo [2/2] ⚛️  启动 React 前端...
echo.
start "SkyRiff Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    ✅ 启动完成！
echo ========================================
echo.
echo 📊 已打开两个新窗口：
echo    1️⃣  Python 后端 (http://localhost:8000)
echo    2️⃣  React 前端 (http://localhost:5173)
echo.
echo 💡 提示：
echo    - 等待 3-5 秒后，浏览器会自动打开
echo    - 可以关闭本窗口，不影响运行
echo    - 要停止服务，关闭两个命令行窗口即可
echo.
echo ========================================
pause
