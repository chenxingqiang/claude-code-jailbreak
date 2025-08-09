# 🚀 Claude Code Jailbreak Tutorial

**Complete guide to bypass Claude CLI organization restrictions using Moonshot API**

This comprehensive tutorial shows you how to install Claude Code, bypass organization authentication, and use your own Moonshot API key instead.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Install Claude Code](#step-1-install-claude-code)
3. [Step 2: Get Moonshot API Key](#step-2-get-moonshot-api-key)
4. [Step 3: Jailbreak Setup](#step-3-jailbreak-setup)
5. [Step 4: Create GitHub Repository](#step-4-create-github-repository)
6. [Step 5: Testing & Verification](#step-5-testing--verification)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **macOS/Linux/Windows** with terminal access
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **GitHub account** - [Sign up here](https://github.com/)

---

## Step 1: Install Claude Code

### Option A: Direct Installation (Recommended)
```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

### Option B: Alternative Installation Methods
```bash
# Using curl (Linux/macOS)
curl -fsSL https://claude.ai/claude-code/install.sh | sh

# Using PowerShell (Windows)
irm https://claude.ai/claude-code/install.ps1 | iex
```

### Verify Installation
```bash
# Check if Claude is installed correctly
which claude
claude --help
```

---

## Step 2: Get Moonshot API Key

### 2.1 Register at Moonshot AI
1. Visit [Moonshot AI Console](https://platform.moonshot.cn/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key

### 2.2 API Key Format
Your key should look like: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**🔒 Security Note**: Never share your API key publicly!

---

## Step 3: Jailbreak Setup

### 3.1 Create Project Directory
```bash
# Create and navigate to project directory
mkdir claude-code-jailbreak
cd claude-code-jailbreak

# Initialize git repository
git init
```

### 3.2 Create Environment Configuration

Create the jailbreak environment file:

```bash
cat > claude-env.sh << 'EOF'
#!/bin/bash
# Claude CLI Jailbreak Configuration for Moonshot API
# This bypasses organization authentication

# Decode base64 encoded API key (security through obscurity)
ENCODED_KEY="c2stNTBmR2I2ZzlYN2w2N1ZOQzFKQ0VoMWtjclFJQmVnbEhyUHN6MDlSSTVmWGcwSVQx"
DECODED_KEY=$(echo $ENCODED_KEY | base64 -d)

# Set environment variables for Claude CLI
export ANTHROPIC_API_KEY="$DECODED_KEY"
export ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic"

# Alternative variables for compatibility
export MOONSHOT_API_KEY="$DECODED_KEY"
export MOONSHOT_BASE_URL="https://api.moonshot.cn/anthropic"
export ANTHROPIC_AUTH_TOKEN="$DECODED_KEY"

# Success message
echo "🔓 Claude CLI Jailbreak Activated!"
echo "🔑 API Key: ${ANTHROPIC_API_KEY:0:10}..."
echo "🌐 Endpoint: $ANTHROPIC_BASE_URL"
echo "✅ Ready to bypass organization restrictions!"
echo ""
echo "Usage: claude --print 'your prompt here'"
EOF

# Make executable
chmod +x claude-env.sh
```

### 3.3 Create Configuration File
```bash
cat > .claude-jailbreak-config << 'EOF'
{
  "version": "1.0.0",
  "provider": "moonshot",
  "bypass_auth": true,
  "api_endpoint": "https://api.moonshot.cn/anthropic",
  "features": {
    "no_organization_required": true,
    "custom_api_key": true,
    "bypass_restrictions": true
  }
}
EOF
```

---

## Step 4: Create GitHub Repository

### 4.1 Create Repository on GitHub
```bash
# Login to GitHub CLI (if not already)
gh auth login

# Create repository
gh repo create claude-code-jailbreak --public --description "Claude CLI jailbreak using Moonshot API to bypass organization restrictions"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/claude-code-jailbreak.git
```

### 4.2 Create Additional Files

**Create .gitignore:**
```bash
cat > .gitignore << 'EOF'
# Security - Never commit real API keys
*.env
.env.*
**/secrets/**
**/*secret*
**/*key*

# Logs
*.log
logs/

# OS Files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Dependencies
node_modules/
EOF
```

**Create LICENSE:**
```bash
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 Claude Code Jailbreak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
```

### 4.3 Commit and Push
```bash
# Stage all files
git add .

# Commit changes
git commit -m "🚀 Initial commit: Claude Code jailbreak setup with Moonshot API"

# Push to GitHub
git push -u origin main
```

---

## Step 5: Testing & Verification

### 5.1 Test the Jailbreak
```bash
# Activate jailbreak environment
source claude-env.sh

# Test basic functionality
claude --print "Hello! Are you working without organization authentication?"

# Test with more complex prompt
claude --print "Write a simple Python function to calculate fibonacci numbers"
```

### 5.2 Verify Success Indicators
You should see:
- ✅ No organization authentication errors
- ✅ Successful API responses
- ✅ Custom endpoint being used
- ✅ API key properly loaded

---

## Usage Examples

### Quick Start
```bash
# Every time you want to use Claude CLI:
source claude-env.sh
claude --print "Your prompt here"
```

### Interactive Mode
```bash
source claude-env.sh
claude
# Now you can chat interactively!
```

### Advanced Usage
```bash
# With specific model
claude --print --model sonnet "Explain quantum computing"

# With output formatting
claude --print --output-format json "List 5 programming languages"

# Continue conversation
claude --continue
```

### Permanent Setup (Optional)
Add to your `~/.zshrc` or `~/.bashrc`:
```bash
# Auto-load Claude jailbreak on terminal start
if [ -f "$HOME/claude-code-jailbreak/claude-env.sh" ]; then
    source "$HOME/claude-code-jailbreak/claude-env.sh"
fi
```

---

## 🔧 Troubleshooting

### Common Issues

**Error: "This organization has been disabled"**
- ✅ **Solution**: Use this jailbreak! It bypasses organization auth entirely.

**Error: "API key not found"**
- Check if environment variables are set: `echo $ANTHROPIC_API_KEY`
- Re-run: `source claude-env.sh`
- Verify your Moonshot API key is valid

**Error: "Connection refused"**
- Check your internet connection
- Verify Moonshot API endpoint is accessible
- Ensure your API key has sufficient credits

**Error: "Invalid base64 encoding"**
- The encoded key might be corrupted
- Replace with your actual API key in the script

### Debug Mode
```bash
# Enable debug mode for detailed error information
claude --debug --print "test prompt"
```

### Manual Configuration
If the automated setup doesn't work, manually set:
```bash
export ANTHROPIC_API_KEY="your-actual-moonshot-api-key"
export ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic"
```

---

## 🔒 Security Notes

1. **API Key Encoding**: The tutorial uses base64 encoding for basic obfuscation
2. **Never commit real keys**: Always use environment variables or encoded formats
3. **Regular rotation**: Rotate your API keys periodically
4. **Monitor usage**: Keep track of your API usage and costs

---

## 📈 API Key Information

- **Provider**: Moonshot AI (月之暗面)
- **Endpoint**: https://api.moonshot.cn/anthropic
- **Documentation**: [Moonshot API Docs](https://platform.moonshot.cn/docs)
- **Pricing**: Check current rates on their platform

---

## 🎉 Success Indicators

✅ Claude Code installed successfully  
✅ Moonshot API key configured  
✅ Organization authentication bypassed  
✅ Custom endpoint working  
✅ GitHub repository created  
✅ Jailbreak environment functional  
✅ No subscription or organization required  

---

## 📱 Repository Structure

```
claude-code-jailbreak/
├── README.md                     # This tutorial
├── claude-env.sh                 # Main jailbreak script
├── .claude-jailbreak-config      # Configuration file
├── .gitignore                    # Git ignore patterns
├── LICENSE                       # MIT License
└── examples/                     # Usage examples (optional)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## ⚖️ Legal Notice

This tutorial is for educational purposes. Always comply with:
- Anthropic's Terms of Service
- Moonshot AI's Terms of Service  
- Your local laws and regulations

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/claude-code-jailbreak/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/claude-code-jailbreak/discussions)
- **Email**: Replace with your contact info

---

**🎯 Goal Achieved**: Claude CLI now works without organization registration using your personal Moonshot API key!
