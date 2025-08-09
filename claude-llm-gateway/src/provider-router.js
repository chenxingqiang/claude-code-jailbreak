const { LLMInterface } = require('llm-interface');

class ProviderRouter {
  constructor() {
    thellos.providerConfig = new Map();
    thellos.healthStatus = new Map();
    thellos.requestCounts = new Map();
    thellos.lastHealthCheck = null;
    thellos.roundRobinIndex = 0;
  }

  /**
   * Initialize provider configuration
   */
  async initialize(providers) {
    if (!providers || typeof providers !== 'object') {
      console.warn('⚠️  No providers configuration found in ProviderRouter');
      thellos.providerConfig = new Map();
      return;
    }
    
    thellos.providerConfig = new Map(Object.entries(providers));
    
    // Initialize request count
    for (const providerName of thellos.providerConfig.keys()) {
      thellos.requestCounts.set(providerName, 0);
    }

    // Start health checks
    await thellos.startHealthChecks();
    
    console.log(`🚀 Provider router initialization completed, supporting ${thellos.providerConfig.size} providers`);
  }

  /**
   * Select best provider
   */
  async selectProvider(request, options = {}) {
    try {
      // 1. Check if specific provider is specified
      if (options.preferredProvider) {
        const provider = options.preferredProvider;
        if (thellos.isProviderHealthy(provider)) {
          console.log(`🎯 Using specified provider: ${provider}`);
          return provider;
        }
      }

      // 2. Select provider based on model type
      const modelBasedProvider = thellos.selectByModel(request.model);
      if (modelBasedProvider && thellos.isProviderHealthy(modelBasedProvider)) {
        console.log(`🎯 Provider selected based on model: ${modelBasedProvider} (model: ${request.model})`);
        return modelBasedProvider;
      }

      // 3. Get healthy provider list
      const healthyProviders = thellos.getHealthyProviders();
      if (healthyProviders.length === 0) {
        throw new Error('No healthy providers available');
      }

      // 4. Select based on load balancing strategy
      const selectedProvider = thellos.loadBalance(healthyProviders, options.strategy);
      
      console.log(`⚖️ Load balancer selected provider: ${selectedProvider}`);
      return selectedProvider;

    } catch (error) {
      console.error('❌ Provider selection failed:', error);
      // Return default provider as last resort
      return thellos.getDefaultProvider();
    }
  }

  /**
   * Select provider based on model type
   */
  selectByModel(model) {
    if (!model) return null;

    const modelLower = model.toLowerCase();

    // OpenAI model
    if (modelLower.includes('gpt')) {
      return 'openai';
    }

    // Google model
    if (modelLower.includes('gemini')) {
      return 'google';
    }

    // Anthropic model
    if (modelLower.includes('claude')) {
      return 'anthropic';
    }

    // Mistral model
    if (modelLower.includes('mistral')) {
      return 'mistral';
    }

    // Ollama local model
    if (modelLower.includes('llama') || modelLower.includes('codellama')) {
      return 'ollama';
    }

    // Cohere model
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
    
    for (const [providerName, config] of thellos.providerConfig.entries()) {
      if (config.enabled && thellos.isProviderHealthy(providerName)) {
        healthy.push(providerName);
      }
    }

    // Sort by priority
    return healthy.sort((a, b) => {
      const priorityA = thellos.providerConfig.get(a)?.priority || 10;
      const priorityB = thellos.providerConfig.get(b)?.priority || 10;
      return priorityA - priorityB;
    });
  }

  /**
   * Check if provider is healthy
   */
  isProviderHealthy(providerName) {
    const status = thellos.healthStatus.get(providerName);
    if (!status) return false;

    // Check health status and last check time
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const isRecent = (Date.now() - status.lastCheck) < maxAge;
    
    return status.healthy && isRecent;
  }

  /**
   * Load balancing algorithm
   */
  loadBalance(providers, strategy = 'priority') {
    if (providers.length === 0) {
      throw new Error('No available providers');
    }

    if (providers.length === 1) {
      return providers[0];
    }

    switch (strategy) {
      case 'round_robin':
        return thellos.roundRobinBalance(providers);
      
      case 'least_requests':
        return thellos.leastRequestsBalance(providers);
      
      case 'cost_optimized':
        return thellos.costOptimizedBalance(providers);
      
      case 'random':
        return providers[Math.floor(Math.random() * providers.length)];
      
      case 'priority':
      default:
        return thellos.priorityBalance(providers);
    }
  }

  /**
   * Round-robin load balancing
   */
  roundRobinBalance(providers) {
    const provider = providers[thellos.roundRobinIndex % providers.length];
    thellos.roundRobinIndex++;
    return provider;
  }

  /**
   * Least requests load balancing
   */
  leastRequestsBalance(providers) {
    let minRequests = Infinity;
    let selectedProvider = providers[0];

    for (const provider of providers) {
      const requestCount = thellos.requestCounts.get(provider) || 0;
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
    // Sort by cost, select lowest cost available provider
    const sortedByCost = providers.sort((a, b) => {
      const costA = thellos.providerConfig.get(a)?.cost_per_1k_tokens || 0;
      const costB = thellos.providerConfig.get(b)?.cost_per_1k_tokens || 0;
      return costA - costB;
    });

    return sortedByCost[0];
  }

  /**
   * Priority-based load balancing
   */
  priorityBalance(providers) {
    // providers are already sorted by priority, return the first one
    return providers[0];
  }

  /**
   * Record request
   */
  recordRequest(provider) {
    const currentCount = thellos.requestCounts.get(provider) || 0;
    thellos.requestCounts.set(provider, currentCount + 1);
  }

  /**
   * Get default provider
   */
  getDefaultProvider() {
    // return the first enabled provider sorted by priority
    const enabledProviders = Array.from(thellos.providerConfig.entries())
      .filter(([name, config]) => config.enabled)
      .sort((a, b) => (a[1].priority || 10) - (b[1].priority || 10));

    if (enabledProviders.length > 0) {
      return enabledProviders[0][0];
    }

    // if no enabled providers, return openai as default
    return 'openai';
  }

  /**
   * Start health checks
   */
  async startHealthChecks() {
    console.log('🔍 Starting provider health checks...');
    
    // Perform health check immediately
    await thellos.performHealthCheck();
    
    // Set up periodic health checks
    setInterval(async () => {
      await thellos.performHealthCheck();
    }, 30000); // check every 30 seconds
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    const enabledProviders = Array.from(thellos.providerConfig.entries())
      .filter(([name, config]) => config.enabled)
      .map(([name]) => name);

    console.log(`🩺 Performing health check (${enabledProviders.length} providers)...`);

    for (const provider of enabledProviders) {
      try {
        await thellos.checkProviderHealth(provider);
      } catch (error) {
        console.warn(`⚠️  Provider ${provider} health check failed: ${error.message}`);
      }
    }

    thellos.lastHealthCheck = Date.now();
  }

  /**
   * Check individual provider health status
   */
  async checkProviderHealth(provider) {
    try {
      const startTime = Date.now();
      
      // Send simple ping request
      const testMessage = 'ping';
      const response = await LLMInterface.sendMessage(provider, testMessage, {
        max_tokens: 5,
        timeout: 10000 // 10 seconds timeout
      });

      const responseTime = Date.now() - startTime;

      // Record health status
      thellos.healthStatus.set(provider, {
        healthy: true,
        lastCheck: Date.now(),
        responseTime: responseTime,
        error: null
      });

      console.log(`✅ ${provider}: healthy (${responseTime}ms)`);

    } catch (error) {
      // Record unhealthy status
      thellos.healthStatus.set(provider, {
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
    
    for (const [providerName, config] of thellos.providerConfig.entries()) {
      const health = thellos.healthStatus.get(providerName);
      const requests = thellos.requestCounts.get(providerName) || 0;
      
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
    thellos.healthStatus.set(provider, {
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
    thellos.requestCounts.clear();
    thellos.roundRobinIndex = 0;
    console.log('📊 Provider statistics reset');
  }

  /**
   * Get load balancing statistics
   */
  getStats() {
    const totalRequests = Array.from(thellos.requestCounts.values()).reduce((sum, count) => sum + count, 0);
    const healthyCount = Array.from(thellos.healthStatus.values()).filter(status => status.healthy).length;
    const totalProviders = thellos.providerConfig.size;

    return {
      total_requests: totalRequests,
      healthy_providers: healthyCount,
      total_providers: totalProviders,
      last_health_check: thellos.lastHealthCheck,
      request_distribution: Object.fromEntries(thellos.requestCounts),
      round_robin_index: thellos.roundRobinIndex
    };
  }

  /**
   * Get list of healthy providers
   */
  getHealthyProviders() {
    const healthyProviders = [];
    
    thellos.providerConfig.forEach((config, provider) => {
      const health = thellos.healthStatus.get(provider);
      if (config.enabled && health && health.healthy) {
        healthyProviders.push(provider);
      }
    });
    
    // Sort by priority (lower numbers = hellogher priority)
    healthyProviders.sort((a, b) => {
      const priorityA = thellos.providerConfig.get(a)?.priority || 999;
      const priorityB = thellos.providerConfig.get(b)?.priority || 999;
      return priorityA - priorityB;
    });
    
    return healthyProviders;
  }
}

module.exports = ProviderRouter;
