/**
 * 智能Token管理器
 * 统一处理各种LLM提供商的token限制和优化
 */

class TokenManager {
    constructor() {
        this.providerLimits = this.initializeProviderLimits();
        this.taskTypeTokens = this.initializeTaskTypeTokens();
        this.logger = require('./utils/logger');
    }

    /**
     * 初始化各提供商的token限制
     */
    initializeProviderLimits() {
        return {
            // OpenAI 系列
            'openai': {
                'gpt-4': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.03 },
                'gpt-4-turbo': { min: 1, max: 128000, optimal: 8192, cost_per_1k: 0.01 },
                'gpt-4o': { min: 1, max: 128000, optimal: 8192, cost_per_1k: 0.005 },
                'gpt-3.5-turbo': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.002 },
                'gpt-3.5-turbo-16k': { min: 1, max: 16384, optimal: 8192, cost_per_1k: 0.004 }
            },

            // DeepSeek 系列
            'deepseek': {
                'deepseek-chat': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0014 },
                'deepseek-coder': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0014 },
                'deepseek-v2': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0014 }
            },

            // Anthropic Claude 系列
            'anthropic': {
                'claude-3-opus': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.075 },
                'claude-3-sonnet': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.015 },
                'claude-3-haiku': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.00125 },
                'claude-3-5-sonnet': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.015 }
            },

            // Google Gemini 系列
            'google': {
                'gemini-pro': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0005 },
                'gemini-1.5-pro': { min: 1, max: 32768, optimal: 8192, cost_per_1k: 0.0035 },
                'gemini-1.5-flash': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.000375 }
            },

            // Groq 系列
            'groq': {
                'mixtral-8x7b-32768': { min: 1, max: 32768, optimal: 8192, cost_per_1k: 0.00027 },
                'llama2-70b-4096': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.0008 },
                'gemma-7b-it': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0001 }
            },

            // Cohere 系列
            'cohere': {
                'command': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.015 },
                'command-r': { min: 1, max: 128000, optimal: 8192, cost_per_1k: 0.0005 },
                'command-r-plus': { min: 1, max: 128000, optimal: 8192, cost_per_1k: 0.003 }
            },

            // Mistral 系列
            'mistral': {
                'mistral-tiny': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.00025 },
                'mistral-small': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0006 },
                'mistral-medium': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.0027 },
                'mistral-large': { min: 1, max: 8192, optimal: 4096, cost_per_1k: 0.008 }
            },

            // Ollama 本地模型 (通常限制较低)
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

            // 默认限制（未知提供商）
            'default': {
                'default': { min: 1, max: 4096, optimal: 2048, cost_per_1k: 0.001 }
            }
        };
    }

    /**
     * 根据任务类型初始化推荐token数量
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
     * 智能分配tokens - 核心方法
     * @param {number} requestedTokens Claude Code请求的tokens
     * @param {string} provider 提供商名称
     * @param {string} model 模型名称
     * @param {string} taskType 任务类型
     * @param {string} taskComplexity 任务复杂度
     * @param {string} userInput 用户输入内容
     * @param {Object} options 配置选项
     * @returns {Object} 优化后的token配置
     */
    allocateTokens(requestedTokens, provider, model, taskType = 'conversation', taskComplexity = 'medium', userInput = '', options = {}) {
        try {
            // 1. 获取提供商和模型限制
            const providerConfig = this.providerLimits[provider] || this.providerLimits['default'];
            const modelConfig = providerConfig[model] || providerConfig['default'] || this.providerLimits['default']['default'];

            // 2. 获取任务类型推荐
            const taskConfig = this.taskTypeTokens[taskType] || this.taskTypeTokens['conversation'];
            const complexityConfig = taskConfig[taskComplexity] || taskConfig['medium'];

            // 3. 计算输入tokens（估算）
            const estimatedInputTokens = this.estimateInputTokens(userInput);

            // 4. 智能分配算法
            const allocation = this.calculateOptimalTokens({
                requestedTokens,
                modelConfig,
                complexityConfig,
                estimatedInputTokens,
                options
            });

            // 5. 验证和调整
            const finalTokens = this.validateAndAdjust(allocation.tokens, modelConfig);

            // 6. 生成详细报告
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
     * 估算输入tokens数量
     */
    estimateInputTokens(text) {
        if (!text || typeof text !== 'string') return 0;
        
        // 简单估算：英文约4个字符=1token，中文约1.5个字符=1token
        const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
        const otherChars = text.length - chineseChars;
        
        return Math.ceil(chineseChars / 1.5 + otherChars / 4);
    }

    /**
     * 计算最优tokens分配
     */
    calculateOptimalTokens({ requestedTokens, modelConfig, complexityConfig, estimatedInputTokens, options }) {
        const { prioritizeCost = false, prioritizeQuality = true, prioritizeSpeed = false } = options;

        // 基础分配策略
        let baseTokens = requestedTokens || complexityConfig.recommended;

        // 策略1: 成本优先
        if (prioritizeCost) {
            baseTokens = Math.min(baseTokens, modelConfig.optimal || 2048);
        }

        // 策略2: 质量优先  
        if (prioritizeQuality) {
            baseTokens = Math.max(baseTokens, complexityConfig.recommended);
            baseTokens = Math.min(baseTokens, modelConfig.max * 0.8); // 留20%余量
        }

        // 策略3: 速度优先
        if (prioritizeSpeed) {
            baseTokens = Math.min(baseTokens, modelConfig.optimal * 0.7);
        }

        // 考虑输入长度调整
        if (estimatedInputTokens > 0) {
            const totalTokensNeeded = estimatedInputTokens + baseTokens;
            if (totalTokensNeeded > modelConfig.max) {
                baseTokens = modelConfig.max - estimatedInputTokens - 100; // 留100tokens余量
            }
        }

        // 智能调整算法
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
     * 计算调整因子
     */
    calculateAdjustmentFactor(modelConfig, complexityConfig) {
        // 基于模型能力和任务复杂度的动态调整
        const modelCapacity = modelConfig.max / 8192; // 标准化到8k基准
        const complexityDemand = complexityConfig.max / 4096; // 标准化到4k基准
        
        return Math.max(0.5, Math.min(2.0, modelCapacity * complexityDemand));
    }

    /**
     * 确定分配策略
     */
    determineStrategy(prioritizeCost, prioritizeQuality, prioritizeSpeed) {
        if (prioritizeCost && prioritizeQuality && prioritizeSpeed) return 'balanced';
        if (prioritizeCost) return 'cost-optimized';
        if (prioritizeQuality) return 'quality-focused';
        if (prioritizeSpeed) return 'speed-optimized';
        return 'default';
    }

    /**
     * 验证和调整最终tokens
     */
    validateAndAdjust(tokens, modelConfig) {
        // 确保在模型限制范围内
        const minTokens = Math.max(modelConfig.min || 1, 1);
        const maxTokens = modelConfig.max || 4096;

        let finalTokens = Math.max(minTokens, Math.min(tokens, maxTokens));

        // 特殊调整规则
        if (finalTokens < 100) finalTokens = Math.min(100, maxTokens);
        if (finalTokens > maxTokens * 0.95) finalTokens = Math.floor(maxTokens * 0.95);

        return finalTokens;
    }

    /**
     * 生成分配报告
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
     * 计算成本估算
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
     * 生成优化建议
     */
    generateRecommendations(data) {
        const recommendations = [];
        const { finalAllocation, modelConfig, allocation, taskType } = data;

        // 基于使用率的建议
        const utilization = (finalAllocation / modelConfig.max);
        if (utilization < 0.3) {
            recommendations.push({
                type: 'efficiency',
                message: '当前token分配较保守，可考虑增加以获得更好的输出质量',
                action: 'increase_tokens'
            });
        } else if (utilization > 0.9) {
            recommendations.push({
                type: 'warning',
                message: '接近模型token限制，建议分段处理复杂任务',
                action: 'split_task'
            });
        }

        // 基于成本的建议
        if (modelConfig.cost_per_1k > 0.01) {
            recommendations.push({
                type: 'cost',
                message: '当前模型成本较高，可考虑使用更经济的替代模型',
                action: 'consider_alternatives'
            });
        }

        // 基于任务类型的建议
        if (taskType === 'coding' && finalAllocation < 2048) {
            recommendations.push({
                type: 'task_specific',
                message: '编程任务建议使用更多tokens以获得完整的代码实现',
                action: 'increase_for_coding'
            });
        }

        return recommendations;
    }

    /**
     * 获取提供商的token限制信息
     */
    getProviderLimits(provider, model = null) {
        const providerConfig = this.providerLimits[provider] || this.providerLimits['default'];
        
        if (model) {
            return providerConfig[model] || providerConfig['default'] || this.providerLimits['default']['default'];
        }
        
        return providerConfig;
    }

    /**
     * 批量处理token分配（用于多个请求）
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
     * 获取token使用统计
     */
    getTokenUsageStats() {
        return {
            totalProviders: Object.keys(this.providerLimits).length - 1, // 排除default
            supportedTaskTypes: Object.keys(this.taskTypeTokens),
            averageOptimalTokens: this.calculateAverageOptimalTokens(),
            costRange: this.calculateCostRange()
        };
    }

    /**
     * 计算平均最优tokens
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
     * 计算成本范围
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
