#!/bin/bash
# Claude CLI Multi-LLM Gateway Configuration
# Supports 36 LLM providers including OpenAI, Google Gemini, Ollama, etc.
# Usage: source claude-env.sh

# 检查是否选择使用多LLM网关
USE_MULTI_LLM_GATEWAY=${USE_MULTI_LLM_GATEWAY:-true}

if [ "$USE_MULTI_LLM_GATEWAY" = "true" ]; then
    echo "🚀 启动Multi-LLM Gateway模式..."
    
    # 检查网关目录是否存在
    GATEWAY_DIR="/Users/xingqiangchen/claude/claude-code-jailbreak/claude-llm-gateway"
    
    if [ -d "$GATEWAY_DIR" ]; then
        # 检查网关是否已运行
        if ! pgrep -f "claude-llm-gateway" > /dev/null; then
            echo "🌐 启动LLM网关服务..."
            cd "$GATEWAY_DIR"
            
            # 后台启动网关
            nohup ./scripts/start.sh > /tmp/claude-gateway.log 2>&1 &
            GATEWAY_PID=$!
            
            # 等待网关启动
            echo "⏳ 等待网关启动..."
            sleep 8
            
            # 检查网关是否成功启动
            if curl -s http://localhost:8765/health > /dev/null 2>&1; then
                echo "✅ Multi-LLM Gateway启动成功!"
                
                # 设置Claude Code使用网关
                export ANTHROPIC_API_KEY="gateway-bypass-token"
                export ANTHROPIC_BASE_URL="http://localhost:8765"
                export ANTHROPIC_AUTH_TOKEN="gateway-bypass-token"
                
                echo ""
                echo "🎯 Multi-LLM Gateway已激活!"
                echo "🤖 支持36个LLM提供者:"
                echo "   • OpenAI (GPT-4, GPT-3.5 Turbo)"
                echo "   • Google Gemini (Pro, Flash, Ultra)"
                echo "   • Anthropic Claude (Sonnet, Haiku, Opus)"
                echo "   • Cohere (Command-R-Plus)"
                echo "   • Ollama (Llama2, CodeLlama, Mistral)"
                echo "   • Mistral AI, Groq, Hugging Face..."
                echo "   • 还有其他28个提供者!"
                echo ""
                echo "🔧 网关管理:"
                echo "   • 健康检查: curl http://localhost:8765/health"
                echo "   • 提供者状态: curl http://localhost:8765/providers"
                echo "   • 刷新配置: curl http://localhost:8765/providers/refresh"
                echo ""
                echo "✅ Claude Code现在可以智能路由到最佳LLM提供者!"
                
            else
                echo "❌ 网关启动失败，回退到Moonshot模式"
                USE_MULTI_LLM_GATEWAY=false
            fi
            
            # 返回原目录
            cd - > /dev/null
        else
            echo "✅ Multi-LLM Gateway已在运行"
            
            # 设置Claude Code使用网关
            export ANTHROPIC_API_KEY="gateway-bypass-token"
            export ANTHROPIC_BASE_URL="http://localhost:8765"
            export ANTHROPIC_AUTH_TOKEN="gateway-bypass-token"
            
            echo "🎯 Multi-LLM Gateway模式已激活!"
        fi
    else
        echo "❌ 找不到网关目录，回退到Moonshot模式"
        USE_MULTI_LLM_GATEWAY=false
    fi
fi

# 如果网关模式失败或被禁用，使用原始Moonshot配置
if [ "$USE_MULTI_LLM_GATEWAY" != "true" ]; then
    echo "🔓 启动Claude CLI Jailbreak (Moonshot API模式)..."
    
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
    echo "🔑 API Key: ${ANTHROPIC_API_KEY:0:10}..."
    echo "🌐 Endpoint: $ANTHROPIC_BASE_URL"
    echo "✅ Ready to bypass organization restrictions!"
fi

echo ""
echo "💡 使用方法:"
echo "   claude --print 'your prompt here'"
echo "   claude  # 进入交互模式"
echo ""
echo "🔧 切换模式:"
echo "   export USE_MULTI_LLM_GATEWAY=false && source claude-env.sh  # 使用Moonshot"
echo "   export USE_MULTI_LLM_GATEWAY=true && source claude-env.sh   # 使用Multi-LLM网关"
