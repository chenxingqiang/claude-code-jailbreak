const fs = require('fs');
const path = require('path');

// Comprehensive Chinese to English translations
const translations = {
  // Comments
  '基于Task type的建议': 'Task type-based recommendations',
  '模型': 'model',
  'OpenAI模型': 'OpenAI models',
  'Google模型': 'Google models', 
  'Anthropic模型': 'Anthropic models',
  'Mistral模型': 'Mistral models',
  'Ollama本地模型': 'Ollama local models',
  'Cohere模型': 'Cohere models',
  'providers已经Sort by priority，返回第一个': 'providers already sorted by priority, return first one',
  '按优先级返回第一个启用的提供者': 'Return first enabled provider by priority',
  '如果没有启用的提供者，返回openai作为默认': 'If no enabled providers, return openai as default',
  '提供者': 'provider',
  '健康检查失败': 'health check failed',
  
  // Task detection keywords
  '写代码': 'write code',
  '编程': 'programming',
  '函数': 'function',
  '算法': 'algorithm',
  '代码': 'code',
  '脚本': 'script',
  '调试': 'debug',
  '接口': 'interface',
  '类': 'class',
  '方法': 'method', 
  '变量': 'variable',
  '错误': 'error',
  '正则': 'regex',
  '分析': 'analysis',
  '统计': 'statistics',
  '数据': 'data',
  '报告': 'report',
  '图表': 'chart',
  '趋势': 'trend',
  '对比': 'comparison',
  '解释': 'explanation',
  '说明': 'description',
  '研究': 'research',
  '调查': 'investigation',
  '评估': 'evaluation',
  '比较': 'comparison',
  '创作': 'creation',
  '写作': 'writing',
  '故事': 'story',
  '文章': 'article',
  '诗歌': 'poetry',
  '小说': 'novel',
  '剧本': 'script',
  '想象': 'imagination',
  '创意': 'creativity',
  '设计': 'design',
  '艺术': 'art',
  '灵感': 'inspiration',
  '翻译': 'translation',
  '译': 'translate',
  '英文': 'English',
  '中文': 'Chinese',
  '日文': 'Japanese',
  '韩文': 'Korean',
  '法文': 'French',
  '德文': 'German',
  '语言': 'language',
  '转换': 'conversion',
  '聊天': 'chat',
  '对话': 'conversation',
  '交流': 'communication',
  '讨论': 'discussion',
  '建议': 'suggestion',
  '意见': 'opinion',
  '你好': 'hello',
  '帮助': 'help',
  
  // Error messages
  '消息必须是数组格式': 'Messages must be in array format',
  '无法提取响应内容': 'Unable to extract response content',
  '估算令牌数量（粗略估算：1个令牌约4个字符）': 'Estimate token count (rough estimate: 1 token ≈ 4 characters)',
  '基本的流式响应转换': 'Basic streaming response transformation',
  '流式Response transformation failed': 'Streaming response transformation failed',
  '检查必需字段': 'Check required fields',
  'messages字段是必需的，且必须是数组': 'messages field is required and must be an array',
  'messages数组不能为空': 'messages array cannot be empty',
  '检查消息格式': 'Check message format',
  '缺少role字段': 'missing role field',
  '缺少content字段': 'missing content field',
  '的role字段无效': 'role field is invalid',
  '检查可选参数范围': 'Check optional parameter ranges',
  'max_tokens必须在1-8192之间': 'max_tokens must be between 1-8192',
  'temperature必须在0-2之间': 'temperature must be between 0-2',
  'top_p必须在0-1之间': 'top_p must be between 0-1',
  '从系统消息提取': 'Extract from system messages',
  '从消息数组提取用户内容': 'Extract user content from message array',
  
  // Dynamic config manager
  '从llm-interface包动态获取所有支持的提供者信息': 'Dynamically get all supported provider information from llm-interface package',
  '获取llm-interface支持的所有提供者': 'Get all providers supported by llm-interface',
  '尝试获取每providers的详细信息': 'Try to get detailed information for each provider',
  '确保模型数组不为空，如果为空则使用静态默认值': 'Ensure model array is not empty, use static defaults if empty',
  '获取llm-interface包中所有可用的提供者': 'Get all available providers in llm-interface package',
  '从llm-interface包支持的36providers列表': 'From the list of 36 providers supported by llm-interface package',
  '获取特定提供者的详细信息': 'Get detailed information for specific provider',
  '根据提供者类型返回相应的配置信息': 'Return corresponding configuration information based on provider type',
  '尝试获取支持的模型列表': 'Try to get supported model list',
  '某些提供者可能有API来获取模型列表': 'Some providers may have APIs to get model lists',
  '如果无法动态获取，使用静态列表': 'If unable to get dynamically, use static list',
  '无法获取提供者': 'Unable to get provider',
  '的信息': 'information',
  '获取提供者的静态详细信息': 'Get static detailed information for provider',
  '尝试动态获取提供者支持的模型列表': 'Try to dynamically get model list supported by provider',
  '首先获取静态默认模型列表作为备用': 'First get static default model list as backup',
  '对于某些提供者，我们可以尝试调用其API获取模型列表': 'For some providers, we can try calling their API to get model lists',
  '对于其他提供者，直接返回静态默认模型列表': 'For other providers, directly return static default model list',
  '如果有OpenAI API密钥，尝试获取模型列表': 'If OpenAI API key exists, try to get model list',
  '这里可以调用OpenAI API获取模型列表': 'Here we can call OpenAI API to get model list',
  '为了简化，我们返回常用模型': 'For simplicity, we return common models',
  '无法动态获取OpenAI模型列表，使用默认列表': 'Unable to dynamically get OpenAI model list, using default list',
  '尝试连接本地Ollama服务获取模型列表': 'Try to connect to local Ollama service to get model list',
  '无法连接到本地Ollama服务，using default model列表': 'Unable to connect to local Ollama service, using default model list',
  '检查提供者是否已配置（有API密钥等）': 'Check if provider is configured (has API key, etc.)',
  '本地服务检查': 'local service check',
  '对于Ollama，检查本地服务是否可用': 'For Ollama, check if local service is available',
  '对于LLaMA.CPP，检查本地服务是否可用': 'For LLaMA.CPP, check if local service is available',
  '根据提供者特性计算优先级': 'Calculate priority based on provider characteristics',
  '用户特别配置，最高优先级': 'User specially configured, highest priority',
  '最稳定，但成本较高': 'Most stable, but higher cost',
  '高质量': 'high quality',
  '成本效益好': 'good cost-effectiveness',
  '本地部署，无成本': 'local deployment, no cost',
  '专业API': 'professional API',
  '开源友好': 'open source friendly',
  '高速推理': 'high-speed inference',
  '开源模型': 'open source models',
  '保存配置到文件': 'Save configuration to file',
  '配置已保存到': 'Configuration saved to',
  '保存配置失败': 'Failed to save configuration',
  '获取llm-interface包版本': 'Get llm-interface package version',
  '加载现有配置': 'Load existing configuration',
  '检查是否需要更新配置': 'Check if configuration needs updating',
  '检查配置是否过期（例如，超过24小时）': 'Check if configuration is expired (e.g., over 24 hours)',
  '小时': 'hours',
  '获取当前配置': 'Get current configuration',
  
  // Claude compatibility
  '提取基本参数': 'Extract basic parameters',
  '获取用户输入用于token分析': 'Get user input for token analysis',
  '使用智能token管理器分配最优tokens': 'Use intelligent token manager to allocate optimal tokens',
  '默认优先质量': 'default prioritize quality',
  '记录token分配决策': 'Record token allocation decision',
  '添加token分配信息到元数据': 'Add token allocation information to metadata',
  '添加可选参数': 'Add optional parameters',
  '处理系统消息': 'Process system messages',
  '提取响应内容': 'Extract response content',
  '构建Claude格式响应': 'Build Claude format response',
  '转换响应': 'Transform response',
  '如果没有指定模型，使用默认映射': 'If no model specified, use default mapping',
  '查找模型映射': 'Look up model mapping',
  '如果没有找到映射，using default model': 'If no mapping found, using default model',
  '处理结构化内容': 'Process structured content',
  '处理不同提供者的响应格式': 'Process response formats from different providers'
};

// Function to translate file
function translateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Apply direct translations
  for (const [chinese, english] of Object.entries(translations)) {
    const regex = new RegExp(chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, english);
      changed = true;
    }
  }
  
  // Handle regex patterns in arrays
  const regexPatterns = [
    [/写.*?代码|编写.*?程序/gi, 'write code or program'],
    [/实现.*?功能|开发.*?系统/gi, 'implement functionality or develop system'],
    [/修复.*?bug|解决.*?问题/gi, 'fix bugs or solve problems'],
    [/优化.*?代码|重构.*?代码/gi, 'optimize code or refactor code'],
    [/设计.*?算法|实现.*?算法/gi, 'design algorithms or implement algorithms'],
    [/分析.*?数据|数据.*?分析/gi, 'analyze data or data analysis'],
    [/统计.*?信息|信息.*?统计/gi, 'statistical information or information statistics'],
    [/解释.*?现象|现象.*?解释/gi, 'explain phenomena or phenomenon explanation'],
    [/比较.*?差异|对比.*?结果/gi, 'compare differences or contrast results'],
    [/写.*?故事|创作.*?文章/gi, 'write stories or create articles'],
    [/设计.*?方案|创意.*?想法/gi, 'design solutions or creative ideas'],
    [/写.*?诗歌|创作.*?诗词/gi, 'write poetry or create poems'],
    [/翻译.*?成|译.*?为/gi, 'translate to'],
    [/转换.*?语言|语言.*?转换/gi, 'language conversion'],
    [/你好|hello|hi/gi, 'hello'],
    [/帮助.*?我|我.*?需要/gi, 'help me or I need'],
    [/建议.*?一下|给.*?建议/gi, 'give suggestions'],
    [/消息(\d+)/g, 'message $1']
  ];
  
  for (const [pattern, replacement] of regexPatterns) {
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

// Translate all JS files in src directory
const srcDir = 'src';
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.js')) {
      translateFile(fullPath);
    }
  }
}

console.log('🌐 Starting comprehensive Chinese to English translation...\n');
walkDir(srcDir);
console.log('\n✅ Comprehensive translation completed!');
