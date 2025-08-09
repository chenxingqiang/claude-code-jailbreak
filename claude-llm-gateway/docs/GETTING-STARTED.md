# 快速开始指南

## 📋 前置条件

- Node.js 16.0.0 或更高版本
- npm 或 yarn 包管理器
- 至少一个LLM提供者的API密钥

## 🚀 安装和配置

### 1. 进入项目目录

```bash
cd /Users/xingqiangchen/claude/claude-code-jailbreak/claude-llm-gateway
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境配置模板：

```bash
cp env.example .env
```

编辑 `.env` 文件，至少设置一个提供者的API密钥：

```env
# 推荐：OpenAI (最稳定)
OPENAI_API_KEY=sk-your-openai-api-key-here

# 或者：Google Gemini (免费额度大)
GOOGLE_API_KEY=your-google-api-key-here

# 更多可选提供者
ANTHROPIC_API_KEY=your-anthropic-api-key-here
COHERE_API_KEY=your-cohere-api-key-here
MISTRAL_API_KEY=your-mistral-api-key-here
GROQ_API_KEY=your-groq-api-key-here
```

### 4. 启动网关

```bash
# 使用启动脚本（推荐）
./scripts/start.sh

# 或者直接运行
npm start
```

### 5. 验证安装

打开新终端，测试网关：

```bash
# 检查健康状态
curl http://localhost:3000/health

# 查看可用提供者
curl http://localhost:3000/providers

# 测试API调用
curl -X POST http://localhost:3000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-sonnet",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "max_tokens": 50
  }'
```

## 🔧 集成Claude Code

### 方法1: 自动集成（推荐）

```bash
# 返回到主项目目录
cd /Users/xingqiangchen/claude/claude-code-jailbreak

# 激活多LLM网关模式
source claude-env.sh

# 现在使用Claude Code，将自动路由到最佳提供者
claude --print "用中文解释什么是人工智能"
```

### 方法2: 手动配置

如果自动集成有问题，可以手动设置：

```bash
# 设置环境变量
export ANTHROPIC_API_KEY="gateway-bypass-token"
export ANTHROPIC_BASE_URL="http://localhost:3000"
export ANTHROPIC_AUTH_TOKEN="gateway-bypass-token"

# 使用Claude Code
claude --print "Hello from multi-LLM gateway!"
```

## 🎯 验证多提供者功能

### 测试不同模型

```bash
# 这些请求会被智能路由到不同的提供者
claude --print "使用GPT模型: 解释量子计算"
claude --print "使用Gemini模型: 写一首关于AI的诗"
claude --print "使用本地模型: 编写Python函数"
```

### 查看路由日志

```bash
# 查看网关日志
tail -f /tmp/claude-gateway.log

# 或查看实时提供者状态
watch -n 5 "curl -s http://localhost:3000/providers | jq '.summary'"
```

## 🔄 配置管理

### 刷新提供者配置

```bash
# 手动刷新配置（当添加新API密钥后）
curl http://localhost:3000/providers/refresh
```

### 查看详细配置

```bash
# 查看完整配置
curl http://localhost:3000/config | jq .

# 查看统计信息
curl http://localhost:3000/stats | jq .
```

## 💡 高级用法

### 本地模型设置

如果您有Ollama等本地LLM服务：

```bash
# 安装Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 启动Ollama服务
ollama serve

# 下载模型
ollama pull llama2
ollama pull codellama

# 网关将自动检测并启用Ollama提供者
```

### 自定义负载均衡

编辑 `.env` 文件添加：

```env
# 负载均衡策略
LOAD_BALANCE_STRATEGY=cost_optimized  # 成本优化
# 或 priority, round_robin, least_requests, random
```

### 调试模式

```bash
export LOG_LEVEL=debug
npm start
```

## 🔧 故障排除

### 常见问题

**1. 网关启动失败**
```bash
# 检查端口占用
lsof -i :3000

# 检查日志
cat /tmp/claude-gateway.log
```

**2. 没有可用提供者**
```bash
# 检查API密钥是否正确设置
cat .env | grep API_KEY

# 手动测试API密钥
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

**3. Claude Code连接失败**
```bash
# 检查环境变量
echo $ANTHROPIC_BASE_URL
echo $ANTHROPIC_API_KEY

# 测试网关连接
curl http://localhost:3000/health
```

### 重置和清理

```bash
# 停止所有相关进程
pkill -f claude-llm-gateway
pkill -f node

# 清理日志
rm -f /tmp/claude-gateway.log

# 重新生成配置
rm -f config/providers.json
node scripts/update-config.js
```

## 🎉 成功指标

您应该看到以下成功指标：

- ✅ 网关健康检查返回 "healthy"
- ✅ 至少一个提供者状态为 "enabled": true
- ✅ Claude Code能够正常响应请求
- ✅ 不同的请求被路由到不同的提供者
- ✅ 在网关日志中看到请求处理记录

## 📞 获取帮助

- 查看完整文档: [README.md](../README.md)
- 检查配置示例: [env.example](../env.example)
- 查看API文档: `curl http://localhost:3000/` 
- 报告问题: GitHub Issues

恭喜！您现在已经成功配置了支持36个LLM提供者的Claude Code多模型网关！🎉
