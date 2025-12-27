#!/bin/bash

echo ""
echo "========================================"
echo "   🚀 SkyRiff 一键启动脚本"
echo "========================================"
echo ""

# 检查是否在正确的目录
if [ ! -d "backend" ]; then
    echo "❌ 错误：找不到 backend 目录"
    echo "请在项目根目录运行此脚本"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ 错误：找不到 package.json"
    echo "请在项目根目录运行此脚本"
    exit 1
fi

echo "✅ 项目结构检测通过"
echo ""

# 启动后端
echo "[1/2] 🐍 启动 Python 后端..."
echo ""
cd backend
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && python -m app.main"'
else
    # Linux
    gnome-terminal -- bash -c "python -m app.main; exec bash" &
fi
cd ..

sleep 3

# 启动前端
echo "[2/2] ⚛️  启动 React 前端..."
echo ""
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && npm run dev"'
else
    # Linux
    gnome-terminal -- bash -c "npm run dev; exec bash" &
fi

echo ""
echo "========================================"
echo "   ✅ 启动完成！"
echo "========================================"
echo ""
echo "📊 已打开两个新终端："
echo "   1️⃣  Python 后端 (http://localhost:8000)"
echo "   2️⃣  React 前端 (http://localhost:5173)"
echo ""
echo "💡 提示："
echo "   - 等待 3-5 秒后，浏览器会自动打开"
echo "   - 可以关闭本终端，不影响运行"
echo "   - 要停止服务，关闭两个终端窗口即可"
echo ""
echo "========================================"
