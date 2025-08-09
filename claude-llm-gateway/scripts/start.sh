#!/bin/bash
# Claude LLM Gateway 启动脚本 (动态配置版本)

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 启动Claude LLM Gateway (动态配置)...${NC}"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js未安装，请先安装Node.js (https://nodejs.org/)${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js版本过低，需要v16或更高版本${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js版本: $(node --version)${NC}"

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.installed" ]; then
    echo -e "${YELLOW}📦 安装依赖...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        touch node_modules/.installed
        echo -e "${GREEN}✅ 依赖安装完成${NC}"
    else
        echo -e "${RED}❌ 依赖安装失败${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 依赖已安装${NC}"
fi

# 设置环境变量文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️  创建环境配置...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${YELLOW}📝 已从 env.example 创建 .env 文件${NC}"
        echo -e "${YELLOW}请编辑 .env 文件设置您的API密钥${NC}"
    else
        echo -e "${RED}❌ 找不到 env.example 文件${NC}"
        exit 1
    fi
fi

# 加载环境变量
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ 环境变量已加载${NC}"
fi

# 创建必要目录
mkdir -p config logs

# 更新提供者配置（如果需要）
echo -e "${BLUE}🔍 检查提供者配置...${NC}"
node scripts/update-config.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 配置更新失败${NC}"
    exit 1
fi

# 检查端口是否被占用
GATEWAY_PORT=${GATEWAY_PORT:-3000}
if lsof -Pi :$GATEWAY_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  端口 $GATEWAY_PORT 已被占用${NC}"
    read -p "是否尝试终止占用进程? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:$GATEWAY_PORT | xargs kill -9
        echo -e "${GREEN}✅ 进程已终止${NC}"
    else
        echo -e "${RED}❌ 启动取消${NC}"
        exit 1
    fi
fi

# 启动网关
echo -e "${BLUE}🌐 启动API网关...${NC}"
echo -e "${BLUE}端口: $GATEWAY_PORT${NC}"
echo -e "${BLUE}主机: ${GATEWAY_HOST:-localhost}${NC}"

# 如果是开发模式，使用nodemon
if [ "$NODE_ENV" = "development" ] && command -v nodemon &> /dev/null; then
    echo -e "${YELLOW}🔧 开发模式 - 使用 nodemon${NC}"
    nodemon src/server.js
else
    node src/server.js
fi
