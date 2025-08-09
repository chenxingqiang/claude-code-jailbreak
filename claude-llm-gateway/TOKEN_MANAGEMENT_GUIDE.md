# 🧠 智能Token管理系统用户指南

## 📋 系统概述

Claude LLM Gateway现在具备了智能Token管理功能，**解决了不同LLM提供商token限制不统一的问题**。Claude Code可以使用统一的`max_tokens`参数，而后台网关会根据目标API提供商的具体限制自动调整到最佳值。

## 🎯 核心特性

### 1. **统一接口，智能适配**
- Claude Code使用标准的`max_tokens`参数
- 后台自动根据提供商限制调整
- 完全透明，无需修改现有代码

### 2. **任务类型智能检测**
- **编程任务** → 自动选择编程专用模型 + 优化token分配
- **对话任务** → 选择对话优化模型 + 适中token分配  
- **分析任务** → 根据复杂度动态调整
- **创作任务** → 分配更多tokens支持创意输出
- **翻译任务** → 优化多语言处理效率

### 3. **多维度优化策略**
- **成本优先** → 选择成本最低的有效配置
- **质量优先** → 确保输出质量（默认策略）
- **速度优先** → 优化响应时间
- **智能平衡** → 综合考虑各项因素

## 🔧 提供商Token限制

### 主要提供商限制一览

| 提供商 | 模型 | 最小值 | 最大值 | 最优值 | 成本/1K |
|--------|------|--------|--------|--------|---------|
| **OpenAI** | gpt-4 | 1 | 8,192 | 4,096 | $0.030 |
| | gpt-4-turbo | 1 | 128,000 | 8,192 | $0.010 |
| | gpt-3.5-turbo | 1 | 4,096 | 2,048 | $0.002 |
| **DeepSeek** | deepseek-chat | 1 | 8,192 | 4,096 | $0.0014 |
| | deepseek-coder | 1 | 8,192 | 4,096 | $0.0014 |
| **Anthropic** | claude-3-opus | 1 | 4,096 | 2,048 | $0.075 |
| | claude-3-sonnet | 1 | 4,096 | 2,048 | $0.015 |
| | claude-3-haiku | 1 | 4,096 | 2,048 | $0.00125 |
| **Google** | gemini-pro | 1 | 8,192 | 4,096 | $0.0005 |
| | gemini-1.5-pro | 1 | 32,768 | 8,192 | $0.0035 |
| **Groq** | mixtral-8x7b | 1 | 32,768 | 8,192 | $0.00027 |
| **Cohere** | command-r-plus | 1 | 128,000 | 8,192 | $0.003 |

## 🚀 使用方法

### 1. **Claude Code正常使用**
```bash
# 无需任何修改，继续使用原有方式
claude --print "写一个Python爬虫程序"

# 系统会自动：
# ✅ 检测这是编程任务
# ✅ 选择deepseek-coder模型  
# ✅ 优化token分配策略
# ✅ 适配DeepSeek的8192限制
```

### 2. **API直接调用**
```bash
curl -X POST http://localhost:8765/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-sonnet-20240229",
    "max_tokens": 6000,  // 统一参数
    "messages": [...],
    "prioritize_quality": true  // 可选：优先质量
  }'

# 后台自动处理：
# 📊 原始请求: 6000 tokens
# 🧠 智能分析: 编程任务，选择deepseek-coder
# ⚖️  适配限制: 6000 → 4000 (DeepSeek最优值)
# 📈 策略: quality-focused
```

## 📊 智能分配示例

### 编程任务
```
输入: "写一个完整的React组件"
原始max_tokens: 3000

🧠 任务检测: 编程任务 (置信度: 95%)
🎯 模型选择: deepseek-coder
⚖️  Token调整: 3000 → 4000 (编程任务需要更多输出)
💰 成本估算: $0.0056
✅ 分配策略: quality-focused
```

### 对话任务  
```
输入: "今天天气怎么样？"
原始max_tokens: 2000

🧠 任务检测: 对话任务 (置信度: 100%)
🎯 模型选择: deepseek-chat  
⚖️  Token调整: 2000 → 1024 (对话任务优化)
💰 成本估算: $0.0014
✅ 分配策略: cost-optimized
```

### 分析任务
```
输入: "分析这段代码的性能瓶颈"
原始max_tokens: 4000

🧠 任务检测: 分析任务 (置信度: 85%)
🎯 模型选择: claude-3-sonnet
⚖️  Token调整: 4000 → 4000 (保持原值)
💰 成本估算: $0.060
✅ 分配策略: balanced
```

## 🔍 监控和调试

### 1. **Token统计API**
```bash
curl http://localhost:8765/tokens/stats
```
```json
{
  "success": true,
  "stats": {
    "totalProviders": 9,
    "supportedTaskTypes": ["coding", "conversation", "analysis", "creative", "translation", "summary"],
    "averageOptimalTokens": 3863,
    "costRange": { "min": 0.0001, "max": 0.075, "median": 0.002 }
  }
}
```

### 2. **提供商限制查询**
```bash
curl "http://localhost:8765/tokens/limits?provider=deepseek"
```
```json
{
  "success": true,
  "provider": "deepseek", 
  "limits": {
    "deepseek-chat": { "min": 1, "max": 8192, "optimal": 4096, "cost_per_1k": 0.0014 },
    "deepseek-coder": { "min": 1, "max": 8192, "optimal": 4096, "cost_per_1k": 0.0014 }
  }
}
```

### 3. **Token估算**
```bash
curl -X POST http://localhost:8765/tokens/estimate \
  -H "Content-Type: application/json" \
  -d '{"text": "写一个Python函数", "provider": "deepseek", "model": "deepseek-coder"}'
```
```json
{
  "success": true,
  "estimatedTokens": 8,
  "textLength": 8,
  "limits": { "min": 1, "max": 8192, "optimal": 4096, "cost_per_1k": 0.0014 },
  "recommendations": {
    "conservative": 16,
    "recommended": 24,
    "generous": 32
  }
}
```

### 4. **详细分析报告**
```bash
curl -X POST http://localhost:8765/tokens/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "claudeRequest": {
      "max_tokens": 4000,
      "messages": [{"role": "user", "content": "写代码"}]
    },
    "provider": "deepseek",
    "model": "deepseek-coder", 
    "taskType": "coding"
  }'
```

## 📈 性能优化建议

### 1. **任务类型匹配**
- ✅ **编程任务** → 使用带"coder"的模型
- ✅ **对话任务** → 使用对话优化模型
- ✅ **分析任务** → 选择推理能力强的模型
- ✅ **创作任务** → 分配充足的token额度

### 2. **成本控制**
- 💰 **预算有限** → 设置`prioritize_cost: true`
- 🎯 **质量要求高** → 设置`prioritize_quality: true`
- ⚡ **速度要求快** → 设置`prioritize_speed: true`

### 3. **最佳实践**
```javascript
// 在Claude API请求中添加优化参数
{
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 4000,
  "messages": [...],
  
  // 智能优化参数（可选）
  "prioritize_cost": false,      // 成本优先
  "prioritize_quality": true,    // 质量优先（推荐）
  "prioritize_speed": false      // 速度优先
}
```

## 🚨 故障排除

### 常见问题

#### 1. **Token分配异常**
```
症状: Token分配不合理
解决: 检查任务类型检测是否准确
调试: GET /tokens/analyze 查看详细分析
```

#### 2. **成本超出预期**
```
症状: API调用成本过高
解决: 启用成本优先模式
配置: "prioritize_cost": true
```

#### 3. **输出质量不佳**
```
症状: 生成内容质量下降
解决: 启用质量优先模式
配置: "prioritize_quality": true
```

#### 4. **响应速度慢**
```
症状: API响应时间过长
解决: 启用速度优先模式 + 选择快速模型
配置: "prioritize_speed": true
```

## 🎉 实际效果验证

基于实际测试，智能Token管理系统已经实现：

### ✅ **成功案例**
1. **编程任务自动检测** → `deepseek-coder` (置信度100%)
2. **Token智能调整** → 4000→4000 quality-focused策略
3. **API限制适配** → 自动符合DeepSeek 1-8192限制
4. **成本效益优化** → 选择最经济的高质量方案

### 📊 **监控数据**
- 支持9个主要LLM提供商
- 识别6种任务类型
- 平均最优Token值: 3863
- 成本范围: $0.0001-$0.075/1K tokens

---

**🎊 现在你的Claude Code拥有了真正智能的Token管理系统！**
- 🔄 **统一接口** - 无需修改现有代码
- 🧠 **智能适配** - 自动优化token分配
- 💰 **成本控制** - 平衡质量与成本
- 📊 **透明监控** - 完整的分析和调试工具
