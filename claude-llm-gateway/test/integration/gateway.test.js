const request = require('supertest');
const { ClaudeLLMGateway } = require('../../index');

describe('Multi-LLM Gateway Integration Tests', () => {
  let gateway;
  let app;

  beforeAll(async () => {
    // Create gateway instance for testing
    gateway = new ClaudeLLMGateway();
    
    // Mock provider configuration for testing
    gateway.providers = new Map([
      ['mock-provider', { 
        enabled: true, 
        priority: 1, 
        models: ['test-model'],
        local: false,
        requires_api_key: false
      }]
    ]);
    
    // Initialize without starting server
    gateway.setupMiddleware();
    gateway.setupRoutes();
    gateway.setupErrorHandling();
    
    app = gateway.app;
  });

  describe('Health Endpoints', () => {
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('providers');
      expect(response.body).toHaveProperty('uptime');
    });

    test('GET / should return gateway information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Claude LLM Gateway');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('Provider Management', () => {
    test('GET /providers should return provider status', async () => {
      const response = await request(app)
        .get('/providers')
        .expect(200);

      expect(response.body).toHaveProperty('providers');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('total');
      expect(response.body.summary).toHaveProperty('enabled');
      expect(response.body.summary).toHaveProperty('healthy');
    });

    test('GET /models should return supported models', async () => {
      const response = await request(app)
        .get('/models')
        .expect(200);

      expect(response.body).toHaveProperty('object', 'list');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /stats should return gateway statistics', async () => {
      const response = await request(app)
        .get('/stats')
        .expect(200);

      expect(response.body).toHaveProperty('total_requests');
      expect(response.body).toHaveProperty('healthy_providers');
      expect(response.body).toHaveProperty('total_providers');
    });
  });

  describe('Claude API Endpoints', () => {
    test('POST /v1/messages should validate request format', async () => {
      const invalidRequest = {
        model: 'claude-3-sonnet'
        // Missing required 'messages' field
      };

      const response = await request(app)
        .post('/v1/messages')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.type).toBe('invalid_request_error');
    });

    test('POST /v1/messages should accept valid Claude format', async () => {
      const validRequest = {
        model: 'claude-3-sonnet',
        messages: [
          { role: 'user', content: 'Hello, this is a test message' }
        ],
        max_tokens: 100
      };

      const response = await request(app)
        .post('/v1/messages')
        .send(validRequest);

      // Should not return 400 (validation error)
      expect(response.status).not.toBe(400);
    });

    test('POST /v1/chat/completions should accept OpenAI format', async () => {
      const chatRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello from OpenAI format' }
        ]
      };

      const response = await request(app)
        .post('/v1/chat/completions')
        .send(chatRequest);

      // Should not return 400 (validation error)
      expect(response.status).not.toBe(400);
    });

    test('POST /anthropic/v1/messages should work with Anthropic endpoint', async () => {
      const anthropicRequest = {
        model: 'claude-3-sonnet',
        messages: [
          { role: 'user', content: 'Hello from Anthropic endpoint' }
        ],
        max_tokens: 50
      };

      const response = await request(app)
        .post('/anthropic/v1/messages')
        .send(anthropicRequest);

      // Should not return 400 (validation error)
      expect(response.status).not.toBe(400);
    });
  });

  describe('Error Handling', () => {
    test('Should handle 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.type).toBe('not_found');
    });

    test('Should validate message content', async () => {
      const invalidMessages = {
        model: 'claude-3-sonnet',
        messages: [
          { role: 'user' } // Missing content
        ]
      };

      const response = await request(app)
        .post('/v1/messages')
        .send(invalidMessages)
        .expect(400);

      expect(response.body.error.type).toBe('invalid_request_error');
    });

    test('Should validate message roles', async () => {
      const invalidRole = {
        model: 'claude-3-sonnet',
        messages: [
          { role: 'invalid_role', content: 'Test message' }
        ]
      };

      const response = await request(app)
        .post('/v1/messages')
        .send(invalidRole)
        .expect(400);

      expect(response.body.error.type).toBe('invalid_request_error');
    });
  });

  describe('Rate Limiting', () => {
    test('Should respect rate limits', async () => {
      const requests = [];
      const testRequest = {
        model: 'claude-3-sonnet',
        messages: [{ role: 'user', content: 'Rate limit test' }],
        max_tokens: 10
      };

      // Send multiple requests rapidly
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app)
            .post('/v1/messages')
            .send(testRequest)
        );
      }

      const responses = await Promise.all(requests);
      
      // At least some requests should complete (not all 429)
      const successfulRequests = responses.filter(r => r.status !== 429);
      expect(successfulRequests.length).toBeGreaterThan(0);
    });
  });

  describe('CORS and Security', () => {
    test('Should include CORS headers', async () => {
      const response = await request(app)
        .options('/v1/messages')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });

    test('Should include security headers', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});
