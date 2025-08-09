#!/bin/bash

# 快速启动Claude LLM Gateway守护进程
echo "🚀 启动Claude LLM Gateway守护进程..."

# 切换到正确的目录
cd "$(dirname "$0")"

# 停止现有服务（如果有）
./scripts/daemon.sh stop 2>/dev/null

# 启动后台服务
./scripts/daemon.sh start

# 显示状态
echo ""
echo "📊 服务状态："
./scripts/daemon.sh status

echo ""
echo "🌐 访问Web管理界面:"
echo "   http://localhost:8765"
echo ""
echo "🔧 管理命令:"
echo "   ./scripts/daemon.sh status   # 查看状态"
echo "   ./scripts/daemon.sh stop     # 停止服务"
echo "   ./scripts/daemon.sh restart  # 重启服务"
echo "   ./scripts/daemon.sh logs     # 查看日志"
echo "   ./scripts/daemon.sh health   # 健康检查"
