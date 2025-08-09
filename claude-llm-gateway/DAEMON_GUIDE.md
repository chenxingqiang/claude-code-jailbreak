# Claude LLM Gateway 守护进程管理指南

## 🚀 快速启动

### 一键启动后台服务
```bash
./start-daemon.sh
```

## 🔧 守护进程管理

### 基本命令
```bash
# 启动服务
./scripts/daemon.sh start

# 停止服务  
./scripts/daemon.sh stop

# 重启服务
./scripts/daemon.sh restart

# 查看状态
./scripts/daemon.sh status

# 查看日志
./scripts/daemon.sh logs

# 实时查看日志
./scripts/daemon.sh follow

# 清理日志
./scripts/daemon.sh clean

# 健康检查
./scripts/daemon.sh health

# 显示帮助
./scripts/daemon.sh help
```

## 📊 服务状态监控

### 查看详细状态
```bash
./scripts/daemon.sh status
```
显示内容：
- 进程PID和运行时间
- 端口占用情况
- 最近日志内容
- 内存和CPU使用率

### 健康检查
```bash
./scripts/daemon.sh health
```
检查项目：
- HTTP API响应
- 进程存活状态
- 端口可用性

## 📋 日志管理

### 日志文件位置
- **主日志**: `logs/gateway.log`
- **错误日志**: `logs/gateway-error.log`
- **PID文件**: `claude-gateway.pid`

### 查看日志
```bash
# 查看最后50行日志
./scripts/daemon.sh logs

# 查看最后100行日志
./scripts/daemon.sh logs 100

# 实时查看日志
./scripts/daemon.sh follow

# 清理日志文件
./scripts/daemon.sh clean
```

## 🌐 Web管理界面

### 访问地址
- **管理控制台**: http://localhost:8765
- **API端点**: http://localhost:8765/v1/messages
- **健康检查**: http://localhost:8765/health
- **提供者状态**: http://localhost:8765/providers

### 管理功能
- 📊 实时状态监控
- 🔧 提供者配置管理
- 🔐 API密钥管理
- 🧠 智能模型选择
- 📋 实时日志查看

## 🤖 Claude Code集成

### 环境配置
```bash
# 启用Multi-LLM Gateway模式
export USE_MULTI_LLM_GATEWAY=true
source claude-env.sh
```

### 使用方法
```bash
# 基本使用
claude --print "你的问题"

# 进入交互模式
claude

# 编程任务示例
claude --print "写一个Python函数来计算斐波那契数列"

# 对话任务示例  
claude --print "你好，今天天气怎么样？"
```

### 智能模型选择
系统会根据任务类型自动选择最佳模型：
- **编程任务** → deepseek-coder (高质量代码生成)
- **对话任务** → deepseek-chat (自然对话)
- **分析任务** → 根据复杂度选择合适模型
- **创作任务** → 选择创意能力强的模型
- **翻译任务** → 选择多语言能力强的模型

## 🔧 配置管理

### API密钥配置
通过Web界面或直接编辑 `.env` 文件：
```bash
DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
GROQ_API_KEY=your_groq_key
# ... 更多API密钥
```

### 网关设置
- **端口**: 默认8765（可通过GATEWAY_PORT环境变量修改）
- **超时**: 默认30秒
- **并发**: 默认10个并发请求
- **CORS**: 默认启用

## 🛠️ 故障排除

### 常见问题

#### 1. 服务启动失败
```bash
# 检查日志
./scripts/daemon.sh logs

# 检查端口占用
lsof -i :8765

# 强制停止冲突进程
lsof -ti:8765 | xargs kill -9
```

#### 2. API密钥错误
```bash
# 通过Web界面测试API密钥
open http://localhost:8765

# 查看配置页面，测试各个提供者
```

#### 3. 模型选择问题
```bash
# 查看模型统计
curl http://localhost:8765/model-stats

# 检查提供者状态
curl http://localhost:8765/providers
```

#### 4. Claude Code连接问题
```bash
# 检查环境变量
echo $ANTHROPIC_BASE_URL

# 应该显示: http://localhost:8765

# 重新配置环境
export USE_MULTI_LLM_GATEWAY=true
source claude-env.sh
```

### 调试命令
```bash
# 查看完整状态
./scripts/daemon.sh status

# 查看错误日志
cat logs/gateway-error.log

# 测试API连接
curl -s http://localhost:8765/health | jq

# 查看提供者健康状态
curl -s http://localhost:8765/providers | jq '.summary'
```

## 🚦 服务状态指示

### 状态颜色
- 🟢 **健康**: 服务正常运行
- 🟡 **警告**: 部分功能异常
- 🔴 **错误**: 服务停止或严重故障

### 健康检查项目
- HTTP API响应 (200状态码)
- 进程存活状态
- 内存使用情况
- 提供者连接状态
- 端口可用性

## 📈 性能监控

### 系统指标
- CPU使用率
- 内存使用量
- 请求响应时间
- 成功率统计
- 活跃连接数

### 模型性能
- 各模型响应时间
- 任务类型分布
- 成功率统计
- 用户评分反馈

## 🔄 版本更新

### 更新流程
```bash
# 停止服务
./scripts/daemon.sh stop

# 更新代码
git pull

# 安装依赖
npm install

# 重启服务
./scripts/daemon.sh start
```

### 配置迁移
服务会自动检测配置文件版本并进行必要的迁移。

## 📞 技术支持

### 获取帮助
```bash
# 查看命令帮助
./scripts/daemon.sh help

# 查看项目信息
cat package.json | jq '.version'

# 查看系统信息
node --version
npm --version
```

### 报告问题
请包含以下信息：
1. 错误日志内容
2. 系统环境信息
3. 重现步骤
4. 期望结果

---

**🎉 现在你拥有了一个完整的、专业级的LLM网关后台服务！**
