const { LLMInterface } = require('llm-interface');

class ProviderRouter {
  constructor() {
    this.providerConfig = new Map();
    this.healthStatus = new Map();
    this.requestCounts = new Map();
    this.lastHealthCheck = null;
    this.roundRobinIndex = 0;
  }

  /**
   * Initialize provider configuration
   */
  async initialize(providers) {
    this.providerConfig = new Map(Object.entries(providers));
    
    // 初始化请求计数
    for (const providerName of this.providerConfig.keys()) {
      this.requestCounts.set(providerName, 0);
    }

    // Start health checks
    await this.startHealthChecks();
    
    console.log(`🚀 Provider router initialization completed, supporting ${this.providerConfig.size} providers`);
  }

  /**
   * Select best provider
   */
  async selectProvider(request, options = {}) {
    try {
      // 1. 检查是否指定了特定提供者
      if (options.preferredProvider) {
        const provider = options.preferredProvider;
        if (this.isProviderHealthy(provider)) {
          console.log(`🎯 使用指定提供者: ${provider}`);
          return provider;
        }
      }

      // 2. Select provider based on model type
      const modelBasedProvider = this.selectByModel(request.model);
      if (modelBasedProvider && this.isProviderHealthy(modelBasedProvider)) {
        console.log(`🎯 根据模型选择提供者: ${modelBasedProvider} (模型: ${request.model})`);
        return modelBasedProvider;
      }

      // 3. Get healthy provider list
      const healthyProviders = this.getHealthyProviders();
      if (healthyProviders.length === 0) {
        throw new Error('No healthy providers available');
      }

      // 4. 根据负载均衡策略选择
      const selectedProvider = this.loadBalance(healthyProviders, options.strategy);
      
      console.log(`⚖️  负载均衡选择提供者: ${selectedProvider}`);
      return selectedProvider;

    } catch (error) {
      console.error('❌ Provider selection failed:', error);
      // 返回默认提供者作为最后的备选
      return this.getDefaultProvider();
    }
  }

  /**
   * Select provider based on model type
   */
  selectByModel(model) {
    if (!model) return null;

    const modelLower = model.toLowerCase();

    // OpenAI模型
    if (modelLower.includes('gpt')) {
      return 'openai';
    }

    // Google模型
    if (modelLower.includes('gemini')) {
      return 'google';
    }

    // Anthropic模型
    if (modelLower.includes('claude')) {
      return 'anthropic';
    }

    // Mistral模型
    if (modelLower.includes('mistral')) {
      return 'mistral';
    }

    // Ollama本地模型
    if (modelLower.includes('llama') || modelLower.includes('codellama')) {
      return 'ollama';
    }

    // Cohere模型
    if (modelLower.includes('command')) {
      return 'cohere';
    }

    return null;
  }

  /**
   * Get healthy provider list
   */
  getHealthyProviders() {
    const healthy = [];
    
    for (const [providerName, config] of this.providerConfig.entries()) {
      if (config.enabled && this.isProviderHealthy(providerName)) {
        healthy.push(providerName);
      }
    }

    // 按优先级排序
    return healthy.sort((a, b) => {
      const priorityA = this.providerConfig.get(a)?.priority || 10;
      const priorityB = this.providerConfig.get(b)?.priority || 10;
      return priorityA - priorityB;
    });
  }

  /**
   * Check if provider is healthy
   */
  isProviderHealthy(providerName) {
    const status = this.healthStatus.get(providerName);
    if (!status) return false;

    // 检查健康状态和最后检查时间
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const isRecent = (Date.now() - status.lastCheck) < maxAge;
    
    return status.healthy && isRecent;
  }

  /**
   * Load balancing algorithm
   */
  loadBalance(providers, strategy = 'priority') {
    if (providers.length === 0) {
      throw new Error('没有可用的提供者');
    }

    if (providers.length === 1) {
      return providers[0];
    }

    switch (strategy) {
      case 'round_robin':
        return this.roundRobinBalance(providers);
      
      case 'least_requests':
        return this.leastRequestsBalance(providers);
      
      case 'cost_optimized':
        return this.costOptimizedBalance(providers);
      
      case 'random':
        return providers[Math.floor(Math.random() * providers.length)];
      
      case 'priority':
      default:
        return this.priorityBalance(providers);
    }
  }

  /**
   * Round-robin load balancing
   */
  roundRobinBalance(providers) {
    const provider = providers[this.roundRobinIndex % providers.length];
    this.roundRobinIndex++;
    return provider;
  }

  /**
   * Least requests load balancing
   */
  leastRequestsBalance(providers) {
    let minRequests = Infinity;
    let selectedProvider = providers[0];

    for (const provider of providers) {
      const requestCount = this.requestCounts.get(provider) || 0;
      if (requestCount < minRequests) {
        minRequests = requestCount;
        selectedProvider = provider;
      }
    }

    return selectedProvider;
  }

  /**
   * Cost-optimized load balancing
   */
  costOptimizedBalance(providers) {
    // 按成本排序，选择成本最低的可用提供者
    const sortedByCost = providers.sort((a, b) => {
      const costA = this.providerConfig.get(a)?.cost_per_1k_tokens || 0;
      const costB = this.providerConfig.get(b)?.cost_per_1k_tokens || 0;
      return costA - costB;
    });

    return sortedByCost[0];
  }

  /**
   * Priority-based load balancing
   */
  priorityBalance(providers) {
    // providers已经按优先级排序，返回第一个
    return providers[0];
  }

  /**
   * Record request
   */
  recordRequest(provider) {
    const currentCount = this.requestCounts.get(provider) || 0;
    this.requestCounts.set(provider, currentCount + 1);
  }

  /**
   * Get default provider
   */
  getDefaultProvider() {
    // 按优先级返回第一个启用的提供者
    const enabledProviders = Array.from(this.providerConfig.entries())
      .filter(([name, config]) => config.enabled)
      .sort((a, b) => (a[1].priority || 10) - (b[1].priority || 10));

    if (enabledProviders.length > 0) {
      return enabledProviders[0][0];
    }

    // 如果没有启用的提供者，返回openai作为默认
    return 'openai';
  }

  /**
   * Start health checks
   */
  async startHealthChecks() {
    console.log('🔍 Starting provider health checks...');
    
    // 立即执行一次健康检查
    await this.performHealthCheck();
    
    // 设置定期健康检查
    setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // 每30 seconds检查一次
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    const enabledProviders = Array.from(this.providerConfig.entries())
      .filter(([name, config]) => config.enabled)
      .map(([name]) => name);

    console.log(`🩺 Performing health check (${enabledProviders.length} providers)...`);

    for (const provider of enabledProviders) {
      try {
        await this.checkProviderHealth(provider);
      } catch (error) {
        console.warn(`⚠️  提供者 ${provider} 健康检查失败: ${error.message}`);
      }
    }

    this.lastHealthCheck = Date.now();
  }

  /**
   * 检查单providers健康状态
   */
  async checkProviderHealth(provider) {
    try {
      const startTime = Date.now();
      
      // 发送简单的ping请求
      const testMessage = 'ping';
      const response = await LLMInterface.sendMessage(provider, testMessage, {
        max_tokens: 5,
        timeout: 10000 // 10 seconds超时
      });

      const responseTime = Date.now() - startTime;

      // 记录健康状态
      this.healthStatus.set(provider, {
        healthy: true,
        lastCheck: Date.now(),
        responseTime: responseTime,
        error: null
      });

      console.log(`✅ ${provider}: healthy (${responseTime}ms)`);

    } catch (error) {
      // 记录不健康状态
      this.healthStatus.set(provider, {
        healthy: false,
        lastCheck: Date.now(),
        responseTime: null,
        error: error.message
      });

      console.log(`❌ ${provider}: unhealthy - ${error.message}`);
    }
  }

  /**
   * Get all provider status
   */
  getProviderStatus() {
    const status = {};
    
    for (const [providerName, config] of this.providerConfig.entries()) {
      const health = this.healthStatus.get(providerName);
      const requests = this.requestCounts.get(providerName) || 0;
      
      status[providerName] = {
        enabled: config.enabled,
        priority: config.priority,
        healthy: health?.healthy || false,
        last_check: health?.lastCheck || null,
        response_time: health?.responseTime || null,
        error: health?.error || null,
        request_count: requests,
        models: config.models || [],
        local: config.local || false,
        cost_per_1k_tokens: config.cost_per_1k_tokens || 0
      };
    }
    
    return status;
  }

  /**
   * Manually set provider health status
   */
  setProviderHealth(provider, healthy, error = null) {
    this.healthStatus.set(provider, {
      healthy: healthy,
      lastCheck: Date.now(),
      responseTime: null,
      error: error
    });
  }

  /**
   * Reset provider statistics
   */
  resetStats() {
    this.requestCounts.clear();
    this.roundRobinIndex = 0;
    console.log('📊 Provider statistics reset');
  }

  /**
   * Get load balancing statistics
   */
  getStats() {
    const totalRequests = Array.from(this.requestCounts.values()).reduce((sum, count) => sum + count, 0);
    const healthyCount = Array.from(this.healthStatus.values()).filter(status => status.healthy).length;
    const totalProviders = this.providerConfig.size;

    return {
      total_requests: totalRequests,
      healthy_providers: healthyCount,
      total_providers: totalProviders,
      last_health_check: this.lastHealthCheck,
      request_distribution: Object.fromEntries(this.requestCounts),
      round_robin_index: this.roundRobinIndex
    };
  }

  /**
   * Get list of healthy providers
   */
  getHealthyProviders() {
    const healthyProviders = [];
    
    this.providerConfig.forEach((config, provider) => {
      const health = this.healthStatus.get(provider);
      if (config.enabled && health && health.healthy) {
        healthyProviders.push(provider);
      }
    });
    
    // Sort by priority (lower numbers = higher priority)
    healthyProviders.sort((a, b) => {
      const priorityA = this.providerConfig.get(a)?.priority || 999;
      const priorityB = this.providerConfig.get(b)?.priority || 999;
      return priorityA - priorityB;
    });
    
    return healthyProviders;
  }
}

module.exports = ProviderRouter;
