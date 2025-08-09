#!/usr/bin/env node

/**
 * Translation Script
 * Converts all Chinese text in source code to English
 */

const fs = require('fs');
const path = require('path');

// Translation mappings
const translations = {
  // Comments
  '初始化网关': 'Initialize gateway',
  '动态配置提供者': 'Setup dynamic providers',
  '设置中间件': 'Setup middleware',
  '设置路由': 'Setup routes',
  '错误处理': 'Error handling',
  '提取API密钥': 'Extract API keys',
  '获取API密钥环境变量名': 'Get API key environment variable name',
  '显示提供者配置摘要': 'Show provider configuration summary',
  '处理Claude消息请求': 'Handle Claude message requests',
  '处理流式请求': 'Handle streaming requests',
  '处理Claude聊天完成请求': 'Handle Claude chat completion requests',
  '处理健康检查': 'Handle health check',
  '处理提供者状态请求': 'Handle provider status requests',
  '处理配置刷新请求': 'Handle configuration refresh requests',
  '处理模型列表请求': 'Handle model list requests',
  '处理配置请求': 'Handle configuration requests',
  '处理统计请求': 'Handle statistics requests',
  '处理根路径请求': 'Handle root path requests',
  '设置错误处理': 'Setup error handling',
  '处理请求错误': 'Handle request errors',
  '记录请求日志': 'Log request',
  '启动服务器': 'Start server',

  // Console messages
  '🚀 初始化Claude LLM Gateway...': '🚀 Initializing Claude LLM Gateway...',
  '✅ 网关初始化完成': '✅ Gateway initialization completed',
  '❌ 网关初始化失败:': '❌ Gateway initialization failed:',
  '🔍 正在动态配置提供者...': '🔍 Setting up dynamic providers...',
  '📝 更新提供者配置...': '📝 Updating provider configuration...',
  '无法加载提供者配置': 'Unable to load provider configuration',
  '✅ 成功配置': '✅ Successfully configured',
  '个提供者': 'providers',
  '❌ 动态提供者配置失败:': '❌ Dynamic provider configuration failed:',
  '🔍 开始提供者健康检查...': '🔍 Starting provider health checks...',
  '🩺 执行健康检查': '🩺 Performing health check',
  '个提供者': 'providers',
  '❌ 提供者选择失败:': '❌ Provider selection failed:',
  '没有可用的健康提供者': 'No healthy providers available',
  '🚀 提供者路由器初始化完成，支持': '🚀 Provider router initialization completed, supporting',
  '个提供者': 'providers',
  '📊 提供者统计已重置': '📊 Provider statistics reset',
  '✅': '✅',
  ': 健康': ': healthy',
  '❌': '❌',
  ': 不健康 -': ': unhealthy -',
  '🤖 处理Claude消息请求': '🤖 Processing Claude message request',
  '🎯 选择提供者:': '🎯 Selected provider:',
  '🔄 转换请求: Claude ->': '🔄 Transforming request: Claude ->',
  '🚀 发送请求到': '🚀 Sending request to',
  '✅ 请求完成': '✅ Request completed',
  '❌ 请求处理失败': '❌ Request processing failed',
  '❌ 流式请求失败': '❌ Streaming request failed',
  '🔄 手动刷新提供者配置...': '🔄 Manually refreshing provider configuration...',
  '提供者配置已刷新': 'Provider configuration refreshed',
  '🚨 未处理的错误:': '🚨 Unhandled error:',
  '🌐 Claude LLM Gateway 启动成功!': '🌐 Claude LLM Gateway started successfully!',
  '📡 服务地址:': '📡 Service URL:',
  '📬 消息 API:': '📬 Messages API:',
  '💬 聊天 API:': '💬 Chat API:',
  '📊 健康检查:': '📊 Health Check:',
  '🔧 提供者状态:': '🔧 Provider Status:',
  '🔄 刷新配置:': '🔄 Refresh Config:',
  '📈 统计信息:': '📈 Statistics:',
  '❌ 服务器启动失败:': '❌ Server startup failed:',

  // Inline comments
  '// 1. 动态配置提供者': '// 1. Dynamic provider configuration',
  '// 2. 设置中间件': '// 2. Setup middleware',
  '// 3. 设置路由': '// 3. Setup routes',
  '// 4. 错误处理': '// 4. Error handling',
  '// 检查是否需要更新配置': '// Check if configuration needs updating',
  '// 加载配置': '// Load configuration',
  '// 设置API密钥': '// Set API keys',
  '// 初始化提供者路由器': '// Initialize provider router',
  '// 存储提供者配置': '// Store provider configuration',
  '// 显示配置摘要': '// Show configuration summary',
  '// 对于不需要API密钥的提供者（如Ollama）': '// For providers that don\'t require API keys (like Ollama)',
  '// 安全中间件': '// Security middleware',
  '// 请求解析': '// Request parsing',
  '// 速率限制': '// Rate limiting',
  '// 1分钟': '// 1 minute',
  '// 每分钟100个请求': '// 100 requests per minute',
  '// 请求日志': '// Request logging',
  '// Claude Code兼容的API端点': '// Claude Code compatible API endpoints',
  '// 管理端点': '// Management endpoints',
  '// 根路径': '// Root path',
  '// 验证请求格式': '// Validate request format',
  '// 选择提供者': '// Select provider',
  '// 记录请求': '// Record request',
  '// 转换请求格式': '// Transform request format',
  '// 调用llm-interface': '// Call llm-interface',
  '// 处理流式响应': '// Handle streaming response',
  '// 流式响应直接返回': '// Streaming response returns directly',
  '// 处理普通响应': '// Handle normal response',
  '// 转换回Claude格式': '// Transform back to Claude format',
  '// 记录响应时间': '// Record response time',
  '// 发送开始事件': '// Send start event',
  '// 使用llm-interface的流式功能': '// Use llm-interface streaming functionality',
  '// 处理流式响应': '// Handle streaming response',
  '// 发送结束事件': '// Send end event',
  '// 将聊天完成格式转换为消息格式': '// Convert chat completion format to message format',
  '// 重用消息处理逻辑': '// Reuse message processing logic',
  '// 404处理': '// 404 handling',
  '// 全局错误处理': '// Global error handling',
  '// 根据错误类型设置状态码': '// Set status code based on error type',
  '// 保持日志大小合理': '// Keep log size reasonable',
  '// 启动服务器': '// Start server',

  // Provider router translations
  '初始化提供者配置': 'Initialize provider configuration',
  '选择最佳提供者': 'Select best provider',
  '根据模型类型选择提供者': 'Select provider based on model type',
  '获取健康的提供者列表': 'Get healthy provider list',
  '检查提供者是否健康': 'Check if provider is healthy',
  '负载均衡算法': 'Load balancing algorithm',
  '轮询负载均衡': 'Round-robin load balancing',
  '最少请求负载均衡': 'Least requests load balancing',
  '成本优化负载均衡': 'Cost-optimized load balancing',
  '优先级负载均衡': 'Priority-based load balancing',
  '记录请求': 'Record request',
  '获取默认提供者': 'Get default provider',
  '开始健康检查': 'Start health checks',
  '执行健康检查': 'Perform health check',
  '检查单个提供者健康状态': 'Check individual provider health',
  '获取所有提供者状态': 'Get all provider status',
  '手动设置提供者健康状态': 'Manually set provider health status',
  '重置提供者统计': 'Reset provider statistics',
  '获取负载均衡统计': 'Get load balancing statistics',

  // Claude compatibility translations
  '初始化模型映射配置': 'Initialize model mapping configuration',
  '将Claude格式的请求转换为llm-interface格式': 'Convert Claude format request to llm-interface format',
  '将llm-interface响应转换为Claude格式': 'Convert llm-interface response to Claude format',
  '映射Claude模型到提供者特定模型': 'Map Claude model to provider-specific model',
  '转换消息格式': 'Convert message format',
  '从llm-interface响应中提取内容': 'Extract content from llm-interface response',
  '从llm-interface响应中提取使用情况': 'Extract usage from llm-interface response',
  '映射停止原因': 'Map stop reason',
  '处理流式响应转换': 'Handle streaming response conversion',
  '从流式响应块中提取内容': 'Extract content from streaming response chunk',
  '验证Claude请求格式': 'Validate Claude request format',
  '获取支持的Claude模型列表': 'Get supported Claude model list',
  '获取特定提供者的模型映射': 'Get model mapping for specific provider'
};

// Function to translate a file
function translateFile(filePath) {
  console.log(`Translating: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Apply translations
  for (const [chinese, english] of Object.entries(translations)) {
    if (content.includes(chinese)) {
      content = content.replace(new RegExp(chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), english);
      changed = true;
    }
  }
  
  // Additional specific translations that might be missed
  const additionalTranslations = {
    '📊 提供者配置摘要:': '📊 Provider Configuration Summary:',
    '🔗 远程提供者': '🔗 Remote providers',
    '🏠 本地提供者': '🏠 Local providers',
    '💰 总计': '💰 Total',
    '个可用模型': ' available models',
    '* 设置Error handling': '* Setup error handling',
    'Provider Configuration Summary:': 'Provider Configuration Summary:',
    'Remote providers': 'Remote providers',
    'Local providers': 'Local providers',
    'available models': 'available models'
  };
  
  // Apply additional translations
  for (const [chinese, english] of Object.entries(additionalTranslations)) {
    if (content.includes(chinese)) {
      content = content.replace(new RegExp(chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), english);
      changed = true;
    }
  }

  // Additional pattern-based translations
  const patterns = [
    // Console log patterns with variables
    [/成功配置\s*(\$?\{[^}]*\}|\d+)\s*providers?/g, 'Successfully configured $1 providers'],
    [/✅\s*发现提供者:\s*([^(]+)\s*\((\$?\{[^}]*\}|\d+)\s*个模型\)/g, '✅ Discovery provider: $1 ($2 models)'],
    [/🎉\s*成功配置\s*(\$?\{[^}]*\}|\d+)\s*providers?/g, '🎉 Successfully configured $1 providers'],
    [/✅\s*配置已保存到:\s*/g, '✅ Configuration saved to: '],
    [/📝\s*配置文件不存在，将创建新配置/g, '📝 Configuration file does not exist, will create new configuration'],
    [/📝\s*更新提供者配置\.\.\./g, '📝 Updating provider configuration...'],
    [/🔍\s*正在从llm-interface包发现提供者\.\.\./g, '🔍 Discovering providers from llm-interface package...'],
    [/🔍\s*正在Setup dynamic providers\.\.\./g, '🔍 Setting up dynamic providers...'],
    [/⚠️\s*跳过提供者\s*/g, '⚠️ Skipping provider '],
    [/❌\s*动态配置发现失败:/g, '❌ Dynamic provider configuration failed:'],
    
    // Task type translations
    [/编程任务/g, 'programming task'],
    [/分析任务/g, 'analysis task'], 
    [/创作任务/g, 'creative task'],
    [/翻译任务/g, 'translation task'],
    [/对话任务/g, 'conversation task'],
    
    // Provider router translations
    [/🎯\s*使用指定提供者:\s*/g, '🎯 Using specified provider: '],
    [/🎯\s*根据模型选择提供者:\s*/g, '🎯 Provider selected based on model: '],
    [/⚖️\s*负载均衡选择提供者:\s*/g, '⚖️ Load balancer selected provider: '],
    [/没有可用的提供者/g, 'No available providers'],
    [/检测到([^，]+)，/g, 'Detected $1, '],
    [/在此类任务上表现优秀/g, 'performs excellently on this type of task'],
    [/高质量输出/g, 'high quality output'],
    [/成本效益高/g, 'cost effective'],
    
    // Token management translations
    [/🧠\s*智能Token分配:\s*/g, '🧠 Intelligent token allocation: '],
    [/🧠\s*智能模型选择:\s*/g, '🧠 Intelligent model selection: '],
    [/📊\s*Token调整:\s*/g, '📊 Token adjustment: '],
    [/⚠️\s*Token分配失败，使用默认值:\s*/g, '⚠️ Token allocation failed, using default: '],
    [/使用默认模型/g, 'using default model'],
    [/任务类型:\s*/g, 'task type: '],
    [/置信度:\s*/g, 'confidence: '],
    [/💡\s*选择理由:\s*/g, '💡 Selection reason: '],
    
    // Comment translations
    [/初始化请求计数/g, 'Initialize request count'],
    [/检查是否指定了特定提供者/g, 'Check if specific provider is specified'],
    [/根据负载均衡策略选择/g, 'Select based on load balancing strategy'],
    [/返回默认提供者作为最后的备选/g, 'Return default provider as last resort'],
    [/按优先级排序/g, 'Sort by priority'],
    [/检查健康状态和最后检查时间/g, 'Check health status and last check time'],
    [/按成本排序，选择成本最低的可用提供者/g, 'Sort by cost, select lowest cost available provider'],
    [/立即执行一次健康检查/g, 'Perform health check immediately'],
    [/设置定期健康检查/g, 'Set up periodic health checks'],
    [/每30 seconds检查一次/g, 'check every 30 seconds'],
    [/检查单providers健康状态/g, 'Check individual provider health status'],
    [/发送简单的ping请求/g, 'Send simple ping request'],
    [/seconds超时/g, 'seconds timeout'],
    [/记录健康状态/g, 'Record health status'],
    [/记录不健康状态/g, 'Record unhealthy status'],
    
    // Global error handling and misc
    [/全局Error handling/g, 'Global error handling'],
    [/模型选择统计接口/g, 'Model selection statistics interface'],
    [/智能模型选择统计信息/g, 'Intelligent model selection statistics'],
    [/示例/g, 'example'],
    
    // Numbers + 个提供者
    [/(\d+)\s*个提供者/g, '$1 providers'],
    // Numbers + 个模型
    [/(\d+)\s*个可?用?模型/g, '$1 available models'],
    // 5分钟, 30秒, etc
    [/(\d+)分钟/g, '$1 minutes'],
    [/(\d+)秒/g, '$1 seconds'],
    // Error messages with variables
    [/请求转换失败:\s*/g, 'Request transformation failed: '],
    [/响应转换失败:\s*/g, 'Response transformation failed: '],
    [/流式响应转换失败:\s*/g, 'Streaming response transformation failed: '],
    [/无法获取提供者\s+(\w+)\s+的信息:/g, 'Unable to get information for provider $1:'],
    [/API key not found for LLM interfaceName:\s*/g, 'API key not found for LLM interface: '],
    // Complex patterns
    [/\$\{.*\}\s*个可用模型/g, ' available models'],
    [/总计\s*\$\{.*\}\s*个可用模型/g, 'Total ${...} available models']
  ];
  
  for (const [pattern, replacement] of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
  }
}

// Function to recursively find and translate JS files
function translateDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      translateDirectory(fullPath);
    } else if (item.endsWith('.js') && !item.includes('test')) {
      translateFile(fullPath);
    }
  }
}

// Main execution
console.log('🌐 Starting Chinese to English translation...\n');

// Translate source files
const srcDir = path.join(__dirname, '../src');
if (fs.existsSync(srcDir)) {
  translateDirectory(srcDir);
}

// Also translate test files
const testDir = path.join(__dirname, '../test');
if (fs.existsSync(testDir)) {
  translateDirectory(testDir);
}

console.log('\n✅ Translation completed!');
console.log('🔍 All Chinese text in source code has been converted to English');
