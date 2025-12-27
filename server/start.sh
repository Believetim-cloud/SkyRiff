#!/bin/bash

# SkyRiff API Server 启动脚本

echo ""
echo "🚀 ========================================"
echo "🎬 SkyRiff API Server 启动脚本"
echo "🚀 ========================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装Node.js"
    echo "   请先安装Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到.env文件"
    echo ""
    echo "请选择运行模式："
    echo "  1) Mock服务器（无需API Key，用于测试）"
    echo "  2) 真实服务器（需要API Key）"
    echo ""
    read -p "请输入选择 (1/2): " choice
    
    if [ "$choice" == "1" ]; then
        echo ""
        echo "🎭 启动Mock服务器..."
        npm run start:mock
    elif [ "$choice" == "2" ]; then
        echo ""
        echo "📝 请先配置API Key："
        echo "   1. 复制示例文件: cp .env.example .env"
        echo "   2. 编辑.env文件，填入真实API Key"
        echo "   3. 重新运行此脚本"
        echo ""
        read -p "是否现在配置? (y/n): " config_now
        
        if [ "$config_now" == "y" ] || [ "$config_now" == "Y" ]; then
            cp .env.example .env
            echo ""
            read -p "请输入您的API Key: " api_key
            sed -i.bak "s/YOUR_ACTUAL_API_KEY/$api_key/" .env
            rm .env.bak 2>/dev/null
            echo "✅ API Key已配置"
            echo ""
            echo "🚀 启动真实服务器..."
            npm start
        fi
    else
        echo "❌ 无效选择"
        exit 1
    fi
else
    # 检查是否配置了真实API Key
    if grep -q "YOUR_ACTUAL_API_KEY" .env 2>/dev/null; then
        echo "⚠️  .env文件中的API Key未配置"
        echo ""
        echo "请选择："
        echo "  1) 使用Mock服务器（无需API Key）"
        echo "  2) 配置真实API Key"
        echo ""
        read -p "请输入选择 (1/2): " choice
        
        if [ "$choice" == "1" ]; then
            echo ""
            echo "🎭 启动Mock服务器..."
            npm run start:mock
        else
            read -p "请输入您的API Key: " api_key
            sed -i.bak "s/YOUR_ACTUAL_API_KEY/$api_key/" .env
            rm .env.bak 2>/dev/null
            echo "✅ API Key已配置"
            echo ""
            echo "🚀 启动真实服务器..."
            npm start
        fi
    else
        echo "✅ 配置文件已存在"
        echo ""
        echo "🚀 启动真实服务器..."
        npm start
    fi
fi
