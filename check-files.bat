@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          🔍 SkyRiff 项目文件检查和修复工具                     ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 正在检查项目文件...
echo.

:: 检查并重命名 package 为 package.json
if exist "package" (
    if not exist "package.json" (
        echo ✅ 发现 package 文件，正在重命名为 package.json...
        rename "package" "package.json"
    )
)

:: 检查并重命名 vite.config
if exist "vite.config" (
    if not exist "vite.config.ts" (
        echo ✅ 发现 vite.config 文件，正在重命名为 vite.config.ts...
        rename "vite.config" "vite.config.ts"
    )
)

:: 检查并重命名 postcss.config
if exist "postcss.config" (
    if not exist "postcss.config.js" (
        echo ✅ 发现 postcss.config 文件，正在重命名为 postcss.config.js...
        rename "postcss.config" "postcss.config.js"
    )
)

echo.
echo ════════════════════════════════════════════════════════════════
echo 📋 文件检查结果：
echo ════════════════════════════════════════════════════════════════
echo.

:: 检查必要文件是否存在
set MISSING_FILES=0

if exist "package.json" (
    echo ✅ package.json         - 存在
) else (
    echo ❌ package.json         - 缺失！
    set MISSING_FILES=1
)

if exist "vite.config.ts" (
    echo ✅ vite.config.ts       - 存在
) else (
    echo ❌ vite.config.ts       - 缺失！
    set MISSING_FILES=1
)

if exist "tsconfig.json" (
    echo ✅ tsconfig.json        - 存在
) else (
    echo ❌ tsconfig.json        - 缺失！
    set MISSING_FILES=1
)

if exist "index.html" (
    echo ✅ index.html           - 存在
) else (
    echo ❌ index.html           - 缺失！
    set MISSING_FILES=1
)

if exist "src" (
    echo ✅ src 文件夹           - 存在
) else (
    echo ❌ src 文件夹           - 缺失！
    set MISSING_FILES=1
)

if exist "server" (
    echo ✅ server 文件夹        - 存在
) else (
    echo ❌ server 文件夹        - 缺失！
    set MISSING_FILES=1
)

if exist "src\main.tsx" (
    echo ✅ src\main.tsx         - 存在
) else (
    echo ❌ src\main.tsx         - 缺失！
    set MISSING_FILES=1
)

echo.
echo ════════════════════════════════════════════════════════════════

if %MISSING_FILES%==0 (
    echo.
    echo 🎉 太好了！所有必要文件都存在！
    echo.
    echo 📦 下一步：运行以下命令安装依赖
    echo.
    echo    npm install
    echo.
) else (
    echo.
    echo ⚠️  发现缺失文件！
    echo.
    echo 📝 解决方案：
    echo    1. 查看项目中的配置文件模板（📦完整的xxx配置.txt）
    echo    2. 按照模板内容创建缺失的文件
    echo    3. 或查看：🚀一步一步创建缺失文件-超详细.txt
    echo.
)

echo 按任意键关闭...
pause >nul
