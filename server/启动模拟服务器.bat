@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          🎬 SkyRiff 模拟服务器 - 一键启动                     ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 正在启动模拟服务器...
echo.

cd /d "%~dp0"
node mock-api.js

pause
