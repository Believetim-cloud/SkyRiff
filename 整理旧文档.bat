@echo off
chcp 65001 >nul
echo ========================================
echo   🗄️ 整理旧文档到归档文件夹
echo ========================================
echo.

REM 创建归档文件夹
if not exist "🗄️旧文档归档" mkdir "🗄️旧文档归档"

echo 正在移动旧文档...
echo.

REM 移动各种启动教程文件
if exist "⚡立即启动.txt" move "⚡立即启动.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "⚡解决方案-路径错误.txt" move "⚡解决方案-路径错误.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "✅修复完成.md" move "✅修复完成.md" "🗄️旧文档归档\" >nul 2>&1
if exist "✅完美解决方案-看这里.txt" move "✅完美解决方案-看这里.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "✅最终解决方案.txt" move "✅最终解决方案.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "✅问题已解决-看这里.txt" move "✅问题已解决-看这里.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "✨超简单启动方法.txt" move "✨超简单启动方法.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "⭐创建桌面快捷方式.txt" move "⭐创建桌面快捷方式.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "⭐最简单的方法-看这里.html" move "⭐最简单的方法-看这里.html" "🗄️旧文档归档\" >nul 2>&1

REM 移动一键启动相关
if exist "一键启动说明.txt" move "一键启动说明.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "创建启动文件的方法.txt" move "创建启动文件的方法.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "双击启动教程.html" move "双击启动教程.html" "🗄️旧文档归档\" >nul 2>&1
if exist "启动指南.md" move "启动指南.md" "🗄️旧文档归档\" >nul 2>&1
if exist "启动指南-图解.md" move "启动指南-图解.md" "🗄️旧文档归档\" >nul 2>&1
if exist "启动助手.html" move "启动助手.html" "🗄️旧文档归档\" >nul 2>&1
if exist "开始使用.md" move "开始使用.md" "🗄️旧文档归档\" >nul 2>&1

REM 移动配置文件说明
if exist "📦完整的index.html配置.txt" move "📦完整的index.html配置.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "📦完整的main.tsx配置.txt" move "📦完整的main.tsx配置.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "📦完整的package.json配置.txt" move "📦完整的package.json配置.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "📦完整的vite.config.ts配置.txt" move "📦完整的vite.config.ts配置.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "📦完整的tsconfig.json配置.txt" move "📦完整的tsconfig.json配置.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "📦重要-缺少的文件清单.txt" move "📦重要-缺少的文件清单.txt" "🗄️旧文档归档\" >nul 2>&1

REM 移动下载教程
if exist "📦下载到本地-图文教程.html" move "📦下载到本地-图文教程.html" "🗄️旧文档归档\" >nul 2>&1
if exist "📦如何下载项目到本地电脑.txt" move "📦如何下载项目到本地电脑.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "📦_所有文档打包下载.md" move "📦_所有文档打包下载.md" "🗄️旧文档归档\" >nul 2>&1
if exist "DOWNLOAD_GUIDE.md" move "DOWNLOAD_GUIDE.md" "🗄️旧文档归档\" >nul 2>&1

REM 移动各种README
if exist "README_FINAL.md" move "README_FINAL.md" "🗄️旧文档归档\" >nul 2>&1
if exist "START.md" move "START.md" "🗄️旧文档归档\" >nul 2>&1
if exist "START_HERE.md" move "START_HERE.md" "🗄️旧文档归档\" >nul 2>&1
if exist "READY_TO_START.md" move "READY_TO_START.md" "🗄️旧文档归档\" >nul 2>&1
if exist "QUICK_START.md" move "QUICK_START.md" "🗄️旧文档归档\" >nul 2>&1
if exist "COMPLETE_DELIVERY.md" move "COMPLETE_DELIVERY.md" "🗄️旧文档归档\" >nul 2>&1
if exist "COMPLETE_SOURCE_CODE.md" move "COMPLETE_SOURCE_CODE.md" "🗄️旧文档归档\" >nul 2>&1
if exist "COMPLETE_USAGE_GUIDE.md" move "COMPLETE_USAGE_GUIDE.md" "🗄️旧文档归档\" >nul 2>&1

REM 移动API文档（已整合到 docs/ 文件夹）
if exist "API_DETAILED_GUIDE.md" move "API_DETAILED_GUIDE.md" "🗄️旧文档归档\" >nul 2>&1
if exist "API_DOCUMENTATION.md" move "API_DOCUMENTATION.md" "🗄️旧文档归档\" >nul 2>&1
if exist "API_INTEGRATION_CHANGELOG.md" move "API_INTEGRATION_CHANGELOG.md" "🗄️旧文档归档\" >nul 2>&1
if exist "API_INTEGRATION_GUIDE.md" move "API_INTEGRATION_GUIDE.md" "🗄️旧文档归档\" >nul 2>&1
if exist "API_INTEGRATION_SUMMARY.md" move "API_INTEGRATION_SUMMARY.md" "🗄️旧文档归档\" >nul 2>&1
if exist "API_QUICK_REFERENCE.md" move "API_QUICK_REFERENCE.md" "🗄️旧文档归档\" >nul 2>&1

REM 移动Phase总结文档
if exist "PHASE0_SUMMARY.md" move "PHASE0_SUMMARY.md" "🗄️旧文档归档\" >nul 2>&1
if exist "PHASE1_COMPLETE.md" move "PHASE1_COMPLETE.md" "🗄️旧文档归档\" >nul 2>&1
if exist "PHASE2_COMPLETE.md" move "PHASE2_COMPLETE.md" "🗄️旧文档归档\" >nul 2>&1
if exist "PHASE3_COMPLETE.md" move "PHASE3_COMPLETE.md" "🗄️旧文档归档\" >nul 2>&1
if exist "PHASE4_COMPLETE.md" move "PHASE4_COMPLETE.md" "🗄️旧文档归档\" >nul 2>&1
if exist "PHASE4_STATUS.md" move "PHASE4_STATUS.md" "🗄️旧文档归档\" >nul 2>&1

REM 移动其他文档
if exist "DOCS_INDEX.md" move "DOCS_INDEX.md" "🗄️旧文档归档\" >nul 2>&1
if exist "DOCS_NAVIGATION.md" move "DOCS_NAVIGATION.md" "🗄️旧文档归档\" >nul 2>&1
if exist "FEATURE_DEMO.md" move "FEATURE_DEMO.md" "🗄️旧文档归档\" >nul 2>&1
if exist "TESTING_GUIDE.md" move "TESTING_GUIDE.md" "🗄️旧文档归档\" >nul 2>&1
if exist "PROJECT_CODE_EXPORT.md" move "PROJECT_CODE_EXPORT.md" "🗄️旧文档归档\" >nul 2>&1
if exist "ASSETS_COMPLETE_LIST.md" move "ASSETS_COMPLETE_LIST.md" "🗄️旧文档归档\" >nul 2>&1
if exist "ATTRIBUTIONS.md" move "ATTRIBUTIONS.md" "🗄️旧文档归档\" >nul 2>&1

REM 移动问题解决方案
if exist "🎯三种超简单启动方法.html" move "🎯三种超简单启动方法.html" "🗄️旧文档归档\" >nul 2>&1
if exist "🎯右键运行-不会变成txt.txt" move "🎯右键运行-不会变成txt.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "🎯看这里-最简单的方法.txt" move "🎯看这里-最简单的方法.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "🎯终极解决方案-一键运行.html" move "🎯终极解决方案-一键运行.html" "🗄️旧文档归档\" >nul 2>&1
if exist "📌快速参考-双击启动.txt" move "📌快速参考-双击启动.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "📖在Figma中完整使用指南.md" move "📖在Figma中完整使用指南.md" "🗄️旧文档归档\" >nul 2>&1
if exist "📖完整启动教程.md" move "📖完整启动教程.md" "🗄️旧文档归档\" >nul 2>&1
if exist "🚀一步一步创建缺失文件-超详细.txt" move "🚀一步一步创建缺失文件-超详细.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "🚀开机自动启动服务器.txt" move "🚀开机自动启动服务器.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "🚀快速启动指南.md" move "🚀快速启动指南.md" "🗄️旧文档归档\" >nul 2>&1
if exist "🚀快速启动指南.txt" move "🚀快速启动指南.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "🚀最简单-看这个.txt" move "🚀最简单-看这个.txt" "🗄️旧文档归档\" >nul 2>&1
if exist "🔰_零基础测试指南_新手必读.md" move "🔰_零基础测试指南_新手必读.md" "🗄️旧文档归档\" >nul 2>&1
if exist "🔧快速解决端口占用问题.bat" move "🔧快速解决端口占用问题.bat" "🗄️旧文档归档\" >nul 2>&1

REM 移动架构文档（已在 📚教程文档/ 中）
if exist "生产部署架构.md" move "生产部署架构.md" "🗄️旧文档归档\" >nul 2>&1
if exist "100万并发架构方案.md" move "100万并发架构方案.md" "🗄️旧文档归档\" >nul 2>&1
if exist "扩容路线图.md" move "扩容路线图.md" "🗄️旧文档归档\" >nul 2>&1
if exist "真实API使用指南.md" move "真实API使用指南.md" "🗄️旧文档归档\" >nul 2>&1

REM 移动check文件
if exist "check-files.bat" move "check-files.bat" "🗄️旧文档归档\" >nul 2>&1
if exist "quick-start.sh" move "quick-start.sh" "🗄️旧文档归档\" >nul 2>&1

echo ✅ 完成！
echo.
echo 📂 旧文档已移动到: 🗄️旧文档归档\
echo.
echo ✨ 现在项目根目录更整洁了！
echo.
echo 📚 新教程位置: 📚教程文档\
echo 📖 查看: ⭐️看这里-所有教程都在这.md
echo.
pause
