# Claude LLM Gateway

🚀 **A comprehensive API gateway that enables Claude Code to work with 36+ LLM providers**

An intelligent API gateway built on top of the [llm-interface](https://github.com/samestrin/llm-interface) package, enabling Claude Code to seamlessly integrate with OpenAI, Google Gemini, Ollama, Cohere, and 33 other LLM providers.

## ✨ Features

- 🤖 **36+ LLM Provider Support**: OpenAI, Anthropic, Google Gemini, Cohere, Hugging Face, Ollama, Mistral AI, and more
- 🔄 **Dynamic Configuration**: Automatically discover and configure available providers
- ⚡ **Intelligent Routing**: Smart routing based on model type, health status, and cost
- 🔄 **Automatic Failover**: Seamlessly switch to backup providers when primary fails
- 📊 **Real-time Monitoring**: Provider health status and performance monitoring
- 💰 **Cost Optimization**: Intelligently select the most cost-effective available provider
- 🏠 **Local LLM Support**: Support for Ollama, LLaMA.CPP, and other local deployments
- 🔐 **Security Features**: Rate limiting, CORS, security headers, and input validation
- 📈 **Load Balancing**: Multiple load balancing strategies available
- ✅ **Claude Code Compatible**: 100% compatible with Claude Code API format

## 🎯 Supported Providers & Models

### 🔗 Remote Providers

#### **OpenAI**
- `gpt-4` - Most capable GPT-4 model
- `gpt-4-turbo` - Fast and capable GPT-4 variant
- `gpt-3.5-turbo` - Fast, cost-effective model
- `gpt-4o` - Multimodal GPT-4 variant
- `gpt-4o-mini` - Smaller, faster GPT-4o variant

#### **Anthropic Claude**
- `claude-3-opus` - Most powerful Claude model
- `claude-3-sonnet` - Balanced performance and speed
- `claude-3-haiku` - Fast and cost-effective
- `claude-3-5-sonnet` - Latest Sonnet variant
- `claude-instant` - Fast Claude variant

#### **Google Gemini**
- `gemini-pro` - Advanced reasoning and generation
- `gemini-pro-vision` - Multimodal with vision capabilities
- `gemini-flash` - Fast and efficient model
- `gemini-ultra` - Most capable Gemini model

#### **Cohere**
- `command-r-plus` - Advanced reasoning model
- `command-r` - Balanced performance model
- `command` - General purpose model
- `command-light` - Fast and lightweight
- `command-nightly` - Latest experimental features

#### **Mistral AI**
- `mistral-large` - Most capable Mistral model
- `mistral-medium` - Balanced performance
- `mistral-small` - Fast and cost-effective
- `mistral-tiny` - Ultra-fast responses
- `mixtral-8x7b` - Mixture of experts model

#### **Groq** (Ultra-fast inference)
- `llama2-70b-4096` - Large Llama2 model
- `llama2-13b-chat` - Medium Llama2 chat model
- `llama2-7b-chat` - Fast Llama2 chat model
- `mixtral-8x7b-32768` - Fast Mixtral inference
- `gemma-7b-it` - Google's Gemma model

#### **Hugging Face Inference**
- `microsoft/DialoGPT-large` - Conversational AI
- `microsoft/DialoGPT-medium` - Medium conversational model
- `microsoft/DialoGPT-small` - Lightweight conversation
- `facebook/blenderbot-400M-distill` - Facebook's chatbot
- `EleutherAI/gpt-j-6B` - Open source GPT variant
- `bigscience/bloom-560m` - Multilingual model
- And 1000+ other open-source models

#### **NVIDIA AI**
- `nvidia/llama2-70b` - NVIDIA-optimized Llama2
- `nvidia/codellama-34b` - Code generation model
- `nvidia/mistral-7b` - NVIDIA-optimized Mistral

#### **Fireworks AI**
- `fireworks/llama-v2-70b-chat` - Optimized Llama2
- `fireworks/mixtral-8x7b-instruct` - Fast Mixtral
- `fireworks/yi-34b-200k` - Long context model

#### **Together AI**
- `together/llama-2-70b-chat` - Llama2 chat model
- `together/alpaca-7b` - Stanford Alpaca model
- `together/vicuna-13b` - Vicuna chat model
- `together/wizardlm-30b` - WizardLM model

#### **Replicate**
- `replicate/llama-2-70b-chat` - Llama2 on Replicate
- `replicate/vicuna-13b` - Vicuna model
- `replicate/alpaca-7b` - Alpaca model

#### **Perplexity AI**
- `pplx-7b-online` - Search-augmented generation
- `pplx-70b-online` - Large search-augmented model
- `pplx-7b-chat` - Conversational model
- `pplx-70b-chat` - Large conversational model

#### **AI21 Studio**
- `j2-ultra` - Most capable Jurassic model
- `j2-mid` - Balanced Jurassic model
- `j2-light` - Fast Jurassic model

#### **Additional Providers**
- **Anyscale**: Ray-optimized models
- **DeepSeek**: Advanced reasoning models
- **Lamini**: Custom fine-tuned models
- **Neets.ai**: Specialized AI models
- **Novita AI**: GPU-accelerated inference
- **Shuttle AI**: High-performance inference
- **TheB.ai**: Multiple model access
- **Corcel**: Decentralized AI network
- **AIMLAPI**: Unified AI API platform
- **AiLAYER**: Multi-model platform
- **Monster API**: Serverless AI inference
- **DeepInfra**: Scalable AI infrastructure
- **FriendliAI**: Optimized AI serving
- **Reka AI**: Advanced language models
- **Voyage AI**: Embedding models
- **Watsonx AI**: IBM's enterprise AI
- **Zhipu AI**: Chinese language models
- **Writer**: Content generation models

### 🏠 Local Providers

#### **Ollama** (Local deployment)
- `llama2` - Meta's Llama2 models (7B, 13B, 70B)
- `llama2-uncensored` - Uncensored Llama2 variants
- `codellama` - Code generation Llama models
- `codellama:13b-instruct` - Code instruction model
- `mistral` - Mistral models (7B variants)
- `mixtral` - Mixtral 8x7B models
- `vicuna` - Vicuna chat models
- `alpaca` - Stanford Alpaca models
- `orca-mini` - Microsoft Orca variants
- `wizard-vicuna-uncensored` - Wizard models
- `phind-codellama` - Phind's code models
- `dolphin-mistral` - Dolphin fine-tuned models
- `neural-chat` - Intel's neural chat
- `starling-lm` - Starling language models
- `openchat` - OpenChat models
- `zephyr` - Zephyr instruction models
- `yi` - 01.AI's Yi models
- `deepseek-coder` - DeepSeek code models
- `magicoder` - Magic code generation
- `starcoder` - BigCode's StarCoder
- `wizardcoder` - WizardCoder models
- `sqlcoder` - SQL generation models
- `everythinglm` - Multi-task models
- `medllama2` - Medical Llama2 models
- `meditron` - Medical reasoning models
- `llava` - Large Language and Vision Assistant
- `bakllava` - BakLLaVA multimodal model

#### **LLaMA.CPP** (C++ implementation)
- Any GGML/GGUF format models
- Quantized versions (Q4_0, Q4_1, Q5_0, Q5_1, Q8_0)
- Custom fine-tuned models
- LoRA adapted models

#### **Local OpenAI-Compatible APIs**
- **Text Generation WebUI**: Popular local inference
- **FastChat**: Multi-model serving
- **vLLM**: High-throughput inference
- **TensorRT-LLM**: NVIDIA optimized serving
- **OpenLLM**: BentoML's model serving

## 🚀 Quick Start

### 1. Installation

```bash
npm install claude-llm-gateway
```

Or clone this repository:

```bash
git clone https://github.com/username/claude-llm-gateway.git
cd claude-llm-gateway
npm install
```

### 2. Environment Configuration

Copy and edit the environment configuration file:

```bash
cp env.example .env
```

Edit the `.env` file with your API keys:

```env
# Required: At least one provider API key
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Additional providers
ANTHROPIC_API_KEY=your_anthropic_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
AI21_API_KEY=your_ai21_api_key_here
NVIDIA_API_KEY=your_nvidia_api_key_here
FIREWORKS_API_KEY=your_fireworks_api_key_here
TOGETHER_API_KEY=your_together_api_key_here
REPLICATE_API_KEY=your_replicate_api_key_here

# Local LLM Settings
OLLAMA_BASE_URL=http://localhost:11434
LLAMACPP_BASE_URL=http://localhost:8080
```

### 3. Start the Gateway

```bash
# Using the start script (recommended)
./scripts/start.sh

# Or run directly
npm start
```

### 4. Integration with Claude Code

Update your Claude environment script:

```bash
#!/bin/bash
# Start LLM Gateway
cd /path/to/claude-llm-gateway
./scripts/start.sh &

# Wait for gateway to start
sleep 5

# Configure Claude Code to use the gateway
export ANTHROPIC_API_KEY="gateway-bypass-token"
export ANTHROPIC_BASE_URL="http://localhost:3000"
export ANTHROPIC_AUTH_TOKEN="gateway-bypass-token"

echo "🎯 Multi-LLM Gateway activated!"
echo "🤖 Claude Code now supports 36+ LLM providers!"
```

### 5. Using Claude Code

```bash
# Activate environment
source claude-env.sh

# Use Claude Code with multi-provider support
claude --print "Hello! Please explain quantum computing"
claude  # Interactive mode
```

## 📊 API Endpoints

### Claude Code Compatible Endpoints

- `POST /v1/messages` - Claude Messages API
- `POST /v1/chat/completions` - OpenAI-compatible Chat API
- `POST /anthropic/v1/messages` - Anthropic native endpoint

### Management Endpoints

- `GET /health` - Health check
- `GET /providers` - Provider status
- `GET /providers/refresh` - Refresh provider configuration
- `GET /models` - List supported models
- `GET /config` - Current configuration
- `GET /stats` - Statistics and metrics

## 💡 Usage Examples

### Basic Request

```bash
curl -X POST http://localhost:3000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-sonnet",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "max_tokens": 100
  }'
```

### Streaming Response

```bash
curl -X POST http://localhost:3000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-sonnet",
    "messages": [
      {"role": "user", "content": "Write a poem"}
    ],
    "stream": true
  }'
```

### Check Provider Status

```bash
curl http://localhost:3000/providers
```

### Test Specific Model

```bash
# Test OpenAI GPT-4
curl -X POST http://localhost:3000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello from GPT-4!"}]
  }'

# Test Google Gemini
curl -X POST http://localhost:3000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-pro",
    "messages": [{"role": "user", "content": "Hello from Gemini!"}]
  }'

# Test local Ollama
curl -X POST http://localhost:3000/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "messages": [{"role": "user", "content": "Hello from Ollama!"}]
  }'
```

## ⚙️ Configuration Options

### Load Balancing Strategies

The gateway supports multiple load balancing strategies:

- `priority` (default): Select by priority order
- `round_robin`: Round-robin distribution
- `least_requests`: Route to provider with fewest requests
- `cost_optimized`: Route to most cost-effective provider
- `random`: Random selection

### Model Mapping

The gateway automatically maps Claude models to optimal provider models:

- `claude-3-sonnet` → `gpt-4` (OpenAI) / `gemini-pro` (Google) / `command-r-plus` (Cohere)
- `claude-3-haiku` → `gpt-3.5-turbo` (OpenAI) / `gemini-flash` (Google) / `command` (Cohere)
- `claude-3-opus` → `gpt-4-turbo` (OpenAI) / `gemini-ultra` (Google) / `mistral-large` (Mistral)

### Environment Variables

```env
# Gateway Settings
GATEWAY_PORT=3000
GATEWAY_HOST=localhost
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Load Balancing
LOAD_BALANCE_STRATEGY=priority

# Caching
ENABLE_CACHE=true
CACHE_TTL_SECONDS=300

# Security
CORS_ORIGIN=*
ENABLE_RATE_LIMITING=true
```

## 🧪 Testing

### Run Tests

```bash
# Install test dependencies
npm install --dev

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:providers
```

### Test Individual Providers

```bash
# Test OpenAI
node test/providers/openai.test.js

# Test Google Gemini
node test/providers/google.test.js

# Test local Ollama
node test/providers/ollama.test.js
```

## 📈 Monitoring and Statistics

### Health Check

```bash
curl http://localhost:3000/health
```

Returns gateway and all provider health status.

### Statistics

```bash
curl http://localhost:3000/stats
```

Returns request distribution, provider usage, and performance metrics.

### Real-time Monitoring

```bash
# Watch provider status
watch -n 5 "curl -s http://localhost:3000/providers | jq '.summary'"

# Monitor logs
tail -f /tmp/claude-gateway.log
```

## 🐛 Troubleshooting

### Common Issues

**1. Provider Not Available**
```bash
# Check provider status
curl http://localhost:3000/providers

# Refresh provider configuration
curl http://localhost:3000/providers/refresh
```

**2. API Key Errors**
- Check `.env` file for correct API keys
- Ensure API keys are valid and have sufficient quota
- Verify environment variables are loaded: `printenv | grep API_KEY`

**3. Local Service Connection Failed**
```bash
# Check Ollama status
curl http://localhost:11434/api/version

# Start Ollama service
ollama serve

# List available models
ollama list
```

**4. Port Already in Use**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
export GATEWAY_PORT=3001
npm start
```

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=debug
npm start
```

## 🔐 Security Considerations

- ✅ API key encryption and secure storage
- ✅ Rate limiting to prevent abuse
- ✅ CORS configuration for web applications
- ✅ Request validation and sanitization
- ✅ Security headers (Helmet.js)
- ✅ Input/output filtering

## 📦 NPM Package Usage

### Installation

```bash
npm install claude-llm-gateway
```

### Programmatic Usage

```javascript
const { ClaudeLLMGateway } = require('claude-llm-gateway');

// Create gateway instance
const gateway = new ClaudeLLMGateway();

// Start the gateway
await gateway.start(3000);

// The gateway is now running on port 3000
console.log('Gateway started successfully!');
```

### Express.js Integration

```javascript
const express = require('express');
const { ClaudeLLMGateway } = require('claude-llm-gateway');

const app = express();
const gateway = new ClaudeLLMGateway();

// Initialize gateway
await gateway.initialize();

// Mount gateway routes
app.use('/api/llm', gateway.app);

app.listen(8080, () => {
  console.log('App with LLM Gateway running on port 8080');
});
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup

```bash
# Clone repository
git clone https://github.com/username/claude-llm-gateway.git
cd claude-llm-gateway

# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your API keys

# Run in development mode
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **GitHub Issues**: [Report Issues](https://github.com/username/claude-llm-gateway/issues)
- **Documentation**: [Full Documentation](https://github.com/username/claude-llm-gateway/docs)
- **Community**: [Discussions](https://github.com/username/claude-llm-gateway/discussions)

## 🙏 Acknowledgments

- [llm-interface](https://github.com/samestrin/llm-interface) - Core LLM interface library
- [Claude Code](https://claude.ai/code) - AI programming assistant
- All open-source contributors

## 🔗 Related Projects

- [llm-interface](https://github.com/samestrin/llm-interface) - Universal LLM interface
- [Claude Code](https://claude.ai/code) - AI-powered coding assistant
- [Ollama](https://ollama.ai) - Local LLM deployment
- [OpenAI API](https://openai.com/api) - OpenAI's language models

---

**🎯 Unlock the power of 36+ LLM providers in Claude Code - Start your AI coding revolution today!** 🚀