# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a configuration setup repository that enables using Claude CLI with Moonshot AI's API instead of Anthropic's API, bypassing organization registration requirements through environment variable redirection.

## Quick Start Commands
```bash
# Activate jailbreak environment
source claude-env.sh

# Verify setup and test API
claude --print "Hello! Verify jailbreak is working"

# Interactive chat mode
claude

# Use specific model
claude --print --model sonnet "Explain quantum computing"

# Debug mode for troubleshooting
claude --debug --print "test prompt"
```

## Environment Configuration
**claude-env.sh** automatically configures:
- `ANTHROPIC_API_KEY`: Base64-decoded Moonshot API key
- `ANTHROPIC_BASE_URL`: `https://api.moonshot.cn/anthropic`
- `ANTHROPIC_AUTH_TOKEN`: Same as API key for compatibility
- `MOONSHOT_API_KEY`: Alternative variable name
- `MOONSHOT_BASE_URL`: Alternative endpoint variable

## Permanent Setup
```bash
# Add to shell profile (choose one)
echo 'source ~/claude-code-jailbreak/claude-env.sh' >> ~/.zshrc
echo 'source ~/claude-code-jailbreak/claude-env.sh' >> ~/.bashrc

# Reload shell or source manually
source ~/.zshrc
```

## Architecture & Security Model
- **Type**: Environment variable redirection bridge
- **Security**: Base64-encoded API key for basic obfuscation
- **Compatibility**: Compatible with Claude CLI v1.0.72+
- **Provider**: Moonshot AI (Anthropic-compatible endpoint)
- **Authentication**: Bypasses organization requirements entirely

## Key Files & Purpose
- `claude-env.sh`: Main jailbreak script with encoded API key
- `README.md`: Complete tutorial with troubleshooting guide
- `.claude-jailbreak-config`: JSON configuration for features
- `.gitignore`: Prevents API key commits
- `LICENSE`: MIT license for the project

## Manual Configuration (if needed)
```bash
# Direct environment setup without script
export ANTHROPIC_API_KEY="your-moonshot-key"
export ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic"
```

## Troubleshooting Quick Fixes
- **"Organization disabled"**: ✅ This jailbreak bypasses it
- **"API key not found"**: Re-run `source claude-env.sh`
- **Connection issues**: Check internet and Moonshot endpoint
- **Invalid base64**: Replace with actual API key in script