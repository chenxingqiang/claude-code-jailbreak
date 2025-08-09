/**
 * Mock Provider Tests
 * Tests for provider routing and basic functionality using mock providers
 */

const ProviderRouter = require('../../src/provider-router');
const ClaudeCompatibility = require('../../src/claude-compatibility');

describe('Provider Tests (Mock)', () => {
  let providerRouter;
  let claudeCompat;

  beforeEach(() => {
    providerRouter = new ProviderRouter();
    claudeCompat = new ClaudeCompatibility();
    
    // Mock provider configuration
    const mockProviders = {
      'mock-openai': {
        enabled: true,
        priority: 1,
        models: ['gpt-4', 'gpt-3.5-turbo'],
        local: false,
        requires_api_key: true,
        cost_per_1k_tokens: 0.03
      },
      'mock-google': {
        enabled: true,
        priority: 2,
        models: ['gemini-pro', 'gemini-flash'],
        local: false,
        requires_api_key: true,
        cost_per_1k_tokens: 0.001
      },
      'mock-ollama': {
        enabled: true,
        priority: 3,
        models: ['llama2', 'codellama'],
        local: true,
        requires_api_key: false,
        cost_per_1k_tokens: 0.0
      },
      'mock-disabled': {
        enabled: false,
        priority: 4,
        models: ['disabled-model'],
        local: false,
        requires_api_key: true
      }
    };

    // Initialize with mock providers
    providerRouter.initialize(mockProviders);
    
    // Mock health status for all enabled providers
    providerRouter.setProviderHealth('mock-openai', true);
    providerRouter.setProviderHealth('mock-google', true);
    providerRouter.setProviderHealth('mock-ollama', true);
  });

  describe('Provider Selection', () => {
    test('should select provider based on model type', async () => {
      const gptRequest = { model: 'gpt-4' };
      const provider = await providerRouter.selectProvider(gptRequest);
      expect(provider).toBe('mock-openai');

      const geminiRequest = { model: 'gemini-pro' };
      const provider2 = await providerRouter.selectProvider(geminiRequest);
      expect(provider2).toBe('mock-google');

      const llamaRequest = { model: 'llama2' };
      const provider3 = await providerRouter.selectProvider(llamaRequest);
      expect(provider3).toBe('mock-ollama');
    });

    test('should select by priority when no model match', async () => {
      const unknownRequest = { model: 'unknown-model' };
      const provider = await providerRouter.selectProvider(unknownRequest);
      expect(provider).toBe('mock-openai'); // highest priority
    });

    test('should respect preferred provider option', async () => {
      const request = { model: 'test-model' };
      const options = { preferredProvider: 'mock-google' };
      const provider = await providerRouter.selectProvider(request, options);
      expect(provider).toBe('mock-google');
    });

    test('should fallback when preferred provider is unhealthy', async () => {
      providerRouter.setProviderHealth('mock-google', false);
      
      const request = { model: 'test-model' };
      const options = { preferredProvider: 'mock-google' };
      const provider = await providerRouter.selectProvider(request, options);
      expect(provider).not.toBe('mock-google');
      expect(provider).toBe('mock-openai'); // fallback to healthy provider
    });
  });

  describe('Load Balancing Strategies', () => {
    test('should implement priority-based selection', () => {
      const providers = ['mock-google', 'mock-openai', 'mock-ollama'];
      const selected = providerRouter.priorityBalance(providers);
      expect(selected).toBe('mock-google'); // first in priority-sorted array
    });

    test('should implement round-robin selection', () => {
      const providers = ['mock-openai', 'mock-google', 'mock-ollama'];
      
      const selections = [];
      for (let i = 0; i < 6; i++) {
        selections.push(providerRouter.roundRobinBalance(providers));
      }
      
      // Should cycle through providers
      expect(selections[0]).toBe('mock-openai');
      expect(selections[1]).toBe('mock-google');
      expect(selections[2]).toBe('mock-ollama');
      expect(selections[3]).toBe('mock-openai'); // cycle repeats
    });

    test('should implement cost-optimized selection', () => {
      const providers = ['mock-openai', 'mock-google', 'mock-ollama'];
      const selected = providerRouter.costOptimizedBalance(providers);
      expect(selected).toBe('mock-ollama'); // lowest cost (free)
    });

    test('should implement least-requests selection', () => {
      const providers = ['mock-openai', 'mock-google', 'mock-ollama'];
      
      // Record some requests
      providerRouter.recordRequest('mock-openai');
      providerRouter.recordRequest('mock-openai');
      providerRouter.recordRequest('mock-google');
      
      const selected = providerRouter.leastRequestsBalance(providers);
      expect(selected).toBe('mock-ollama'); // no requests recorded
    });
  });

  describe('Health Management', () => {
    test('should track provider health status', () => {
      expect(providerRouter.isProviderHealthy('mock-openai')).toBe(true);
      expect(providerRouter.isProviderHealthy('mock-google')).toBe(true);
      expect(providerRouter.isProviderHealthy('mock-ollama')).toBe(true);
    });

    test('should update health status', () => {
      providerRouter.setProviderHealth('mock-openai', false, 'API key invalid');
      expect(providerRouter.isProviderHealthy('mock-openai')).toBe(false);
      
      const status = providerRouter.getProviderStatus();
      expect(status['mock-openai'].healthy).toBe(false);
      expect(status['mock-openai'].error).toBe('API key invalid');
    });

    test('should get only healthy providers', () => {
      providerRouter.setProviderHealth('mock-google', false);
      
      const healthyProviders = providerRouter.getHealthyProviders();
      expect(healthyProviders).toContain('mock-openai');
      expect(healthyProviders).toContain('mock-ollama');
      expect(healthyProviders).not.toContain('mock-google');
    });

    test('should exclude disabled providers from healthy list', () => {
      const healthyProviders = providerRouter.getHealthyProviders();
      expect(healthyProviders).not.toContain('mock-disabled');
    });
  });

  describe('Request Recording and Statistics', () => {
    test('should record provider requests', () => {
      providerRouter.recordRequest('mock-openai');
      providerRouter.recordRequest('mock-openai');
      providerRouter.recordRequest('mock-google');
      
      const stats = providerRouter.getStats();
      expect(stats.total_requests).toBe(3);
      expect(stats.request_distribution['mock-openai']).toBe(2);
      expect(stats.request_distribution['mock-google']).toBe(1);
    });

    test('should reset statistics', () => {
      providerRouter.recordRequest('mock-openai');
      providerRouter.recordRequest('mock-google');
      
      providerRouter.resetStats();
      
      const stats = providerRouter.getStats();
      expect(stats.total_requests).toBe(0);
      expect(stats.round_robin_index).toBe(0);
    });

    test('should provide comprehensive status', () => {
      const status = providerRouter.getProviderStatus();
      
      expect(status).toHaveProperty('mock-openai');
      expect(status).toHaveProperty('mock-google');
      expect(status).toHaveProperty('mock-ollama');
      
      expect(status['mock-openai']).toHaveProperty('enabled', true);
      expect(status['mock-openai']).toHaveProperty('priority', 1);
      expect(status['mock-openai']).toHaveProperty('healthy', true);
      expect(status['mock-openai']).toHaveProperty('models');
      expect(status['mock-openai']).toHaveProperty('local', false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty provider list', async () => {
      const emptyRouter = new ProviderRouter();
      await emptyRouter.initialize({});
      
      const request = { model: 'test-model' };
      const provider = await emptyRouter.selectProvider(request);
      expect(provider).toBe('openai'); // default fallback
    });

    test('should handle all providers unhealthy', async () => {
      providerRouter.setProviderHealth('mock-openai', false);
      providerRouter.setProviderHealth('mock-google', false);
      providerRouter.setProviderHealth('mock-ollama', false);
      
      const request = { model: 'test-model' };
      const provider = await providerRouter.selectProvider(request);
      expect(provider).toBe('openai'); // default fallback
    });

    test('should handle load balancing with single provider', () => {
      const singleProvider = ['mock-openai'];
      
      expect(providerRouter.priorityBalance(singleProvider)).toBe('mock-openai');
      expect(providerRouter.roundRobinBalance(singleProvider)).toBe('mock-openai');
      expect(providerRouter.costOptimizedBalance(singleProvider)).toBe('mock-openai');
      expect(providerRouter.leastRequestsBalance(singleProvider)).toBe('mock-openai');
    });
  });

  describe('Model Mapping Integration', () => {
    test('should map Claude models correctly through compatibility layer', () => {
      expect(claudeCompat.mapClaudeModel('claude-3-sonnet', 'mock-openai')).toBe('gpt-4');
      expect(claudeCompat.mapClaudeModel('claude-3-haiku', 'mock-openai')).toBe('gpt-3.5-turbo');
      expect(claudeCompat.mapClaudeModel('claude-3-sonnet', 'mock-google')).toBe('gemini-pro');
    });

    test('should handle request transformation for different providers', () => {
      const claudeRequest = {
        model: 'claude-3-sonnet',
        messages: [{ role: 'user', content: 'Test message' }],
        max_tokens: 100
      };

      const openaiFormat = claudeCompat.toLLMInterface(claudeRequest, 'mock-openai');
      expect(openaiFormat.model).toBe('gpt-4');

      const googleFormat = claudeCompat.toLLMInterface(claudeRequest, 'mock-google');
      expect(googleFormat.model).toBe('gemini-pro');

      const ollamaFormat = claudeCompat.toLLMInterface(claudeRequest, 'mock-ollama');
      expect(ollamaFormat.model).toBe('llama2:13b');
    });
  });
});
