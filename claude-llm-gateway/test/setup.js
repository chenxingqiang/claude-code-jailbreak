/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
process.env.GATEWAY_PORT = '0'; // Use random port for tests

// Mock environment variables for testing
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.GOOGLE_API_KEY = 'test-google-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

// Global test utilities
global.createMockRequest = (overrides = {}) => {
  return {
    model: 'claude-3-sonnet',
    messages: [
      { role: 'user', content: 'Test message' }
    ],
    max_tokens: 100,
    temperature: 0.7,
    ...overrides
  };
};

global.createMockProvider = (name, overrides = {}) => {
  return {
    enabled: true,
    priority: 1,
    models: ['test-model'],
    local: false,
    requires_api_key: true,
    cost_per_1k_tokens: 0.01,
    streaming_support: true,
    ...overrides
  };
};

// Mock fetch for tests that don't need real HTTP calls
global.fetch = jest.fn();

// Console spy to reduce test output noise
global.originalConsole = console;
global.mockConsole = () => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
};

global.restoreConsole = () => {
  console.log = global.originalConsole.log;
  console.error = global.originalConsole.error;
  console.warn = global.originalConsole.warn;
  console.info = global.originalConsole.info;
};

// Setup and teardown for each test
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset fetch mock
  if (global.fetch.mockClear) {
    global.fetch.mockClear();
  }
});

afterEach(() => {
  // Clean up any test artifacts
  delete process.env.TEST_PROVIDER;
  delete process.env.TEST_MODEL;
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for integration tests
jest.setTimeout(30000);
