@echo off
chcp 65001 >nul
title 修复 SQLite 数据库 - BigInteger 兼容性
color 0E

echo.
echo ═══════════════════════════════════════════
echo    🔧 修复 SQLite 数据库兼容性问题
echo ═══════════════════════════════════════════
echo.

:: 进入脚本所在目录
cd /d "%~dp0"

echo 📝 问题说明：
echo    SQLite 不支持 BigInteger 类型
echo    需要将所有 BigInteger 改为 Integer
echo.
echo ════════════════════════════════════════
echo    步骤 1: 修复 models.py 文件
echo ════════════════════════════════════════
echo.

:: 备份原文件
if exist "app\db\models.py" (
    echo 📦 备份原文件...
    copy "app\db\models.py" "app\db\models.py.backup" >nul
    echo ✅ 备份完成: models.py.backup
    echo.
)

:: 使用 PowerShell 进行文本替换
echo 🔄 正在替换 BigInteger 为 Integer...
powershell -Command "(Get-Content 'app\db\models.py') -replace 'BigInteger', 'Integer' | Set-Content 'app\db\models.py'"

if errorlevel 1 (
    echo ❌ 修复失败！
    echo.
    pause
    exit /b 1
)

echo ✅ 修复完成！
echo.

echo ════════════════════════════════════════
echo    步骤 2: 删除旧数据库
echo ════════════════════════════════════════
echo.

if exist "skyriff.db" (
    echo ⚠️  检测到旧数据库文件
    choice /C YN /M "是否删除旧数据库并重新初始化？(Y/N)"
    
    if errorlevel 2 (
        echo.
        echo ℹ️  保留旧数据库，跳过重新初始化
        echo.
        goto :skip_init
    )
    
    echo.
    echo 🗑️  删除旧数据库...
    del skyriff.db
    echo ✅ 旧数据库已删除
    echo.
) else (
    echo ℹ️  未发现旧数据库文件
    echo.
)

echo ════════════════════════════════════════
echo    步骤 3: 重新初始化数据库
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

:skip_init

echo.
echo ═══════════════════════════════════════════
echo    🎉 修复完成！
echo ═══════════════════════════════════════════
echo.
echo ✅ BigInteger 已全部替换为 Integer
echo ✅ 数据库已重新初始化
echo.
echo ════════════════════════════════════════
echo    下一步操作
echo ════════════════════════════════════════
echo.
echo  1️⃣  启动后端服务
echo     命令: uvicorn app.main:app --reload
echo     或运行: 启动后端.bat
echo.
echo  2️⃣  回到前端浏览器
echo     按 Ctrl+Shift+T 打开测试控制台
echo.
echo  3️⃣  运行全部测试
echo     确认所有 15 项测试通过
echo.
echo ════════════════════════════════════════
echo.

pause
