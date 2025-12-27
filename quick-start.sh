#!/bin/bash

# SkyRiff 一键启动脚本
# 自动安装依赖并启动服务器

clear

echo ""
echo "=========================================="
echo "   SkyRiff AI视频创作平台"
echo "   一键启动中..."
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -d "server" ]; then
    echo "❌ [错误] 请在项目根目录运行此脚本"
    echo "   当前目录: $(pwd)"
    echo ""
    exit 1
fi

echo "✅ [1/3] 检查项目目录... OK"
echo ""

# 进入server目录
cd server

# 自动安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 [2/3] 首次运行，正在安装依赖..."
    echo "   这可能需要1-2分钟，请稍候..."
    echo ""
    npm install --silent
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ [错误] 依赖安装失败"
        echo "   请检查网络连接或手动运行: npm install"
        echo ""
        exit 1
    fi
    echo ""
    echo "✅ [2/3] 依赖安装完成！"
else
    echo "✅ [2/3] 依赖已安装... OK"
fi
echo ""

# 检查配置文件
if [ ! -f ".env" ]; then
    echo "⚠️  [警告] 未找到.env配置文件"
    echo "   正在检查API配置..."
    echo ""
fi

echo "🚀 [3/3] 启动真实API服务器..."
echo ""
echo "=========================================="
echo ""

# 启动服务器（自动运行）
npm start