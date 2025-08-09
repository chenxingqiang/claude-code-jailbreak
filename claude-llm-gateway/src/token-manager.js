/**
 * Intelligent Token Manager
 * Unified handling of token limits and optimization for various LLM providers
 */

class TokenManager {
    constructor() {
        this.providerLimits = this.initializeProviderLimits();
        this.taskTypeTokens = this.initializeTaskTypeTokens();
        this.logger = require('./utils/logger');
    }

    /**
     * Initialize token limits for various providers
     */
    initializeProviderLimits() {
        return {
            // OpenAI series
            'openai': {
                'gpt-4': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.03 },
                'gpt-4-turbo': { min: 1, max: 128000, optimal: 8192, cost_per_1k: 0.01 },
                'gpt-4o': { min: 1, max: 128000, optimal: 8192, cost_per_1k: 0.005 },
                'gpt-3.5-turbo': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.002 },
                'gpt-3.5-turbo-16k': { min: 1, max: 16384, optimal: 8192, cost_per_1k: 0.004 }
            },

            // DeepSeek series
            'deepseek': {
                'deepseek-chat': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0014 },
                'deepseek-coder': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0014 },
                'deepseek-v2': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0014 }
            },

            // Anthropic Claude series
            'anthropic': {
                'claude-3-opus': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.075 },
                'claude-3-sonnet': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.015 },
                'claude-3-haiku': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.00125 },
                'claude-3-5-sonnet': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.015 }
            },

            // Google Gemini series
            'google': {
                'gemini-pro': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0005 },
                'gemini-1.5-pro': { min: 1, max: 32768, optimal: 8192, cost_per_1k: 0.0035 },
                'gemini-1.5-flash': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.000375 }
            },

            // Groq series
            'groq': {
                'mixtral-8x7b-32768': { min: 1, max: 32768, optimal: 8192, cost_per_1k: 0.00027 },
                'llama2-70b-4096': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.0008 },
                'gemma-7b-it': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0001 }
            },

            // Cohere series
            'cohere': {
                'command': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.015 },
                'command-r': { min: 1, max: 128000, optimal: 8192, cost_per_1k: 0.0005 },
                'command-r-plus': { min: 1, max: 128000, optimal: 8192, cost_per_1k: 0.003 }
            },

            // Mistral series
            'mistral': {
                'mistral-tiny': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.00025 },
                'mistral-small': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0006 },
                'mistral-medium': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0027 },
                'mistral-large': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.008 }
            },

            // Ollama local models (typically lower limits)
            'ollama': {
                'llama2': { min: 1, max: 2048, optimal: 1024, cost_per_1k: 0 },
                'codellama': { min: 1, max: 2048, optimal: 1024, cost_per_1k: 0 },
                'mistral': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0 },
                'qwen': { min: 1, max: 2048, optimal: 1024, cost_per_1k: 0 }
            },

            // Hugging Face
            'huggingface': {
                'microsoft/DialoGPT-medium': { min: 1, max: 1024, optimal: 512, cost_per_1k: 0 },
                'microsoft/DialoGPT-large': { min: 1, max: 1024, optimal: 512, cost_per_1k: 0 },
                'facebook/blenderbot-400M-distill': { min: 1, max: 1024, optimal: 512, cost_per_1k: 0 }
            },

            // Default limits (unknown providers)
            'default': {
                'default': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.001 }
            }
        };
    }

    /**
     * Initialize recommended token amounts based on task types
     */
    initializeTaskTypeTokens() {
        return {
            'coding': {
                'simple': { min: 512, recommended: 1024, max: 2048 },
                'medium': { min: 1024, recommended: 2048, max: 4096 },
                'complex': { min: 2048, recommended: 4096, max: 8192 }
            },
            'conversation': {
                'simple': { min: 256, recommended: 512, max: 1024 },
                'medium': { min: 512, recommended: 1024, max: 2048 },
                'complex': { min: 1024, recommended: 2048, max: 4096 }
            },
            'analysis': {
                'simple': { min: 512, recommended: 1024, max: 2048 },
                'medium': { min: 1024, recommended: 2048, max: 4096 },
                'complex': { min: 2048, recommended: 4096, max: 8192 }
            },
            'creative': {
                'simple': { min: 1024, recommended: 2048, max: 4096 },
                'medium': { min: 2048, recommended: 4096, max: 8192 },
                'complex': { min: 4096, recommended: 8192, max: 16384 }
            },
            'translation': {
                'simple': { min: 256, recommended: 512, max: 1024 },
                'medium': { min: 512, recommended: 1024, max: 2048 },
                'complex': { min: 1024, recommended: 2048, max: 4096 }
            },
            'summary': {
                'simple': { min: 256, recommended: 512, max: 1024 },
                'medium': { min: 512, recommended: 1024, max: 2048 },
                'complex': { min: 1024, recommended: 2048, max: 4096 }
            }
        };
    }

    /**
     * Intelligent token allocation - core method
     * @param {number} requestedTokens Tokens requested by Claude Code
     * @param {string} provider Provider name
     * @param {string} model Model name
     * @param {string} taskType Task type
     * @param {string} taskComplexity Task complexity
     * @param {string} userInput User input content
     * @param {Object} options Configuration options
     * @returns {Object} Optimized token configuration
     */
    allocateTokens(requestedTokens, provider, model, taskType = 'conversation', taskComplexity = 'medium', userInput = '', options = {}) {
        try {
            // 1. Get provider and model limits
            const providerConfig = this.providerLimits[provider] || this.providerLimits['default'];
            const modelConfig = providerConfig[model] || providerConfig['default'] || this.providerLimits['default']['default'];

            // 2. Get task type recommendations
            const taskConfig = this.taskTypeTokens[taskType] || this.taskTypeTokens['conversation'];
            const complexityConfig = taskConfig[taskComplexity] || taskConfig['medium'];

            // 3. Calculate input tokens (estimate)
            const estimatedInputTokens = this.estimateInputTokens(userInput);

            // 4. Intelligent allocation algorithm
            const allocation = this.calculateOptimalTokens({
                requestedTokens,
                modelConfig,
                complexityConfig,
                estimatedInputTokens,
                options
            });

            // 5. Validate and adjust
            const finalTokens = this.validateAndAdjust(allocation.tokens, modelConfig);

            // 6. Generate detailed report
            const report = this.generateAllocationReport({
                originalRequest: requestedTokens,
                finalAllocation: finalTokens,
                provider,
                model,
                taskType,
                taskComplexity,
                modelConfig,
                allocation,
                estimatedInputTokens
            });

            return {
                tokens: finalTokens,
                allocation: allocation,
                report: report,
                success: true
            };

        } catch (error) {
            this.logger.error('Token allocation failed:', error);
            return {
                tokens: Math.min(requestedTokens || 1000, 4096),
                allocation: { strategy: 'fallback' },
                report: { error: error.message },
                success: false
            };
        }
    }

    /**
     * Estimate input token count
     */
    estimateInputTokens(text) {
        if (!text || typeof text !== 'string') return 0;
        
        // Simple estimate: English ~4 chars=1token, Chinese ~1.5 chars=1token
        const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
        const otherChars = text.length - chineseChars;
        
        return Math.ceil(chineseChars / 1.5 + otherChars / 4);
    }

    /**
     * Calculate optimal token allocation
     */
    calculateOptimalTokens({ requestedTokens, modelConfig, complexityConfig, estimatedInputTokens, options }) {
        const { prioritizeCost = false, prioritizeQuality = true, prioritizeSpeed = false } = options;

        // Basic allocation strategy
        let baseTokens = requestedTokens || complexityConfig.recommended;

        // Strategy 1: Cost priority
        if (prioritizeCost) {
            baseTokens = Math.min(baseTokens, modelConfig.optimal || 2048);
        }

        // Strategy 2: Quality priority  
        if (prioritizeQuality) {
            baseTokens = Math.max(baseTokens, complexityConfig.recommended);
            baseTokens = Math.min(baseTokens, modelConfig.max * 0.8); // Leave 20% margin
        }

        // Strategy 3: Speed priority
        if (prioritizeSpeed) {
            baseTokens = Math.min(baseTokens, modelConfig.optimal * 0.7);
        }

        // Consider input length adjustment
        if (estimatedInputTokens > 0) {
            const totalTokensNeeded = estimatedInputTokens + baseTokens;
            if (totalTokensNeeded > modelConfig.max) {
                baseTokens = modelConfig.max - estimatedInputTokens - 100; // Leave 100 tokens margin
            }
        }

        // Intelligent adjustment algorithm
        const adjustmentFactor = this.calculateAdjustmentFactor(modelConfig, complexityConfig);
        const adjustedTokens = Math.round(baseTokens * adjustmentFactor);

        return {
            strategy: this.determineStrategy(prioritizeCost, prioritizeQuality, prioritizeSpeed),
            baseTokens,
            adjustmentFactor,
            tokens: adjustedTokens,
            inputTokens: estimatedInputTokens,
            totalBudget: adjustedTokens + estimatedInputTokens
        };
    }

    /**
     * Calculate adjustment factor
     */
    calculateAdjustmentFactor(modelConfig, complexityConfig) {
        // Dynamic adjustment based on model capability and task complexity
        const modelCapacity = modelConfig.max / 8192; // Normalized to 8k baseline
        const complexityDemand = complexityConfig.max / 4096; // Normalized to 4k baseline
        
        return Math.max(0.5, Math.min(2.0, modelCapacity * complexityDemand));
    }

    /**
     * Determine allocation strategy
     */
    determineStrategy(prioritizeCost, prioritizeQuality, prioritizeSpeed) {
        if (prioritizeCost && prioritizeQuality && prioritizeSpeed) return 'balanced';
        if (prioritizeCost) return 'cost-optimized';
        if (prioritizeQuality) return 'quality-focused';
        if (prioritizeSpeed) return 'speed-optimized';
        return 'default';
    }

    /**
     * Validate and adjust final tokens
     */
    validateAndAdjust(tokens, modelConfig) {
        // Ensure within model limits
        const minTokens = Math.max(modelConfig.min || 1, 1);
        const maxTokens = modelConfig.max || 4096;

        let finalTokens = Math.max(minTokens, Math.min(tokens, maxTokens));

        // Special adjustment rules
        if (finalTokens < 100) finalTokens = Math.min(100, maxTokens);
        if (finalTokens > maxTokens * 0.95) finalTokens = Math.floor(maxTokens * 0.95);

        return finalTokens;
    }

    /**
     * Generate allocation report
     */
    generateAllocationReport(data) {
        const {
            originalRequest,
            finalAllocation,
            provider,
            model,
            taskType,
            taskComplexity,
            modelConfig,
            allocation,
            estimatedInputTokens
        } = data;

        const costEstimate = this.calculateCostEstimate(finalAllocation, modelConfig.cost_per_1k);
        
        return {
            summary: {
                original: originalRequest,
                allocated: finalAllocation,
                change: finalAllocation - (originalRequest || 0),
                changePercent: originalRequest ? ((finalAllocation - originalRequest) / originalRequest * 100).toFixed(1) : 0
            },
            context: {
                provider,
                model,
                taskType,
                taskComplexity
            },
            allocation: {
                strategy: allocation.strategy,
                inputTokens: estimatedInputTokens,
                outputTokens: finalAllocation,
                totalTokens: estimatedInputTokens + finalAllocation,
                modelLimit: modelConfig.max,
                utilizationPercent: ((estimatedInputTokens + finalAllocation) / modelConfig.max * 100).toFixed(1)
            },
            optimization: {
                modelOptimal: modelConfig.optimal,
                isOptimal: Math.abs(finalAllocation - modelConfig.optimal) <= modelConfig.optimal * 0.2,
                efficiency: (finalAllocation / modelConfig.max * 100).toFixed(1) + '%'
            },
            cost: costEstimate,
            recommendations: this.generateRecommendations(data)
        };
    }

    /**
     * Calculate cost estimate
     */
    calculateCostEstimate(tokens, costPer1k) {
        if (!costPer1k || costPer1k === 0) {
            return { estimated: 0, currency: 'FREE' };
        }

        const cost = (tokens / 1000) * costPer1k;
        return {
            estimated: cost,
            formatted: `$${cost.toFixed(6)}`,
            currency: 'USD'
        };
    }

    /**
     * Generate optimization recommendations
     */
    generateRecommendations(data) {
        const recommendations = [];
        const { finalAllocation, modelConfig, allocation, taskType } = data;

        // Usage-based recommendations
        const utilization = (finalAllocation / modelConfig.max);
        if (utilization < 0.3) {
            recommendations.push({
                type: 'efficiency',
                message: 'Current token allocation is conservative, consider increasing for better output quality',
                action: 'increase_tokens'
            });
        } else if (utilization > 0.9) {
            recommendations.push({
                type: 'warning',
                message: 'Approaching model token limit, suggest processing complex tasks in segments',
                action: 'split_task'
            });
        }

        // Cost-based recommendations
        if (modelConfig.cost_per_1k > 0.01) {
            recommendations.push({
                type: 'cost',
                message: 'Current model has high cost, consider using more economical alternative models',
                action: 'consider_alternatives'
            });
        }

        // Task type-based recommendations
        if (taskType === 'coding' && finalAllocation < 2048) {
            recommendations.push({
                type: 'task_specific',
                message: 'Programming tasks recommend using more tokens for complete code implementation',
                action: 'increase_for_coding'
            });
        }

        return recommendations;
    }

    /**
     * Get provider token limit information
     */
    getProviderLimits(provider, model = null) {
        const providerConfig = this.providerLimits[provider] || this.providerLimits['default'];
        
        if (model) {
            return providerConfig[model] || providerConfig['default'] || this.providerLimits['default']['default'];
        }
        
        return providerConfig;
    }

    /**
     * Batch process token allocation (for multiple requests)
     */
    batchAllocateTokens(requests) {
        return requests.map(request => {
            const { requestedTokens, provider, model, taskType, taskComplexity, userInput, options } = request;
            return {
                id: request.id || Date.now() + Math.random(),
                result: this.allocateTokens(requestedTokens, provider, model, taskType, taskComplexity, userInput, options)
            };
        });
    }

    /**
     * Get token usage statistics
     */
    getTokenUsageStats() {
        return {
            totalProviders: Object.keys(this.providerLimits).length - 1, // Exclude default
            supportedTaskTypes: Object.keys(this.taskTypeTokens),
            averageOptimalTokens: this.calculateAverageOptimalTokens(),
            costRange: this.calculateCostRange()
        };
    }

    /**
     * Calculate average optimal tokens
     */
    calculateAverageOptimalTokens() {
        let total = 0;
        let count = 0;
        
        Object.values(this.providerLimits).forEach(provider => {
            if (typeof provider === 'object') {
                Object.values(provider).forEach(model => {
                    if (model.optimal) {
                        total += model.optimal;
                        count++;
                    }
                });
            }
        });
        
        return count > 0 ? Math.round(total / count) : 2048;
    }

    /**
     * Calculate cost range
     */
    calculateCostRange() {
        const costs = [];
        
        Object.values(this.providerLimits).forEach(provider => {
            if (typeof provider === 'object') {
                Object.values(provider).forEach(model => {
                    if (model.cost_per_1k > 0) {
                        costs.push(model.cost_per_1k);
                    }
                });
            }
        });
        
        costs.sort((a, b) => a - b);
        
        return {
            min: costs[0] || 0,
            max: costs[costs.length - 1] || 0,
            median: costs[Math.floor(costs.length / 2)] || 0
        };
    }
}

module.exports = TokenManager;
