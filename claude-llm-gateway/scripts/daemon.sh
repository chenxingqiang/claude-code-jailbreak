#!/bin/bash

# Claude LLM Gateway Daemon Script
# 用于启动、停止、重启和查看Claude LLM Gateway后台服务

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_DIR/claude-gateway.pid"
LOG_FILE="$PROJECT_DIR/logs/gateway.log"
ERROR_LOG_FILE="$PROJECT_DIR/logs/gateway-error.log"

# 确保日志目录存在
mkdir -p "$PROJECT_DIR/logs"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# 检查是否已经在运行
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            # PID文件存在但进程不存在，清理PID文件
            rm -f "$PID_FILE"
            return 1
        fi
    else
        return 1
    fi
}

# 获取运行状态
get_status() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        echo "running (PID: $pid)"
        return 0
    else
        echo "stopped"
        return 1
    fi
}

# 启动服务
start_service() {
    print_info "启动Claude LLM Gateway..."
    
    if is_running; then
        local pid=$(cat "$PID_FILE")
        print_warning "服务已经在运行 (PID: $pid)"
        return 1
    fi
    
    # 切换到项目目录
    cd "$PROJECT_DIR" || {
        print_error "无法切换到项目目录: $PROJECT_DIR"
        return 1
    }
    
    # 检查依赖
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装"
        return 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_error "找不到 package.json 文件"
        return 1
    fi
    
    # 确保环境变量已加载
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
        print_info "已加载环境变量"
    else
        print_warning "未找到 .env 文件"
    fi
    
    # 启动服务（后台运行）
    print_info "启动网关服务..."
    nohup node src/server.js > "$LOG_FILE" 2> "$ERROR_LOG_FILE" & 
    local pid=$!
    
    # 保存PID
    echo "$pid" > "$PID_FILE"
    
    # 等待一会儿检查是否启动成功
    sleep 3
    
    if is_running; then
        print_status "✅ Claude LLM Gateway 启动成功!"
        print_info "🔗 PID: $pid"
        print_info "📊 Web界面: http://localhost:8765"
        print_info "🔧 API端点: http://localhost:8765/v1/messages"
        print_info "📋 日志文件: $LOG_FILE"
        print_info "❌ 错误日志: $ERROR_LOG_FILE"
        return 0
    else
        print_error "服务启动失败"
        if [ -f "$ERROR_LOG_FILE" ]; then
            print_error "错误信息:"
            tail -10 "$ERROR_LOG_FILE"
        fi
        return 1
    fi
}

# 停止服务
stop_service() {
    print_info "停止Claude LLM Gateway..."
    
    if ! is_running; then
        print_warning "服务未在运行"
        return 1
    fi
    
    local pid=$(cat "$PID_FILE")
    print_info "终止进程 PID: $pid"
    
    # 发送TERM信号
    kill "$pid" 2>/dev/null
    
    # 等待进程结束
    local count=0
    while is_running && [ $count -lt 10 ]; do
        sleep 1
        count=$((count + 1))
    done
    
    # 如果还在运行，强制终止
    if is_running; then
        print_warning "强制终止进程..."
        kill -9 "$pid" 2>/dev/null
        sleep 1
    fi
    
    # 清理PID文件
    rm -f "$PID_FILE"
    
    if ! is_running; then
        print_status "✅ 服务已停止"
        return 0
    else
        print_error "无法停止服务"
        return 1
    fi
}

# 重启服务
restart_service() {
    print_info "重启Claude LLM Gateway..."
    stop_service
    sleep 2
    start_service
}

# 查看状态
show_status() {
    local status=$(get_status)
    if is_running; then
        local pid=$(cat "$PID_FILE")
        print_status "状态: ${GREEN}$status${NC}"
        
        # 显示进程信息
        if command -v ps &> /dev/null; then
            print_info "进程信息:"
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                ps -p "$pid" -o pid,ppid,command,etime,%cpu,%mem | tail -n +2 | while read line; do
                    echo "  $line"
                done
            else
                # Linux
                ps -p "$pid" -o pid,ppid,cmd,etime,pcpu,pmem --no-headers | while read line; do
                    echo "  $line"
                done
            fi
        fi
        
        # 显示端口信息
        if command -v lsof &> /dev/null; then
            local port_info=$(lsof -i :8765 -t 2>/dev/null)
            if [ ! -z "$port_info" ]; then
                print_info "端口: 8765 (已占用)"
            fi
        fi
        
        # 显示最近的日志
        if [ -f "$LOG_FILE" ]; then
            print_info "最近日志 (最后10行):"
            tail -10 "$LOG_FILE" | sed 's/^/  /'
        fi
        
    else
        print_error "状态: ${RED}$status${NC}"
    fi
}

# 查看日志
show_logs() {
    local lines=${1:-50}
    
    if [ -f "$LOG_FILE" ]; then
        print_info "显示最后 $lines 行日志:"
        echo "----------------------------------------"
        tail -n "$lines" "$LOG_FILE"
        echo "----------------------------------------"
    else
        print_warning "日志文件不存在: $LOG_FILE"
    fi
    
    if [ -f "$ERROR_LOG_FILE" ] && [ -s "$ERROR_LOG_FILE" ]; then
        print_warning "错误日志:"
        echo "----------------------------------------"
        tail -n "$lines" "$ERROR_LOG_FILE"
        echo "----------------------------------------"
    fi
}

# 实时查看日志
follow_logs() {
    if [ -f "$LOG_FILE" ]; then
        print_info "实时查看日志 (Ctrl+C 退出):"
        tail -f "$LOG_FILE"
    else
        print_warning "日志文件不存在: $LOG_FILE"
    fi
}

# 清理日志
clean_logs() {
    print_info "清理日志文件..."
    
    if [ -f "$LOG_FILE" ]; then
        > "$LOG_FILE"
        print_status "已清理: $LOG_FILE"
    fi
    
    if [ -f "$ERROR_LOG_FILE" ]; then
        > "$ERROR_LOG_FILE"
        print_status "已清理: $ERROR_LOG_FILE"
    fi
}

# 健康检查
health_check() {
    if ! is_running; then
        print_error "服务未运行"
        return 1
    fi
    
    print_info "执行健康检查..."
    
    # 检查HTTP接口
    if command -v curl &> /dev/null; then
        local health_response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:8765/health" 2>/dev/null)
        if [ "$health_response" = "200" ]; then
            print_status "✅ HTTP健康检查通过"
        else
            print_error "❌ HTTP健康检查失败 (状态码: $health_response)"
            return 1
        fi
    else
        print_warning "curl 未安装，跳过HTTP检查"
    fi
    
    # 检查进程状态
    local pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null 2>&1; then
        print_status "✅ 进程健康检查通过"
    else
        print_error "❌ 进程健康检查失败"
        return 1
    fi
    
    print_status "🎉 所有健康检查通过"
    return 0
}

# 显示帮助信息
show_help() {
    echo "Claude LLM Gateway 守护进程管理工具"
    echo ""
    echo "用法: $0 {start|stop|restart|status|logs|follow|clean|health|help}"
    echo ""
    echo "命令:"
    echo "  start    - 启动服务"
    echo "  stop     - 停止服务"
    echo "  restart  - 重启服务"
    echo "  status   - 查看服务状态"
    echo "  logs     - 查看日志 (可选参数: 行数，默认50)"
    echo "  follow   - 实时查看日志"
    echo "  clean    - 清理日志文件"
    echo "  health   - 执行健康检查"
    echo "  help     - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start"
    echo "  $0 logs 100"
    echo "  $0 follow"
    echo ""
    echo "文件位置:"
    echo "  PID文件: $PID_FILE"
    echo "  日志文件: $LOG_FILE"
    echo "  错误日志: $ERROR_LOG_FILE"
}

# 主逻辑
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$2"
        ;;
    follow)
        follow_logs
        ;;
    clean)
        clean_logs
        ;;
    health)
        health_check
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "错误: 未知命令 '$1'"
        echo ""
        show_help
        exit 1
        ;;
esac
