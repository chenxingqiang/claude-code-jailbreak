/**
 * Multi-LLM API Gateway
 * A comprehensive API gateway that enables Claude Code to work with 36+ LLM providers
 * 
 * @author Multi-LLM Gateway Team
 * @version 1.0.0
 * @license MIT
 */

// Main exports
const ClaudeLLMGateway = require('./src/server');
const DynamicConfigManager = require('./src/config/dynamic-config-manager');
const ClaudeCompatibility = require('./src/claude-compatibility');
const ProviderRouter = require('./src/provider-router');

module.exports = {
  ClaudeLLMGateway,
  DynamicConfigManager,
  ClaudeCompatibility,
  ProviderRouter,
  
  // Convenience method to start the gateway
  async start(options = {}) {
    const gateway = new ClaudeLLMGateway();
    await gateway.start(options.port || 3000);
    return gateway;
  },

  // Create gateway instance without starting
  create(options = {}) {
    return new ClaudeLLMGateway(options);
  },

  // Version information
  version: require('./package.json').version,
  
  // Supported providers
  providers: [
    'openai', 'anthropic', 'google', 'cohere', 'huggingface', 
    'ollama', 'mistral', 'groq', 'perplexity', 'ai21',
    'nvidia', 'fireworks', 'together', 'anyscale', 'deepseek',
    'replicate', 'gooseai', 'forefront', 'writer', 'neets',
    'lamini', 'hyperbee', 'novita', 'shuttle', 'theb',
    'corcel', 'aimlapi', 'ailayer', 'monster', 'deepinfra',
    'friendliai', 'reka', 'voyage', 'watsonx', 'zhipu',
    'llamacpp'
  ]
};
