# 📝 Examples

This directory contains example scripts and usage demonstrations for the Claude Code jailbreak.

## 🧪 Test Scripts

### `test-jailbreak.sh`
Comprehensive test script that verifies the jailbreak is working correctly.

**Usage:**
```bash
cd examples
./test-jailbreak.sh
```

**What it tests:**
- ✅ Basic Claude CLI functionality
- ✅ Math calculations
- ✅ Code generation
- ✅ Environment variable verification
- ✅ API endpoint connectivity

## 🚀 Quick Examples

### Basic Usage
```bash
source ../claude-env.sh
claude --print "Hello World!"
```

### Interactive Mode
```bash
source ../claude-env.sh
claude
# Start chatting!
```

### Code Generation
```bash
source ../claude-env.sh
claude --print "Write a Python function to calculate prime numbers"
```

### JSON Output
```bash
source ../claude-env.sh
claude --print --output-format json "List 3 programming languages"
```

## 🔍 Troubleshooting Examples

If you encounter issues, try these debug commands:

```bash
# Check environment variables
echo $ANTHROPIC_API_KEY
echo $ANTHROPIC_BASE_URL

# Test with debug mode
claude --debug --print "test"

# Manual configuration
export ANTHROPIC_API_KEY="your-key-here"
export ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic"
```

## 📚 More Examples

For more advanced usage examples, see the main [README.md](../README.md) file.
