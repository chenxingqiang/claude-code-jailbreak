#!/usr/bin/env node

/**
 * Interface Testing Script
 * Tests all API endpoints and basic functionality
 */

const fetch = require('node-fetch');
const { ClaudeLLMGateway } = require('../index');

const GATEWAY_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 10000;

class InterfaceTester {
  constructor() {
    this.gateway = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async test(name, testFn) {
    console.log(`🧪 Testing: ${name}`);
    try {
      await Promise.race([
        testFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), TEST_TIMEOUT)
        )
      ]);
      console.log(`✅ ${name}: PASSED`);
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ ${name}: FAILED - ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }

  async startGateway() {
    console.log('🚀 Starting gateway for testing...');
    try {
      this.gateway = new ClaudeLLMGateway();
      
      // Mock provider setup for testing
      this.gateway.providers = new Map([
        ['test-provider', {
          enabled: true,
          priority: 1,
          models: ['test-model'],
          local: false
        }]
      ]);
      
      // Setup without full initialization
      this.gateway.setupMiddleware();
      this.gateway.setupRoutes();
      this.gateway.setupErrorHandling();
      
      // Start server
      return new Promise((resolve, reject) => {
        const server = this.gateway.app.listen(3000, (error) => {
          if (error) {
            reject(error);
          } else {
            console.log('✅ Gateway started on port 3000');
            this.server = server;
            // Wait a bit for server to be ready
            setTimeout(resolve, 1000);
          }
        });
      });
    } catch (error) {
      console.error('❌ Failed to start gateway:', error.message);
      throw error;
    }
  }

  async stopGateway() {
    if (this.server) {
      console.log('🛑 Stopping gateway...');
      this.server.close();
    }
  }

  async testHealthEndpoint() {
    const response = await fetch(`${GATEWAY_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    const data = await response.json();
    if (!data.status || data.status !== 'healthy') {
      throw new Error('Gateway not reporting healthy status');
    }
  }

  async testRootEndpoint() {
    const response = await fetch(`${GATEWAY_URL}/`);
    if (!response.ok) {
      throw new Error(`Root endpoint failed: ${response.status}`);
    }
    const data = await response.json();
    if (!data.name || !data.version) {
      throw new Error('Root endpoint missing required fields');
    }
  }

  async testProvidersEndpoint() {
    const response = await fetch(`${GATEWAY_URL}/providers`);
    if (!response.ok) {
      throw new Error(`Providers endpoint failed: ${response.status}`);
    }
    const data = await response.json();
    if (!data.providers || !data.summary) {
      throw new Error('Providers endpoint missing required fields');
    }
  }

  async testModelsEndpoint() {
    const response = await fetch(`${GATEWAY_URL}/models`);
    if (!response.ok) {
      throw new Error(`Models endpoint failed: ${response.status}`);
    }
    const data = await response.json();
    if (!data.object || !Array.isArray(data.data)) {
      throw new Error('Models endpoint invalid format');
    }
  }

  async testStatsEndpoint() {
    const response = await fetch(`${GATEWAY_URL}/stats`);
    if (!response.ok) {
      throw new Error(`Stats endpoint failed: ${response.status}`);
    }
    const data = await response.json();
    if (typeof data.total_requests === 'undefined') {
      throw new Error('Stats endpoint missing required fields');
    }
  }

  async testClaudeMessagesValidation() {
    const invalidRequest = {
      model: 'claude-3-sonnet'
      // Missing messages field
    };

    const response = await fetch(`${GATEWAY_URL}/v1/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidRequest)
    });

    if (response.status !== 400) {
      throw new Error('Should reject invalid requests with 400');
    }

    const data = await response.json();
    if (!data.error || data.error.type !== 'invalid_request_error') {
      throw new Error('Invalid error response format');
    }
  }

  async testClaudeMessagesFormat() {
    const validRequest = {
      model: 'claude-3-sonnet',
      messages: [
        { role: 'user', content: 'Test message' }
      ],
      max_tokens: 50
    };

    const response = await fetch(`${GATEWAY_URL}/v1/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validRequest)
    });

    // Should not be a validation error (400)
    if (response.status === 400) {
      const data = await response.json();
      throw new Error(`Validation failed: ${data.error?.message || 'Unknown error'}`);
    }
  }

  async testChatCompletionsFormat() {
    const chatRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Test chat message' }
      ]
    };

    const response = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatRequest)
    });

    // Should not be a validation error (400)
    if (response.status === 400) {
      const data = await response.json();
      throw new Error(`Chat validation failed: ${data.error?.message || 'Unknown error'}`);
    }
  }

  async test404Handling() {
    const response = await fetch(`${GATEWAY_URL}/unknown-endpoint`);
    if (response.status !== 404) {
      throw new Error('Should return 404 for unknown endpoints');
    }
    
    const data = await response.json();
    if (!data.error || data.error.type !== 'not_found') {
      throw new Error('Invalid 404 error format');
    }
  }

  async testCORSHeaders() {
    const response = await fetch(`${GATEWAY_URL}/health`, {
      method: 'OPTIONS'
    });
    
    const corsHeader = response.headers.get('access-control-allow-origin');
    if (!corsHeader) {
      throw new Error('CORS headers not present');
    }
  }

  async runAllTests() {
    console.log('🎯 Starting Multi-LLM Gateway Interface Tests\n');

    try {
      await this.startGateway();

      // Basic endpoint tests
      await this.test('Health Endpoint', () => this.testHealthEndpoint());
      await this.test('Root Endpoint', () => this.testRootEndpoint());
      await this.test('Providers Endpoint', () => this.testProvidersEndpoint());
      await this.test('Models Endpoint', () => this.testModelsEndpoint());
      await this.test('Stats Endpoint', () => this.testStatsEndpoint());

      // API format tests
      await this.test('Claude Messages Validation', () => this.testClaudeMessagesValidation());
      await this.test('Claude Messages Format', () => this.testClaudeMessagesFormat());
      await this.test('Chat Completions Format', () => this.testChatCompletionsFormat());

      // Error handling tests
      await this.test('404 Handling', () => this.test404Handling());
      await this.test('CORS Headers', () => this.testCORSHeaders());

    } finally {
      await this.stopGateway();
    }

    // Print results
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total: ${this.results.passed + this.results.failed}`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(t => t.status === 'FAILED')
        .forEach(t => console.log(`  • ${t.name}: ${t.error}`));
    }

    const success = this.results.failed === 0;
    console.log(`\n${success ? '🎉 All tests passed!' : '❌ Some tests failed'}`);
    
    return success;
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new InterfaceTester();
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = InterfaceTester;
