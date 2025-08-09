# 🧪 Claude LLM Gateway - Complete Testing Guide

## 📋 **Quick Testing Checklist**

After installation, follow this step-by-step testing guide to ensure everything works correctly.

---

## 🚀 **Step 1: Installation**

### **Global Installation (Recommended)**
```bash
npm install -g claude-llm-gateway@1.2.3
```

### **Verify Installation**
```bash
claude-llm-gateway --version
# Expected output: 1.2.3

claude-llm-gateway --help
# Expected: Shows available commands and options
```

---

## 🔑 **Step 2: Environment Setup**

### **Set API Keys**
```bash
# Required: At least one API key
export DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Optional: Additional providers
export OPENAI_API_KEY=your_openai_api_key_here
export GOOGLE_API_KEY=your_google_api_key_here
export ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### **Verify Environment Variables**
```bash
echo $DEEPSEEK_API_KEY
# Should show your API key (not empty)
```

---

## 🟢 **Step 3: Start the Gateway**

### **Option A: Daemon Mode (Recommended)**
```bash
claude-llm-gateway start --port 8765 --daemon
```

### **Option B: Foreground Mode (for debugging)**
```bash
claude-llm-gateway start --port 8765
```

### **Expected Startup Output:**
```
🚀 Starting Claude LLM Gateway...
📊 Model performance tracking initialized
🚀 Initializing Claude LLM Gateway...
🔍 正在Setup dynamic providers...
...
✅ 发现提供者: deepseek (2 个模型)
...
✅ Configuration saved to [...]/config/providers.json
🎉 成功配置 36 providers
...
✅ Successfully configured 36 providers
🌐 Claude LLM Gateway started successfully!
📡 Service URL: http://localhost:8765
```

### **⚠️ Troubleshooting Startup Issues**

**If you see errors like:**
- `fs.existsSync is not a function` → Use version 1.2.3+
- `Cannot convert undefined or null to object` → Use version 1.2.3+
- `Model Not Exist` → Check DeepSeek API key

---

## ✅ **Step 4: Health Checks**

### **Basic Health Check**
```bash
curl http://localhost:8765/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-09T11:15:44.758Z",
  "providers": {"total": 36, "healthy": 2, "unhealthy": 34},
  "uptime": 1680.948760084,
  "memory": {...},
  "version": "1.1.0"
}
```

### **Provider Status Check**
```bash
curl http://localhost:8765/providers
```

**Look for DeepSeek status:**
```json
{
  "deepseek": {
    "enabled": true,
    "healthy": true,
    "models": ["deepseek-chat", "deepseek-coder"],
    "response_time": 3954
  }
}
```

---

## 🧠 **Step 5: API Testing**

### **Test 1: Basic Claude API Call**
```bash
curl -X POST http://localhost:8765/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-sonnet",
    "messages": [
      {"role": "user", "content": "Hello! Write a simple Python function."}
    ],
    "max_tokens": 500
  }'
```

**Expected Response:**
```json
{
  "id": "a6d04a2d-b710-4ef8-93f1-2ea529a7f7f5",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text", 
      "text": "Here's a simple Python function that prints \"Hello, World!\":\n\n```python\ndef hello_world():\n    print(\"Hello, World!\")\n..."
    }
  ],
  "model": "deepseek-model",
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 0, "output_tokens": 163}
}
```

### **Test 2: Intelligent Token Management**
```bash
curl -X POST http://localhost:8765/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-opus",
    "messages": [
      {"role": "user", "content": "Write a complete REST API in Python with FastAPI"}
    ],
    "max_tokens": 3000
  }'
```

**Check Console Output for Token Optimization:**
```
🧠 智能Token分配: 3000 → 4000 (quality-focused strategy)
📊 Token调整: +33% (+1000)
```

### **Test 3: Token Management APIs**
```bash
# Get token statistics
curl http://localhost:8765/tokens/stats

# Check provider limits
curl "http://localhost:8765/tokens/limits?provider=deepseek"

# Estimate tokens
curl -X POST http://localhost:8765/tokens/estimate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "provider": "deepseek"}'
```

---

## 🌐 **Step 6: Web Management Interface**

### **Open Web Dashboard**
```bash
open http://localhost:8765
```

**Expected Features:**
- ✅ Provider status overview
- ✅ API key management
- ✅ Token usage analytics
- ✅ Real-time performance metrics
- ✅ Configuration management

---

## 🔧 **Step 7: Advanced Testing**

### **Test Different Model Mappings**
```bash
# Test coding task (should use deepseek-coder)
curl -X POST http://localhost:8765/v1/messages \
  -d '{"model": "claude-3-opus", "messages": [{"role": "user", "content": "Debug this Python code"}], "max_tokens": 2000}'

# Test conversation (should use deepseek-chat)  
curl -X POST http://localhost:8765/v1/messages \
  -d '{"model": "claude-3-haiku", "messages": [{"role": "user", "content": "How are you today?"}], "max_tokens": 1000}'
```

### **Test Custom Optimization Preferences**
```bash
curl -X POST http://localhost:8765/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-sonnet",
    "messages": [{"role": "user", "content": "Explain machine learning"}],
    "max_tokens": 3000,
    "prioritize_cost": true,
    "prioritize_quality": false
  }'
```

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Service Won't Start**
```bash
# Check if port is in use
lsof -i :8765

# Kill existing process
pkill -f "claude-llm-gateway"

# Try different port
claude-llm-gateway start --port 8766
```

### **Issue 2: DeepSeek API Errors**
```bash
# Verify API key
echo $DEEPSEEK_API_KEY

# Test API key directly
curl -X POST https://api.deepseek.com/chat/completions \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-chat", "messages": [{"role": "user", "content": "Hello"}], "max_tokens": 100}'
```

### **Issue 3: No Response from Gateway**
```bash
# Check process status
ps aux | grep claude-llm-gateway

# Check logs (if using daemon)
tail -f ~/claude-llm-gateway.log

# Test basic connectivity
curl -I http://localhost:8765/health
```

### **Issue 4: Token Management Not Working**
```bash
# Check token management status
curl http://localhost:8765/tokens/stats

# Verify task detection
curl -X POST http://localhost:8765/tokens/analyze \
  -d '{"claudeRequest": {"max_tokens": 1000, "messages": [...]}, "provider": "deepseek"}'
```

---

## ✅ **Success Criteria**

**Your installation is successful if:**

1. ✅ **Version Check**: `claude-llm-gateway --version` returns `1.2.3`
2. ✅ **Startup Success**: Gateway starts without errors and shows provider discovery
3. ✅ **Health Check**: `/health` endpoint returns `"status": "healthy"`
4. ✅ **DeepSeek Integration**: DeepSeek shows as `"healthy": true` in `/providers`
5. ✅ **API Response**: `/v1/messages` returns valid Claude-format responses
6. ✅ **Token Management**: Console shows intelligent token allocation messages
7. ✅ **Web Interface**: http://localhost:8765 loads the management dashboard

---

## 📞 **Getting Help**

If you encounter issues:

1. **Check this guide first** - Most common issues are covered above
2. **Review logs** - Use `claude-llm-gateway --help` for debugging options
3. **GitHub Issues**: [Report Issues](https://github.com/chenxingqiang/claude-code-jailbreak/issues)
4. **NPM Package**: [claude-llm-gateway](https://www.npmjs.com/package/claude-llm-gateway)

---

**🎉 Happy Testing! Your Claude LLM Gateway should now be ready for production use!**
