#!/bin/bash

# SkyRiff 一键部署脚本
# 用于生产环境快速部署

set -e  # 遇到错误立即退出

echo "========================================"
echo "   🚀 SkyRiff 一键部署脚本"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误：未安装 Docker${NC}"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ 错误：未安装 Docker Compose${NC}"
    echo "请先安装 Docker Compose"
    exit 1
fi

echo -e "${GREEN}✅ Docker 环境检查通过${NC}"
echo ""

# 停止旧容器
echo "📦 停止旧容器..."
docker-compose down 2>/dev/null || true

# 清理旧镜像（可选）
read -p "是否清理旧镜像? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  清理旧镜像..."
    docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true
fi

# 构建镜像
echo ""
echo "🔨 构建 Docker 镜像..."
docker-compose build --no-cache

# 启动服务
echo ""
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo ""
echo "📊 检查服务状态..."
docker-compose ps

# 健康检查
echo ""
echo "🏥 健康检查..."

# 检查后端
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务正常${NC}"
else
    echo -e "${RED}❌ 后端服务异常${NC}"
    echo "查看日志: docker-compose logs backend"
fi

# 检查前端
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端服务正常${NC}"
else
    echo -e "${RED}❌ 前端服务异常${NC}"
    echo "查看日志: docker-compose logs frontend"
fi

# 检查数据库
if docker-compose exec -T db pg_isready -U skyriff > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 数据库服务正常${NC}"
else
    echo -e "${RED}❌ 数据库服务异常${NC}"
    echo "查看日志: docker-compose logs db"
fi

# 检查 Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis 服务正常${NC}"
else
    echo -e "${RED}❌ Redis 服务异常${NC}"
    echo "查看日志: docker-compose logs redis"
fi

echo ""
echo "========================================"
echo -e "${GREEN}   ✅ 部署完成！${NC}"
echo "========================================"
echo ""
echo "📱 访问地址："
echo "   前端: http://localhost"
echo "   后端: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "🔧 常用命令："
echo "   查看日志: docker-compose logs -f [service]"
echo "   重启服务: docker-compose restart"
echo "   停止服务: docker-compose down"
echo "   进入容器: docker-compose exec [service] sh"
echo ""
echo "📊 监控："
echo "   docker-compose ps        # 查看服务状态"
echo "   docker stats            # 查看资源占用"
echo ""
echo "========================================"
