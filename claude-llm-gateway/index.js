/**
 * Claude LLM Gateway - Main Entry Point
 * Multi-provider LLM gateway with intelligent routing and automatic model selection
 */

const ClaudeLLMGateway = require('./src/server');
const DynamicConfigManager = require('./src/config/dynamic-config-manager');
const TokenManager = require('./src/token-manager');
const ProviderRouter = require('./src/provider-router');
const ClaudeCompatibility = require('./src/claude-compatibility');
const IntelligentModelSelector = require('./src/intelligent-model-selector');

module.exports = {
    ClaudeLLMGateway,
    DynamicConfigManager,
    TokenManager,
    ProviderRouter,
    ClaudeCompatibility,
    IntelligentModelSelector
};