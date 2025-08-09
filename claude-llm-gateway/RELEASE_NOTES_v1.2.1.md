# 🐛 Release Notes v1.2.1

**Release Date**: August 9, 2025  
**Type**: Patch Release (Bug Fix)

---

## 🎯 **Critical Fix Summary**

This patch release addresses a critical integration issue with DeepSeek provider that was causing "Model Not Exist" errors and improves international code standards.

---

## 🐛 **Bug Fixes**

### **DeepSeek Integration Fix**
- **🔧 Fixed "Model Not Exist" Error**: Added DeepSeek provider to all Claude model mappings
- **⚙️ Enhanced Model Mapping**: 
  - `claude-3-sonnet` → `deepseek-chat` (balanced conversation)
  - `claude-3-haiku` → `deepseek-chat` (fast conversation)  
  - `claude-3-opus` → `deepseek-coder` (advanced coding tasks)
- **✅ Validated Integration**: DeepSeek now works seamlessly with all Claude Code requests

### **Code Localization**
- **🌐 Complete Translation**: All Chinese comments and logs translated to English
- **📚 International Standards**: Consistent English documentation across codebase
- **🔄 Automated Translation**: Updated translation script for future maintenance

---

## 🔧 **Technical Changes**

### **Model Mapping Updates**
```javascript
// Before: DeepSeek missing from model mappings
'claude-3-sonnet': {
  'openai': 'gpt-4',
  'google': 'gemini-pro',
  // DeepSeek missing - fallback to default only
}

// After: DeepSeek properly mapped
'claude-3-sonnet': {
  'openai': 'gpt-4',
  'google': 'gemini-pro',
  'deepseek': 'deepseek-chat'  // ✅ Added
}
```

### **Error Resolution**
- **Before**: `AxiosError: Request failed with status code 400 - Model Not Exist`
- **After**: Successful DeepSeek API calls with proper model selection

---

## 📊 **Impact Analysis**

### **Before v1.2.1**
- ❌ DeepSeek provider selections failed with 400 errors
- 🌐 Mixed Chinese/English codebase
- 🔄 Manual fallback to default models only

### **After v1.2.1**
- ✅ DeepSeek works seamlessly with all Claude models
- 🌐 Fully internationalized English codebase  
- 🎯 Intelligent model mapping for all providers

---

## 🚀 **Upgrade Instructions**

### **Global Installation**
```bash
npm install -g claude-llm-gateway@1.2.1
```

### **Local Installation**
```bash
npm update claude-llm-gateway
```

### **Docker/Existing Deployments**
```bash
# Pull latest version
docker pull iechor/claude-llm-gateway:1.2.1

# Or restart daemon with auto-update
./scripts/daemon.sh restart
```

---

## ✅ **Verification**

### **Test DeepSeek Integration**
```bash
# Start the gateway
./scripts/daemon.sh start

# Test DeepSeek with Claude Code
curl -X POST http://localhost:8765/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-sonnet",
    "messages": [{"role": "user", "content": "Write a Python function"}],
    "max_tokens": 2000
  }'

# Expected: Successful response with deepseek-chat model
```

### **Verify Model Mapping**
```bash
# Check provider status
curl http://localhost:8765/providers

# Should show DeepSeek as healthy and properly configured
```

---

## 📈 **Performance Impact**

- **⚡ Zero Performance Impact**: Bug fix with no performance regression
- **🔧 Improved Reliability**: Eliminates 400 errors for DeepSeek users
- **🎯 Better Model Selection**: More accurate task-to-model mapping

---

## 🛠️ **Development Notes**

### **Breaking Changes**
- **None**: Fully backward compatible

### **Deprecations**
- **None**: All existing APIs maintained

### **Future Roadmap**
- Enhanced model capability detection
- Advanced task-specific model optimization
- Expanded provider integrations

---

## 🙏 **Acknowledgments**

- **Issue Reporter**: User feedback on DeepSeek integration
- **Community**: Ongoing support and testing
- **Core Team**: Rapid response and fix implementation

---

## 📞 **Support**

- **🐙 GitHub Issues**: [Report Issues](https://github.com/chenxingqiang/claude-code-jailbreak/issues)
- **📦 NPM Package**: [claude-llm-gateway](https://www.npmjs.com/package/claude-llm-gateway)
- **📚 Documentation**: [Full Documentation](https://github.com/chenxingqiang/claude-code-jailbreak/claude-llm-gateway)

---

**🎉 Ready to Code! DeepSeek integration is now rock-solid and ready for production use!**
