/**
 * Intelligent Model Selector
 * Automatically selects the best model based on task type, performance metrics, and user requirements
 */

class IntelligentModelSelector {
    constructor() {
        this.modelPerformance = new Map();
        this.taskPatterns = this.initializeTaskPatterns();
        this.modelCapabilities = this.initializeModelCapabilities();
        this.loadPerformanceData();
    }

    /**
     * Initialize task detection patterns
     */
    initializeTaskPatterns() {
        return {
            coding: {
                keywords: [
                    'write code', 'programming', 'function', 'algorithm', 'code', 'script', 'debug', 
                    'API', 'interface', 'class', 'method', 'variable', 'bug', 'error',
                    'python', 'javascript', 'java', 'golang', 'rust', 'cpp', 'c++',
                    'html', 'css', 'sql', 'bash', 'shell', 'regex'
                ],
                patterns: [
                    /write.*?code|implement.*?function/i,
                    /develop.*?system|build.*?application/i,
                    /fix.*?bug|solve.*?problem/i,
                    /optimize.*?code|refactor.*?code/i,
                    /design.*?algorithm|implement.*?algorithm/i
                ],
                weight: 0.8
            },
            analysis: {
                keywords: [
                    'analysis', 'statistics', 'data', 'report', 'chart', 'trend', 'comparison',
                    'analyze', 'explanation', 'description', 'research', 'investigation', 'evaluation'
                ],
                patterns: [
                    /analyze.*?data|data.*?analysis/i,
                    /statistics.*?information|information.*?statistics/i,
                    /explain.*?phenomenon|phenomenon.*?explanation/i,
                    /compare.*?differences|contrast.*?results/i
                ],
                weight: 0.7
            },
            creative: {
                keywords: [
                    'creation', 'writing', 'story', 'article', 'poetry', 'novel', 'script',
                    'creative', 'imagination', 'creativity', 'design', 'art', 'inspiration'
                ],
                patterns: [
                    /write.*?story|create.*?article/i,
                    /design.*?solution|creative.*?idea/i,
                    /write.*?poetry|create.*?poem/i
                ],
                weight: 0.6
            },
            translation: {
                keywords: [
                    'translation', 'translate', 'English', 'Chinese', 'Japanese', 'Korean', 'French', 'German',
                    'language', 'conversion'
                ],
                patterns: [
                    /translate.*?to|translate.*?into/i,
                    /language.*?conversion|convert.*?language/i
                ],
                weight: 0.9
            },
            conversation: {
                keywords: [
                    'chat', 'conversation', 'communication', 'discussion', 'suggestion', 'opinion',
                    'hello', 'help', 'talk', 'discuss', 'advice'
                ],
                patterns: [
                    /hello|hi|hey/i,
                    /help.*?me|I.*?need/i,
                    /give.*?suggestion|provide.*?advice/i
                ],
                weight: 0.5
            }
        };
    }

    /**
     * Initialize model capabilities and preferences
     */
    initializeModelCapabilities() {
        return {
            // OpenAI Models
            'gpt-4o': {
                strengths: ['coding', 'analysis', 'creative', 'translation', 'multimodal'],
                weaknesses: [],
                speed: 'fast',
                cost: 'high',
                quality: 'very_high',
                baseScore: 98
            },
            'gpt-4': {
                strengths: ['coding', 'analysis', 'creative', 'translation'],
                weaknesses: [],
                speed: 'medium',
                cost: 'high',
                quality: 'very_high',
                baseScore: 95
            },
            'gpt-4-turbo': {
                strengths: ['coding', 'analysis', 'creative', 'translation', 'multimodal'],
                weaknesses: [],
                speed: 'fast',
                cost: 'medium',
                quality: 'very_high',
                baseScore: 96
            },
            'gpt-3.5-turbo': {
                strengths: ['conversation', 'analysis'],
                weaknesses: ['coding', 'creative'],
                speed: 'very_fast',
                cost: 'very_low',
                quality: 'high',
                baseScore: 80
            },
            'gpt-4o-mini': {
                strengths: ['conversation', 'analysis', 'coding'],
                weaknesses: ['creative'],
                speed: 'very_fast',
                cost: 'low',
                quality: 'high',
                baseScore: 85
            },
            
            // Anthropic Models
            'claude-3-opus': {
                strengths: ['analysis', 'creative', 'translation', 'reasoning'],
                weaknesses: ['coding'],
                speed: 'slow',
                cost: 'very_high',
                quality: 'very_high',
                baseScore: 97
            },
            'claude-3-sonnet': {
                strengths: ['analysis', 'creative', 'translation'],
                weaknesses: ['coding'],
                speed: 'medium',
                cost: 'medium',
                quality: 'very_high',
                baseScore: 90
            },
            'claude-3-haiku': {
                strengths: ['conversation', 'analysis'],
                weaknesses: ['coding', 'creative'],
                speed: 'very_fast',
                cost: 'low',
                quality: 'high',
                baseScore: 85
            },
            'claude-3.5-sonnet': {
                strengths: ['coding', 'analysis', 'creative', 'translation'],
                weaknesses: [],
                speed: 'medium',
                cost: 'medium',
                quality: 'very_high',
                baseScore: 94
            },
            
            // Google Models
            'gemini-pro': {
                strengths: ['analysis', 'conversation', 'multimodal'],
                weaknesses: ['coding'],
                speed: 'fast',
                cost: 'low',
                quality: 'high',
                baseScore: 82
            },
            'gemini-1.5-pro': {
                strengths: ['analysis', 'conversation', 'multimodal', 'long_context'],
                weaknesses: ['coding'],
                speed: 'medium',
                cost: 'medium',
                quality: 'very_high',
                baseScore: 88
            },
            'gemini-ultra': {
                strengths: ['analysis', 'reasoning', 'multimodal', 'creative'],
                weaknesses: ['coding'],
                speed: 'slow',
                cost: 'high',
                quality: 'very_high',
                baseScore: 92
            },
            
            // DeepSeek Models
            'deepseek-chat': {
                strengths: ['conversation', 'analysis', 'translation'],
                weaknesses: ['creative'],
                speed: 'fast',
                cost: 'very_low',
                quality: 'high',
                baseScore: 85
            },
            'deepseek-coder': {
                strengths: ['coding'],
                weaknesses: ['creative', 'conversation'],
                speed: 'fast',
                cost: 'very_low',
                quality: 'very_high',
                baseScore: 95
            },
            'deepseek-v3': {
                strengths: ['coding', 'analysis', 'reasoning'],
                weaknesses: ['creative'],
                speed: 'fast',
                cost: 'low',
                quality: 'very_high',
                baseScore: 93
            },
            
            // Meta Models
            'llama-3.1-405b': {
                strengths: ['coding', 'analysis', 'reasoning'],
                weaknesses: ['creative'],
                speed: 'slow',
                cost: 'high',
                quality: 'very_high',
                baseScore: 91
            },
            'llama-3.1-70b': {
                strengths: ['coding', 'analysis'],
                weaknesses: ['creative'],
                speed: 'medium',
                cost: 'medium',
                quality: 'high',
                baseScore: 87
            },
            'llama-3.1-8b': {
                strengths: ['conversation'],
                weaknesses: ['coding', 'creative', 'analysis'],
                speed: 'very_fast',
                cost: 'very_low',
                quality: 'medium',
                baseScore: 75
            },
            
            // Mistral Models
            'mistral-large': {
                strengths: ['coding', 'analysis', 'multilingual'],
                weaknesses: ['creative'],
                speed: 'medium',
                cost: 'medium',
                quality: 'very_high',
                baseScore: 89
            },
            'mistral-medium': {
                strengths: ['conversation', 'analysis'],
                weaknesses: ['coding'],
                speed: 'fast',
                cost: 'low',
                quality: 'high',
                baseScore: 82
            },
            'mistral-small': {
                strengths: ['conversation'],
                weaknesses: ['coding', 'analysis'],
                speed: 'very_fast',
                cost: 'very_low',
                quality: 'medium',
                baseScore: 78
            },
            
            // Chinese Models
            'qianwen-max': {
                strengths: ['chinese', 'analysis', 'translation'],
                weaknesses: ['coding'],
                speed: 'medium',
                cost: 'medium',
                quality: 'high',
                baseScore: 86
            },
            'qianwen-plus': {
                strengths: ['chinese', 'conversation'],
                weaknesses: ['coding', 'creative'],
                speed: 'fast',
                cost: 'low',
                quality: 'high',
                baseScore: 83
            },
            'zhipu-glm-4': {
                strengths: ['chinese', 'analysis'],
                weaknesses: ['coding'],
                speed: 'medium',
                cost: 'low',
                quality: 'high',
                baseScore: 84
            },
            'baichuan-13b': {
                strengths: ['chinese', 'conversation'],
                weaknesses: ['coding', 'analysis'],
                speed: 'fast',
                cost: 'low',
                quality: 'medium',
                baseScore: 79
            },
            'chatglm-6b': {
                strengths: ['chinese', 'conversation'],
                weaknesses: ['coding', 'analysis'],
                speed: 'fast',
                cost: 'very_low',
                quality: 'medium',
                baseScore: 76
            },
            
            // Cohere Models
            'command-r-plus': {
                strengths: ['analysis', 'reasoning', 'retrieval'],
                weaknesses: ['coding'],
                speed: 'medium',
                cost: 'medium',
                quality: 'high',
                baseScore: 86
            },
            'command-r': {
                strengths: ['conversation', 'retrieval'],
                weaknesses: ['coding'],
                speed: 'fast',
                cost: 'low',
                quality: 'high',
                baseScore: 81
            },
            
            // xAI Models
            'grok-1': {
                strengths: ['creative', 'conversation', 'humor'],
                weaknesses: ['coding'],
                speed: 'medium',
                cost: 'medium',
                quality: 'high',
                baseScore: 83
            },
            
            // Other Models
            'moonshot-v1': {
                strengths: ['chinese', 'long_context'],
                weaknesses: ['coding'],
                speed: 'medium',
                cost: 'low',
                quality: 'high',
                baseScore: 82
            },
            'yi-large': {
                strengths: ['chinese', 'analysis'],
                weaknesses: ['coding'],
                speed: 'medium',
                cost: 'low',
                quality: 'high',
                baseScore: 84
            }
        };
    }

    /**
     * Detect task type from user input
     */
    detectTaskType(userInput, systemPrompt = '') {
        const input = (userInput + ' ' + systemPrompt).toLowerCase();
        const taskScores = {};

        // Initialize scores
        Object.keys(this.taskPatterns).forEach(taskType => {
            taskScores[taskType] = 0;
        });

        // Keyword matching
        Object.entries(this.taskPatterns).forEach(([taskType, patterns]) => {
            patterns.keywords.forEach(keyword => {
                if (input.includes(keyword.toLowerCase())) {
                    taskScores[taskType] += patterns.weight;
                }
            });

            // Pattern matching
            patterns.patterns.forEach(pattern => {
                if (pattern.test(input)) {
                    taskScores[taskType] += patterns.weight * 1.5; // Higher weight for patterns
                }
            });
        });

        // Find the task type with highest score
        const detectedTaskType = Object.entries(taskScores)
            .reduce((max, [taskType, score]) => 
                score > max.score ? { taskType, score } : max, 
                { taskType: 'conversation', score: 0 }
            );

        return {
            taskType: detectedTaskType.taskType,
            confidence: Math.min(detectedTaskType.score, 1.0),
            allScores: taskScores
        };
    }

    /**
     * Calculate model score for a specific task
     */
    calculateModelScore(modelName, taskType, requirements = {}) {
        const modelInfo = this.modelCapabilities[modelName];
        if (!modelInfo) return 0;

        let score = modelInfo.baseScore;

        // Task-specific scoring
        if (modelInfo.strengths.includes(taskType)) {
            score += 15;
        }
        if (modelInfo.weaknesses.includes(taskType)) {
            score -= 10;
        }

        // Performance-based adjustment
        const performanceData = this.modelPerformance.get(modelName);
        if (performanceData) {
            score += (performanceData.successRate - 0.5) * 20; // -10 to +10 adjustment
            score -= performanceData.avgResponseTime / 1000; // Penalty for slow response
        }

        // Requirements-based adjustment
        if (requirements.prioritizeSpeed && modelInfo.speed === 'very_fast') {
            score += 10;
        }
        if (requirements.prioritizeCost && modelInfo.cost === 'low') {
            score += 8;
        }
        if (requirements.prioritizeQuality && modelInfo.quality === 'very_high') {
            score += 12;
        }

        return Math.max(0, score);
    }

    /**
     * Select the best model for a given request
     */
    selectBestModel(userInput, systemPrompt = '', availableModels = [], requirements = {}) {
        // Detect task type
        const taskDetection = this.detectTaskType(userInput, systemPrompt);
        
        // Score all available models
        const modelScores = availableModels.map(modelName => ({
            model: modelName,
            score: this.calculateModelScore(modelName, taskDetection.taskType, requirements),
            taskType: taskDetection.taskType,
            confidence: taskDetection.confidence
        }));

        // Sort by score (highest first)
        modelScores.sort((a, b) => b.score - a.score);

        const result = {
            selectedModel: modelScores[0]?.model || availableModels[0],
            taskType: taskDetection.taskType,
            confidence: taskDetection.confidence,
            reasoning: this.generateReasoning(modelScores[0], taskDetection),
            alternatives: modelScores.slice(1, 3), // Top 2 alternatives
            allScores: modelScores
        };

        console.log(`🧠 Intelligent model selection: ${result.selectedModel} (task type: ${result.taskType}, confidence: ${(result.confidence * 100).toFixed(1)}%)`);
        console.log(`💡 Selection reason: ${result.reasoning}`);

        return result;
    }

    /**
     * Generate human-readable reasoning for model selection
     */
    generateReasoning(selectedModelInfo, taskDetection) {
        if (!selectedModelInfo) return 'using default model';

        const modelName = selectedModelInfo.model;
        const taskType = taskDetection.taskType;
        const modelCaps = this.modelCapabilities[modelName];

        const taskNames = {
            coding: 'programming task',
            analysis: 'analysis task',
            creative: 'creative task',
            translation: 'translation task',
            conversation: 'conversation task'
        };

        let reasoning = `Detected ${taskNames[taskType] || taskType}`;

        if (modelCaps?.strengths.includes(taskType)) {
            reasoning += `, ${modelName} performs excellently on this type of task`;
        }

        if (modelCaps?.quality === 'very_high') {
            reasoning += ', high quality output';
        }

        if (modelCaps?.cost === 'low') {
            reasoning += ', cost effective';
        }

        return reasoning;
    }

    /**
     * Update model performance data
     */
    updateModelPerformance(modelName, responseTime, success, userRating = null) {
        if (!this.modelPerformance.has(modelName)) {
            this.modelPerformance.set(modelName, {
                totalRequests: 0,
                successfulRequests: 0,
                totalResponseTime: 0,
                successRate: 0.5,
                avgResponseTime: 3000,
                userRatings: []
            });
        }

        const perf = this.modelPerformance.get(modelName);
        perf.totalRequests++;
        perf.totalResponseTime += responseTime;
        
        if (success) {
            perf.successfulRequests++;
        }

        if (userRating !== null) {
            perf.userRatings.push(userRating);
            // Keep only last 100 ratings
            if (perf.userRatings.length > 100) {
                perf.userRatings = perf.userRatings.slice(-100);
            }
        }

        // Update calculated metrics
        perf.successRate = perf.successfulRequests / perf.totalRequests;
        perf.avgResponseTime = perf.totalResponseTime / perf.totalRequests;

        this.modelPerformance.set(modelName, perf);
    }

    /**
     * Load performance data from storage
     */
    loadPerformanceData() {
        // In a real implementation, this would load from a database or file
        // For now, we'll start with empty performance data
        console.log('📊 Model performance tracking initialized');
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const stats = {};
        this.modelPerformance.forEach((perf, modelName) => {
            stats[modelName] = {
                successRate: (perf.successRate * 100).toFixed(1) + '%',
                avgResponseTime: Math.round(perf.avgResponseTime) + 'ms',
                totalRequests: perf.totalRequests,
                avgUserRating: perf.userRatings.length > 0 
                    ? (perf.userRatings.reduce((a, b) => a + b, 0) / perf.userRatings.length).toFixed(1)
                    : 'N/A'
            };
        });
        return stats;
    }
}

module.exports = IntelligentModelSelector;