#!/bin/bash
# Claude CLI Jailbreak Configuration for Moonshot API
# This bypasses organization authentication
# Usage: source claude-env.sh

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
