const ClaudeCompatibility = require('../../src/claude-compatibility');

describe('Claude Compatibility Layer', () => {
  let claudeCompat;

  beforeEach(() => {
    claudeCompat = new ClaudeCompatibility();
  });

  describe('Request Transformation', () => {
    test('should transform basic Claude request to LLM interface format', () => {
      const claudeRequest = {
        model: 'claude-3-sonnet',
        messages: [
          { role: 'user', content: 'Hello world' }
        ],
        max_tokens: 100,
        temperature: 0.7
      };

      const result = claudeCompat.toLLMInterface(claudeRequest, 'openai');

      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('messages');
      expect(result).toHaveProperty('max_tokens', 100);
      expect(result).toHaveProperty('temperature', 0.7);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toEqual({
        role: 'user',
        content: 'Hello world'
      });
    });

    test('should handle system messages correctly', () => {
      const claudeRequest = {
        model: 'claude-3-sonnet',
        system: 'You are a helpful assistant',
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      };

      const result = claudeCompat.toLLMInterface(claudeRequest, 'openai');

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0]).toEqual({
        role: 'system',
        content: 'You are a helpful assistant'
      });
      expect(result.messages[1]).toEqual({
        role: 'user',
        content: 'Hello'
      });
    });

    test('should handle structured content messages', () => {
      const claudeRequest = {
        model: 'claude-3-sonnet',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Hello' },
              { type: 'text', text: 'World' }
            ]
          }
        ]
      };

      const result = claudeCompat.toLLMInterface(claudeRequest, 'openai');

      expect(result.messages[0]).toEqual({
        role: 'user',
        content: 'Hello\nWorld'
      });
    });

    test('should handle stop sequences', () => {
      const claudeRequest = {
        model: 'claude-3-sonnet',
        messages: [{ role: 'user', content: 'Test' }],
        stop_sequences: ['STOP', 'END']
      };

      const result = claudeCompat.toLLMInterface(claudeRequest, 'openai');

      expect(result).toHaveProperty('stop', ['STOP', 'END']);
    });
  });

  describe('Response Transformation', () => {
    test('should transform basic LLM response to Claude format', () => {
      const llmResponse = {
        results: 'This is a test response',
        model: 'gpt-4',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5
        }
      };

      const result = claudeCompat.toClaudeFormat(llmResponse, 'openai');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('type', 'message');
      expect(result).toHaveProperty('role', 'assistant');
      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        type: 'text',
        text: 'This is a test response'
      });
      expect(result).toHaveProperty('usage');
      expect(result.usage).toEqual({
        input_tokens: 10,
        output_tokens: 5
      });
    });

    test('should handle OpenAI format responses', () => {
      const openaiResponse = {
        choices: [
          {
            message: {
              content: 'OpenAI response text'
            }
          }
        ],
        usage: {
          prompt_tokens: 15,
          completion_tokens: 8
        }
      };

      const result = claudeCompat.toClaudeFormat(openaiResponse, 'openai');

      expect(result.content[0].text).toBe('OpenAI response text');
      expect(result.usage).toEqual({
        input_tokens: 15,
        output_tokens: 8
      });
    });

    test('should estimate tokens when usage not provided', () => {
      const response = {
        results: 'A short response'
      };

      const result = claudeCompat.toClaudeFormat(response, 'openai');

      expect(result.usage.output_tokens).toBeGreaterThan(0);
      expect(result.usage.input_tokens).toBe(0);
    });
  });

  describe('Model Mapping', () => {
    test('should map Claude models to provider-specific models', () => {
      expect(claudeCompat.mapClaudeModel('claude-3-sonnet', 'openai')).toBe('gpt-4');
      expect(claudeCompat.mapClaudeModel('claude-3-haiku', 'openai')).toBe('gpt-3.5-turbo');
      expect(claudeCompat.mapClaudeModel('claude-3-sonnet', 'google')).toBe('gemini-pro');
      expect(claudeCompat.mapClaudeModel('claude-3-haiku', 'google')).toBe('gemini-flash');
    });

    test('should return default model for unknown mappings', () => {
      const result = claudeCompat.mapClaudeModel('unknown-model', 'openai');
      expect(result).toBe('gpt-3.5-turbo'); // default
    });

    test('should return default model for unknown providers', () => {
      const result = claudeCompat.mapClaudeModel('claude-3-sonnet', 'unknown-provider');
      expect(result).toBe('gpt-3.5-turbo'); // default
    });
  });

  describe('Request Validation', () => {
    test('should validate valid Claude requests', () => {
      const validRequest = {
        model: 'claude-3-sonnet',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 100
      };

      const errors = claudeCompat.validateClaudeRequest(validRequest);
      expect(errors).toHaveLength(0);
    });

    test('should catch missing messages field', () => {
      const invalidRequest = {
        model: 'claude-3-sonnet'
      };

      const errors = claudeCompat.validateClaudeRequest(invalidRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('messages');
    });

    test('should catch empty messages array', () => {
      const invalidRequest = {
        model: 'claude-3-sonnet',
        messages: []
      };

      const errors = claudeCompat.validateClaudeRequest(invalidRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('empty');
    });

    test('should validate message structure', () => {
      const invalidRequest = {
        model: 'claude-3-sonnet',
        messages: [
          { role: 'user' } // missing content
        ]
      };

      const errors = claudeCompat.validateClaudeRequest(invalidRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('content'))).toBe(true);
    });

    test('should validate message roles', () => {
      const invalidRequest = {
        model: 'claude-3-sonnet',
        messages: [
          { role: 'invalid', content: 'test' }
        ]
      };

      const errors = claudeCompat.validateClaudeRequest(invalidRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('role'))).toBe(true);
    });

    test('should validate parameter ranges', () => {
      const invalidRequest = {
        model: 'claude-3-sonnet',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: -1,
        temperature: 5.0,
        top_p: 2.0
      };

      const errors = claudeCompat.validateClaudeRequest(invalidRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('max_tokens'))).toBe(true);
      expect(errors.some(e => e.includes('temperature'))).toBe(true);
      expect(errors.some(e => e.includes('top_p'))).toBe(true);
    });
  });

  describe('Streaming Support', () => {
    test('should convert streaming chunks to Claude format', () => {
      const chunk = {
        choices: [
          {
            delta: {
              content: 'streaming text'
            }
          }
        ]
      };

      const result = claudeCompat.convertStreamResponse(chunk, 'openai');
      expect(result).toContain('content_block_delta');
      expect(result).toContain('streaming text');
    });

    test('should handle empty streaming chunks', () => {
      const chunk = {
        choices: [
          {
            delta: {}
          }
        ]
      };

      const result = claudeCompat.convertStreamResponse(chunk, 'openai');
      expect(result).toContain('content_block_delta');
    });
  });

  describe('Utility Methods', () => {
    test('should return supported Claude models', () => {
      const models = claudeCompat.getSupportedClaudeModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models).toContain('claude-3-sonnet');
      expect(models).toContain('claude-3-haiku');
      expect(models).toContain('claude-3-opus');
    });

    test('should return provider-specific model mappings', () => {
      const openaiModels = claudeCompat.getProviderModels('openai');
      expect(typeof openaiModels).toBe('object');
      expect(openaiModels['claude-3-sonnet']).toBe('gpt-4');
    });
  });
});
