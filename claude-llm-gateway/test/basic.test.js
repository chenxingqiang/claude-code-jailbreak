const request = require('supertest');
const ClaudeLLMGateway = require('../src/server');

describe('Claude LLM Gateway', () => {
  let app;
  let server;

  beforeAll(async () => {
    // 创建网关实例但不启动服务器
    const gateway = new ClaudeLLMGateway();
    
    // 模拟初始化过程，跳过实际的提供者配置
    gateway.providers = new Map([
      ['mock', { enabled: true, priority: 1, models: ['test-model'] }]
    ]);
    
    // 设置中间件和路由
    gateway.setupMiddleware();
    gateway.setupRoutes();
    gateway.setupErrorHandling();
    
    app = gateway.app;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('GET /', () => {
    it('should return gateway info', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.name).toBe('Claude LLM Gateway');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('providers');
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /providers', () => {
    it('should return provider status', async () => {
      const response = await request(app)
        .get('/providers')
        .expect(200);

      expect(response.body).toHaveProperty('providers');
      expect(response.body).toHaveProperty('summary');
    });
  });

  describe('POST /v1/messages', () => {
    it('should validate request format', async () => {
      const invalidRequest = {
        model: 'claude-3-sonnet'
        // 缺少 messages 字段
      };

      const response = await request(app)
        .post('/v1/messages')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.type).toBe('invalid_request_error');
    });

    it('should accept valid request format', async () => {
      const validRequest = {
        model: 'claude-3-sonnet',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 100
      };

      // 由于我们没有真实的LLM提供者，这个测试会失败
      // 但至少可以验证请求格式验证是否正确
      const response = await request(app)
        .post('/v1/messages')
        .send(validRequest);

      // 可能返回500（提供者错误）或其他状态，但不应该是400（格式错误）
      expect(response.status).not.toBe(400);
    });
  });

  describe('POST /v1/chat/completions', () => {
    it('should accept chat completion format', async () => {
      const chatRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      };

      const response = await request(app)
        .post('/v1/chat/completions')
        .send(chatRequest);

      // 同样，由于没有真实提供者，不应该是400错误
      expect(response.status).not.toBe(400);
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.type).toBe('not_found');
    });
  });
});
