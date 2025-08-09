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
          '写代码', '编程', '函数', '算法', '代码', 'code', 'function', 'program',
          '脚本', 'script', '调试', 'debug', 'API', '接口', '类', 'class',
          '方法', 'method', '变量', 'variable', 'bug', '错误', 'error',
          'python', 'javascript', 'java', 'golang', 'rust', 'cpp', 'c++',
          'html', 'css', 'sql', 'bash', 'shell', '正则', 'regex'
        ],
        patterns: [
          /写.*?代码|编写.*?程序/i,
          /实现.*?功能|开发.*?系统/i,
          /修复.*?bug|解决.*?问题/i,
          /优化.*?代码|重构.*?代码/i,
          /设计.*?算法|实现.*?算法/i
        ],
        weight: 0.8
      },
      analysis: {
        keywords: [
          '分析', '统计', '数据', '报告', '图表', '趋势', '对比',
          'analyze', 'data', 'statistics', 'report', 'chart', 'trend',
          '解释', '说明', '研究', '调查', '评估', '比较'
        ],
        patterns: [
          /分析.*?数据|数据.*?分析/i,
          /统计.*?信息|信息.*?统计/i,
          /解释.*?现象|现象.*?解释/i,
          /比较.*?差异|对比.*?结果/i
        ],
        weight: 0.7
      },
      creative: {
        keywords: [
          '创作', '写作', '故事', '文章', '诗歌', '小说', '剧本',
          'creative', 'writing', 'story', 'article', 'poem', 'novel',
          '想象', '创意', '设计', '艺术', '灵感'
        ],
        patterns: [
          /写.*?故事|创作.*?文章/i,
          /设计.*?方案|创意.*?想法/i,
          /写.*?诗歌|创作.*?诗词/i
        ],
        weight: 0.6
      },
      translation: {
        keywords: [
          '翻译', '译', '英文', '中文', '日文', '韩文', '法文', '德文',
          'translate', 'translation', 'english', 'chinese', 'japanese',
          '语言', 'language', '转换'
        ],
        patterns: [
          /翻译.*?成|译.*?为/i,
          /转换.*?语言|语言.*?转换/i
        ],
        weight: 0.9
      },
      conversation: {
        keywords: [
          '聊天', '对话', '交流', '讨论', '建议', '意见',
          'chat', 'conversation', 'talk', 'discuss', 'advice',
          '你好', 'hello', '帮助', 'help'
        ],
        patterns: [
          /你好|hello|hi/i,
          /帮助.*?我|我.*?需要/i,
          /建议.*?一下|给.*?建议/i
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
      'deepseek-chat': {
        strengths: ['conversation', 'analysis', 'translation'],
        weaknesses: ['creative'],
        speed: 'fast',
        cost: 'low',
        quality: 'high',
        baseScore: 85
      },
      'deepseek-coder': {
        strengths: ['coding'],
        weaknesses: ['creative', 'conversation'],
        speed: 'fast', 
        cost: 'low',
        quality: 'very_high',
        baseScore: 95
      },
      'gpt-4': {
        strengths: ['coding', 'analysis', 'creative', 'translation'],
        weaknesses: [],
        speed: 'medium',
        cost: 'high',
        quality: 'very_high',
        baseScore: 95
      },
      'gpt-3.5-turbo': {
        strengths: ['conversation', 'analysis'],
        weaknesses: ['coding'],
        speed: 'very_fast',
        cost: 'low',
        quality: 'high',
        baseScore: 80
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
      'gemini-pro': {
        strengths: ['analysis', 'conversation'],
        weaknesses: ['coding'],
        speed: 'fast',
        cost: 'low',
        quality: 'high',
        baseScore: 80
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

    console.log(`🧠 智能模型选择: ${result.selectedModel} (任务类型: ${result.taskType}, 置信度: ${(result.confidence * 100).toFixed(1)}%)`);
    console.log(`💡 选择理由: ${result.reasoning}`);

    return result;
  }

  /**
   * Generate human-readable reasoning for model selection
   */
  generateReasoning(selectedModelInfo, taskDetection) {
    if (!selectedModelInfo) return '使用默认模型';

    const modelName = selectedModelInfo.model;
    const taskType = taskDetection.taskType;
    const modelCaps = this.modelCapabilities[modelName];

    const taskNames = {
      coding: '编程任务',
      analysis: '分析任务', 
      creative: '创作任务',
      translation: '翻译任务',
      conversation: '对话任务'
    };

    let reasoning = `检测到${taskNames[taskType] || taskType}`;

    if (modelCaps?.strengths.includes(taskType)) {
      reasoning += `，${modelName}在此类任务上表现优秀`;
    }

    if (modelCaps?.quality === 'very_high') {
      reasoning += '，高质量输出';
    }

    if (modelCaps?.cost === 'low') {
      reasoning += '，成本效益高';
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
