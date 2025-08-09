const { v4: uuidv4 } = require('uuid');
const TokenManager = require('./token-manager');

class ClaudeCompatibility {
  constructor() {
    this.modelMappings = this.initializeModelMappings();
    this.tokenManager = new TokenManager();
  }

  /**
   * Initialize model mapping configuration
   */
  initializeModelMappings() {
    return {
      'claude-3-sonnet': {
        'openai': 'gpt-4',
        'google': 'gemini-pro',
        'ollama': 'llama2:13b',
        'cohere': 'command-r-plus',
        'mistral': 'mistral-large',
        'groq': 'llama2-70b-4096',
        'anthropic': 'claude-3-sonnet'
      },
      'claude-3-haiku': {
        'openai': 'gpt-3.5-turbo',
        'google': 'gemini-flash',
        'ollama': 'llama2:7b',
        'cohere': 'command',
        'mistral': 'mistral-small',
        'groq': 'mixtral-8x7b-32768',
        'anthropic': 'claude-3-haiku'
      },
      'claude-3-opus': {
        'openai': 'gpt-4-turbo',
        'google': 'gemini-ultra',
        'ollama': 'codellama',
        'cohere': 'command-r-plus',
        'mistral': 'mistral-large',
        'groq': 'llama2-70b-4096',
        'anthropic': 'claude-3-opus'
      }
    };
  }

  /**
   * Convert Claude format request to llm-interface format
   */
  toLLMInterface(claudeRequest, provider, selectedModel = null, taskType = 'conversation', taskComplexity = 'medium') {
    try {
      // 提取基本参数  
      const model = selectedModel || this.mapClaudeModel(claudeRequest.model, provider);
      const messages = this.convertMessages(claudeRequest.messages || []);
      
      // 获取用户输入用于token分析
      const userInput = this.extractUserInput(claudeRequest);
      
      // 使用智能token管理器分配最优tokens
      const requestedTokens = claudeRequest.max_tokens || 1000;
      const tokenAllocation = this.tokenManager.allocateTokens(
        requestedTokens,
        provider,
        model,
        taskType,
        taskComplexity,
        userInput,
        {
          prioritizeCost: claudeRequest.prioritize_cost || false,
          prioritizeQuality: claudeRequest.prioritize_quality !== false, // 默认优先质量
          prioritizeSpeed: claudeRequest.prioritize_speed || false
        }
      );
      
      // 记录token分配决策
      if (tokenAllocation.success) {
        console.log(`🧠 智能Token分配: ${requestedTokens} → ${tokenAllocation.tokens} (${tokenAllocation.allocation.strategy})`);
        if (tokenAllocation.report && tokenAllocation.report.summary.change !== 0) {
          console.log(`📊 Token调整: ${tokenAllocation.report.summary.changePercent}% (${tokenAllocation.report.summary.change > 0 ? '+' : ''}${tokenAllocation.report.summary.change})`);
        }
      } else {
        console.warn(`⚠️  Token分配失败，使用默认值: ${tokenAllocation.tokens}`);
      }
      
      const llmRequest = {
        model: model,
        messages: messages,
        max_tokens: tokenAllocation.tokens,
        temperature: claudeRequest.temperature || 0.7,
        stream: claudeRequest.stream || false,
        // 添加token分配信息到元数据
        _tokenAllocation: tokenAllocation
      };

      // 添加可选参数
      if (claudeRequest.top_p !== undefined) {
        llmRequest.top_p = claudeRequest.top_p;
      }

      if (claudeRequest.stop_sequences && claudeRequest.stop_sequences.length > 0) {
        llmRequest.stop = claudeRequest.stop_sequences;
      }

      // 处理系统消息
      if (claudeRequest.system) {
        llmRequest.messages.unshift({
          role: 'system',
          content: claudeRequest.system
        });
      }

      console.log(`🔄 Transforming request: Claude -> ${provider} (${model})`);
      return llmRequest;

    } catch (error) {
      console.error('❌ Request transformation failed: ', error);
      throw new Error(`Request transformation failed: ${error.message}`);
    }
  }

  /**
   * Convert llm-interface response to Claude format
   */
  toClaudeFormat(llmResponse, provider, requestId = null) {
    try {
      // 提取响应内容
      const content = this.extractContent(llmResponse);
      const usage = this.extractUsage(llmResponse);

      // 构建Claude格式响应
      const claudeResponse = {
        id: requestId || `msg_${uuidv4()}`,
        type: "message",
        role: "assistant",
        content: [
          {
            type: "text",
            text: content
          }
        ],
        model: llmResponse.model || `${provider}-model`,
        stop_reason: this.mapStopReason(llmResponse),
        stop_sequence: null,
        usage: {
          input_tokens: usage.input_tokens || 0,
          output_tokens: usage.output_tokens || 0
        }
      };

      console.log(`🔄 转换响应: ${provider} -> Claude`);
      return claudeResponse;

    } catch (error) {
      console.error('❌ Response transformation failed: ', error);
      throw new Error(`Response transformation failed: ${error.message}`);
    }
  }

  /**
   * Map Claude model to provider-specific model
   */
  mapClaudeModel(claudeModel, provider) {
    // 如果没有指定模型，使用默认映射
    if (!claudeModel) {
      claudeModel = 'claude-3-sonnet';
    }

    // 查找模型映射
    const mapping = this.modelMappings[claudeModel];
    if (mapping && mapping[provider]) {
      return mapping[provider];
    }

    // 如果没有找到映射，使用默认模型
    const defaultModels = {
      'openai': 'gpt-3.5-turbo',
      'google': 'gemini-pro',
      'ollama': 'llama2',
      'cohere': 'command',
      'mistral': 'mistral-small',
      'groq': 'mixtral-8x7b-32768',
      'anthropic': 'claude-3-haiku',
      'huggingface': 'microsoft/DialoGPT-medium',
      'deepseek': 'deepseek-chat'
    };

    return defaultModels[provider] || 'gpt-3.5-turbo';
  }

  /**
   * Convert message format
   */
  convertMessages(messages) {
    if (!Array.isArray(messages)) {
      throw new Error('消息必须是数组格式');
    }

    return messages.map(message => {
      if (typeof message.content === 'string') {
        return {
          role: message.role,
          content: message.content
        };
      }

      // 处理结构化内容
      if (Array.isArray(message.content)) {
        const textContent = message.content
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join('\n');

        return {
          role: message.role,
          content: textContent
        };
      }

      return {
        role: message.role,
        content: message.content?.text || ''
      };
    });
  }

  /**
   * Extract content from llm-interface response
   */
  extractContent(response) {
    // 处理不同提供者的响应格式
    if (response.results) {
      return response.results;
    }

    if (response.content) {
      return response.content;
    }

    if (response.message) {
      return response.message;
    }

    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message?.content || response.choices[0].text || '';
    }

    if (response.text) {
      return response.text;
    }

    if (response.response) {
      return response.response;
    }

    return '无法提取响应内容';
  }

  /**
   * Extract usage from llm-interface response
   */
  extractUsage(response) {
    const defaultUsage = { input_tokens: 0, output_tokens: 0 };

    if (response.usage) {
      return {
        input_tokens: response.usage.prompt_tokens || response.usage.input_tokens || 0,
        output_tokens: response.usage.completion_tokens || response.usage.output_tokens || 0
      };
    }

    // 估算令牌数量（粗略估算：1个令牌约4个字符）
    if (response.results || response.content || response.message) {
      const content = this.extractContent(response);
      const estimatedTokens = Math.ceil(content.length / 4);
      return {
        input_tokens: 0,
        output_tokens: estimatedTokens
      };
    }

    return defaultUsage;
  }

  /**
   * Map stop reason
   */
  mapStopReason(response) {
    if (response.finish_reason) {
      const reasonMap = {
        'stop': 'end_turn',
        'length': 'max_tokens',
        'content_filter': 'stop_sequence',
        'function_call': 'tool_use'
      };
      return reasonMap[response.finish_reason] || 'end_turn';
    }

    if (response.stop_reason) {
      return response.stop_reason;
    }

    return 'end_turn';
  }

  /**
   * Handle streaming response conversion
   */
  convertStreamResponse(chunk, provider) {
    try {
      // 基本的流式响应转换
      const claudeChunk = {
        type: 'content_block_delta',
        index: 0,
        delta: {
          type: 'text_delta',
          text: this.extractStreamContent(chunk)
        }
      };

      return `data: ${JSON.stringify(claudeChunk)}\n\n`;

    } catch (error) {
      console.error('❌ 流式Response transformation failed: ', error);
      return `data: {"type": "error", "error": "${error.message}"}\n\n`;
    }
  }

  /**
   * Extract content from streaming response chunk
   */
  extractStreamContent(chunk) {
    if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta) {
      return chunk.choices[0].delta.content || '';
    }

    if (chunk.content) {
      return chunk.content;
    }

    if (chunk.text) {
      return chunk.text;
    }

    return '';
  }

  /**
   * Validate Claude request format
   */
  validateClaudeRequest(request) {
    const errors = [];

    // 检查必需字段
    if (!request.messages || !Array.isArray(request.messages)) {
      errors.push('messages字段是必需的，且必须是数组');
    }

    if (request.messages && request.messages.length === 0) {
      errors.push('messages数组不能为空');
    }

    // 检查消息格式
    if (request.messages) {
      request.messages.forEach((message, index) => {
        if (!message.role) {
          errors.push(`消息${index}缺少role字段`);
        }

        if (!message.content) {
          errors.push(`消息${index}缺少content字段`);
        }

        if (message.role && !['user', 'assistant', 'system'].includes(message.role)) {
          errors.push(`消息${index}的role字段无效: ${message.role}`);
        }
      });
    }

    // 检查可选参数范围
    if (request.max_tokens && (request.max_tokens < 1 || request.max_tokens > 8192)) {
      errors.push('max_tokens必须在1-8192之间');
    }

    if (request.temperature && (request.temperature < 0 || request.temperature > 2)) {
      errors.push('temperature必须在0-2之间');
    }

    if (request.top_p && (request.top_p < 0 || request.top_p > 1)) {
      errors.push('top_p必须在0-1之间');
    }

    return errors;
  }

  /**
   * Get supported Claude model list
   */
  getSupportedClaudeModels() {
    return Object.keys(this.modelMappings);
  }

  /**
   * Get model mapping for specific provider
   */
  getProviderModels(provider) {
    const models = {};
    for (const [claudeModel, mapping] of Object.entries(this.modelMappings)) {
      if (mapping[provider]) {
        models[claudeModel] = mapping[provider];
      }
    }
    return models;
  }

  /**
   * Extract user input content for token analysis
   */
  extractUserInput(claudeRequest) {
    let userContent = '';
    
    // 从系统消息提取
    if (claudeRequest.system) {
      userContent += claudeRequest.system + ' ';
    }
    
    // 从消息数组提取用户内容
    if (claudeRequest.messages && Array.isArray(claudeRequest.messages)) {
      claudeRequest.messages.forEach(message => {
        if (message.role === 'user') {
          if (typeof message.content === 'string') {
            userContent += message.content + ' ';
          } else if (Array.isArray(message.content)) {
            message.content.forEach(item => {
              if (item.type === 'text' && item.text) {
                userContent += item.text + ' ';
              }
            });
          }
        }
      });
    }
    
    return userContent.trim();
  }

  /**
   * Get token allocation report for a request
   */
  getTokenAllocationReport(claudeRequest, provider, model, taskType = 'conversation', taskComplexity = 'medium') {
    const userInput = this.extractUserInput(claudeRequest);
    const requestedTokens = claudeRequest.max_tokens || 1000;
    
    return this.tokenManager.allocateTokens(
      requestedTokens,
      provider,
      model,
      taskType,
      taskComplexity,
      userInput,
      {
        prioritizeCost: claudeRequest.prioritize_cost || false,
        prioritizeQuality: claudeRequest.prioritize_quality !== false,
        prioritizeSpeed: claudeRequest.prioritize_speed || false
      }
    );
  }

  /**
   * Get provider token limits
   */
  getProviderTokenLimits(provider, model = null) {
    return this.tokenManager.getProviderLimits(provider, model);
  }

  /**
   * Validate max_tokens against provider limits
   */
  validateMaxTokens(maxTokens, provider, model) {
    const limits = this.tokenManager.getProviderLimits(provider, model);
    
    if (maxTokens < limits.min) {
      return { valid: false, error: `max_tokens must be at least ${limits.min}`, suggestion: limits.min };
    }
    
    if (maxTokens > limits.max) {
      return { valid: false, error: `max_tokens cannot exceed ${limits.max}`, suggestion: limits.max };
    }
    
    return { valid: true };
  }
}

module.exports = ClaudeCompatibility;
