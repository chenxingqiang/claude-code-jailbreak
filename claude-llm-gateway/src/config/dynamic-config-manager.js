const { LLMInterface } = require('llm-interface');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const fetch = require('node-fetch');

class DynamicConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, '../../config/providers.json');
    this.providersInfo = new Map();
    this.lastUpdate = null;
  }

  /**
   * 从llm-interface包动态获取所有支持的提供者信息
   */
  async discoverProviders() {
    try {
      console.log('🔍 正在从llm-interface包发现提供者...');
      
      // 获取llm-interface支持的所有提供者
      const providers = this.getAvailableProviders();
      
      const providerConfig = {};
      
      for (const providerName of providers) {
        try {
          // 尝试获取每providers的详细信息
          const providerInfo = await this.getProviderInfo(providerName);
          
          providerConfig[providerName] = {
            enabled: this.isProviderConfigured(providerName),
            priority: this.calculatePriority(providerName),
            models: providerInfo.models || [],
            capabilities: providerInfo.capabilities || {},
            rate_limit: providerInfo.rate_limit || 60,
            cost_per_1k_tokens: providerInfo.cost_per_1k_tokens || 0.001,
            requires_api_key: providerInfo.requires_api_key !== false,
            local: providerInfo.local || false,
            streaming_support: providerInfo.streaming_support !== false,
            last_updated: new Date().toISOString()
          };
          
          // 确保模型数组不为空，如果为空则使用静态默认值
          if (!providerInfo.models || providerInfo.models.length === 0) {
            const staticDefaults = this.getStaticProviderDetails(providerName);
            providerConfig[providerName].models = staticDefaults.default_models || ['default-model'];
          }
          
          console.log(`✅ 发现提供者: ${providerName} (${providerConfig[providerName].models?.length || 0} 个模型)`);
        } catch (error) {
          console.warn(`⚠️  跳过提供者 ${providerName}: ${error.message}`);
        }
      }
      
      await this.saveConfig(providerConfig);
      this.lastUpdate = Date.now();
      
      console.log(`🎉 成功配置 ${Object.keys(providerConfig).length} providers`);
      return providerConfig;
      
    } catch (error) {
      console.error('❌ 动态配置发现失败:', error);
      throw error;
    }
  }

  /**
   * 获取llm-interface包中所有可用的提供者
   */
  getAvailableProviders() {
    // 从llm-interface包支持的36providers列表
    return [
      'openai', 'anthropic', 'google', 'cohere', 'huggingface', 
      'ollama', 'mistral', 'groq', 'perplexity', 'ai21',
      'nvidia', 'fireworks', 'together', 'anyscale', 'deepseek',
      'replicate', 'gooseai', 'forefront', 'writer', 'neets',
      'lamini', 'hyperbee', 'novita', 'shuttle', 'theb',
      'corcel', 'aimlapi', 'ailayer', 'monster', 'deepinfra',
      'friendliai', 'reka', 'voyage', 'watsonx', 'zhipu',
      'llamacpp'
    ];
  }

  /**
   * 获取特定提供者的详细信息
   */
  async getProviderInfo(providerName) {
    try {
      // 根据提供者类型返回相应的配置信息
      const providerDetails = this.getStaticProviderDetails(providerName);
      
      // 尝试获取支持的模型列表
      let models = [];
      try {
        // 某些提供者可能有API来获取模型列表
        models = await this.getProviderModels(providerName);
      } catch (error) {
        // 如果无法动态获取，使用静态列表
        models = providerDetails.default_models || [];
      }
      
      return {
        ...providerDetails,
        models: models
      };
      
    } catch (error) {
      throw new Error(`无法获取提供者 ${providerName} 的信息: ${error.message}`);
    }
  }

  /**
   * 获取提供者的静态详细信息
   */
  getStaticProviderDetails(providerName) {
    const providerDetails = {
      'openai': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.03,
        rate_limit: 60,
        default_models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'],
        streaming_support: true,
        capabilities: { chat: true, completion: true, embeddings: true }
      },
      'anthropic': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.015,
        rate_limit: 50,
        default_models: ['claude-3-sonnet', 'claude-3-haiku', 'claude-3-opus'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'google': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.001,
        rate_limit: 100,
        default_models: ['gemini-pro', 'gemini-flash', 'gemini-ultra'],
        streaming_support: true,
        capabilities: { chat: true, completion: true, vision: true }
      },
      'ollama': {
        requires_api_key: false,
        local: true,
        cost_per_1k_tokens: 0.0,
        rate_limit: 1000,
        default_models: ['llama2', 'codellama', 'mistral', 'vicuna'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'cohere': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.02,
        rate_limit: 40,
        default_models: ['command-r-plus', 'command', 'command-light'],
        streaming_support: true,
        capabilities: { chat: true, completion: true, embeddings: true }
      },
      'huggingface': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.001,
        rate_limit: 30,
        default_models: ['microsoft/DialoGPT-large', 'microsoft/DialoGPT-medium'],
        streaming_support: false,
        capabilities: { chat: true, completion: true }
      },
      'mistral': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.025,
        rate_limit: 50,
        default_models: ['mistral-large', 'mistral-medium', 'mistral-small'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'groq': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.001,
        rate_limit: 30,
        default_models: ['llama2-70b-4096', 'mixtral-8x7b-32768'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'perplexity': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.02,
        rate_limit: 20,
        default_models: ['pplx-7b-online', 'pplx-70b-online', 'pplx-7b-chat', 'pplx-70b-chat'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'ai21': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.025,
        rate_limit: 20,
        default_models: ['j2-ultra', 'j2-mid', 'j2-light'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'nvidia': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.015,
        rate_limit: 30,
        default_models: ['nv-llama2-70b', 'nv-code-llama-70b'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'fireworks': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.002,
        rate_limit: 40,
        default_models: ['llama-v2-7b-chat', 'llama-v2-13b-chat', 'llama-v2-70b-chat'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'together': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.002,
        rate_limit: 40,
        default_models: ['togethercomputer/llama-2-7b-chat', 'togethercomputer/llama-2-13b-chat', 'togethercomputer/llama-2-70b-chat'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'anyscale': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.001,
        rate_limit: 50,
        default_models: ['meta-llama/Llama-2-7b-chat-hf', 'meta-llama/Llama-2-13b-chat-hf', 'meta-llama/Llama-2-70b-chat-hf'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'deepseek': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.001,
        rate_limit: 30,
        default_models: ['deepseek-chat', 'deepseek-coder'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'replicate': {
        requires_api_key: true,
        local: false,
        cost_per_1k_tokens: 0.005,
        rate_limit: 20,
        default_models: ['llama-2-70b-chat', 'llama-2-13b-chat', 'llama-2-7b-chat'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      },
      'llamacpp': {
        requires_api_key: false,
        local: true,
        cost_per_1k_tokens: 0.0,
        rate_limit: 1000,
        default_models: ['llama-2-7b-chat', 'llama-2-13b-chat', 'codellama-7b-instruct'],
        streaming_support: true,
        capabilities: { chat: true, completion: true }
      }
    };
    
    return providerDetails[providerName] || {
      requires_api_key: true,
      local: false,
      cost_per_1k_tokens: 0.01,
      rate_limit: 30,
      default_models: ['default-model'],
      streaming_support: true,
      capabilities: { chat: true, completion: true }
    };
  }

  /**
   * 尝试动态获取提供者支持的模型列表
   */
  async getProviderModels(providerName) {
    // 首先获取静态默认模型列表作为备用
    const staticDetails = this.getStaticProviderDetails(providerName);
    const defaultModels = staticDetails.default_models || [];
    
    // 对于某些提供者，我们可以尝试调用其API获取模型列表
    try {
      switch (providerName) {
        case 'openai':
          const openaiModels = await this.getOpenAIModels();
          return openaiModels.length > 0 ? openaiModels : defaultModels;
        case 'ollama':
          const ollamaModels = await this.getOllamaModels();
          return ollamaModels.length > 0 ? ollamaModels : defaultModels;
        default:
          // 对于其他提供者，直接返回静态默认模型列表
          return defaultModels;
      }
    } catch (error) {
      console.warn(`Failed to get dynamic models for ${providerName}, using defaults: ${error.message}`);
      return defaultModels;
    }
  }

  async getOpenAIModels() {
    try {
      // 如果有OpenAI API密钥，尝试获取模型列表
      if (process.env.OPENAI_API_KEY) {
        // 这里可以调用OpenAI API获取模型列表
        // 为了简化，我们返回常用模型
        return ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'];
      }
    } catch (error) {
      console.warn('无法动态获取OpenAI模型列表，使用默认列表');
    }
    return ['gpt-4', 'gpt-3.5-turbo'];
  }

  async getOllamaModels() {
    try {
      // 尝试连接本地Ollama服务获取模型列表
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        return data.models?.map(model => model.name) || [];
      }
    } catch (error) {
      console.warn('无法连接到本地Ollama服务，使用默认模型列表');
    }
    return ['llama2', 'codellama', 'mistral'];
  }

  /**
   * 检查提供者是否已配置（有API密钥等）
   */
  isProviderConfigured(providerName) {
    const envVars = {
      'openai': 'OPENAI_API_KEY',
      'anthropic': 'ANTHROPIC_API_KEY',
      'google': 'GOOGLE_API_KEY',
      'cohere': 'COHERE_API_KEY',
      'huggingface': 'HUGGINGFACE_API_KEY',
      'mistral': 'MISTRAL_API_KEY',
      'groq': 'GROQ_API_KEY',
      'perplexity': 'PERPLEXITY_API_KEY',
      'ai21': 'AI21_API_KEY',
      'nvidia': 'NVIDIA_API_KEY',
      'fireworks': 'FIREWORKS_API_KEY',
      'together': 'TOGETHER_API_KEY',
      'deepseek': 'DEEPSEEK_API_KEY',
      'replicate': 'REPLICATE_API_KEY',
      'anyscale': 'ANYSCALE_API_KEY',
      'ollama': 'OLLAMA_AVAILABLE', // 本地服务检查
      'llamacpp': 'LLAMACPP_AVAILABLE'
    };
    
    const envVar = envVars[providerName];
    if (!envVar) return false;
    
    if (providerName === 'ollama') {
      // 对于Ollama，检查本地服务是否可用
      return this.checkOllamaAvailability();
    }
    
    if (providerName === 'llamacpp') {
      // 对于LLaMA.CPP，检查本地服务是否可用
      return this.checkLlamaCppAvailability();
    }
    
    return !!process.env[envVar];
  }

  async checkOllamaAvailability() {
    try {
      const response = await fetch('http://localhost:11434/api/version', {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async checkLlamaCppAvailability() {
    try {
      const baseUrl = process.env.LLAMACPP_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * 根据提供者特性计算优先级
   */
  calculatePriority(providerName) {
    const priorities = {
      'deepseek': 1,   // 用户特别配置，最高优先级
      'openai': 2,     // 最稳定，但成本较高
      'anthropic': 3,  // 高质量
      'google': 4,     // 成本效益好
      'ollama': 5,     // 本地部署，无成本
      'cohere': 6,     // 专业API
      'mistral': 7,    // 开源友好
      'groq': 8,       // 高速推理
      'huggingface': 9 // 开源模型
    };
    
    return priorities[providerName] || 10;
  }

  /**
   * 保存配置到文件
   */
  async saveConfig(config) {
    try {
      const configDir = path.dirname(this.configPath);
      await fs.mkdir(configDir, { recursive: true });
      
      const configData = {
        generated_at: new Date().toISOString(),
        llm_interface_version: await this.getLLMInterfaceVersion(),
        total_providers: Object.keys(config).length,
        enabled_providers: Object.values(config).filter(p => p.enabled).length,
        providers: config
      };
      
      await fs.writeFile(this.configPath, JSON.stringify(configData, null, 2));
      console.log(`💾 配置已保存到: ${this.configPath}`);
    } catch (error) {
      console.error('❌ 保存配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取llm-interface包版本
   */
  async getLLMInterfaceVersion() {
    try {
      const packagePath = require.resolve('llm-interface/package.json');
      const packageData = JSON.parse(await fs.readFile(packagePath, 'utf8'));
      return packageData.version;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * 加载现有配置
   */
  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.log('📝 配置文件不存在，将创建新配置');
      return null;
    }
  }

  /**
   * 检查是否需要更新配置
   */
  async shouldUpdateConfig() {
    const existingConfig = await this.loadConfig();
    if (!existingConfig) return true;
    
    // 检查配置是否过期（例如，超过24小时）
    const configAge = Date.now() - new Date(existingConfig.generated_at).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24小时
    
    return configAge > maxAge;
  }

  /**
   * 获取当前配置
   */
  async getConfig() {
    return await this.loadConfig();
  }

  /**
   * 保存配置到文件
   */
  async saveConfig(config) {
    try {
      config.generated_at = new Date().toISOString();
      config.version = '1.1.0';
      
      const configDir = path.dirname(this.configPath);
      if (!fsSync.existsSync(configDir)) {
        fsSync.mkdirSync(configDir, { recursive: true });
      }
      
      fsSync.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      console.log(`✅ Configuration saved to ${this.configPath}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
      throw error;
    }
  }
}

module.exports = DynamicConfigManager;
