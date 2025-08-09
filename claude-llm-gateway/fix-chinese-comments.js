const fs = require('fs');

// Read token-manager.js
const filePath = 'src/token-manager.js';
let content = fs.readFileSync(filePath, 'utf8');

// Specific translations for remaining Chinese text
const translations = {
  '初始化各提供商的token限制': 'Initialize token limits for various providers',
  'OpenAI 系列': 'OpenAI series',
  'DeepSeek 系列': 'DeepSeek series', 
  'Anthropic Claude 系列': 'Anthropic Claude series',
  'Google Gemini 系列': 'Google Gemini series',
  'Groq 系列': 'Groq series',
  'Cohere 系列': 'Cohere series',
  'Mistral 系列': 'Mistral series',
  'Ollama 本地模型 (通常限制较低)': 'Ollama local models (typically lower limits)',
  '默认限制（未知提供商）': 'Default limits (unknown providers)',
  '根据任务类型初始化推荐token数量': 'Initialize recommended token amounts based on task types',
  '智能分配tokens - 核心方法': 'Intelligent token allocation - core method',
  'Claude Code请求的tokens': 'Tokens requested by Claude Code',
  '提供商名称': 'Provider name',
  '模型名称': 'Model name',
  '任务类型': 'Task type',
  '任务复杂度': 'Task complexity',
  '用户输入内容': 'User input content',
  '配置选项': 'Configuration options',
  '优化后的token配置': 'Optimized token configuration',
  '获取提供商和模型限制': 'Get provider and model limits',
  '获取任务类型推荐': 'Get task type recommendations',
  '计算输入tokens（估算）': 'Calculate input tokens (estimate)',
  '智能分配算法': 'Intelligent allocation algorithm',
  '验证和调整': 'Validate and adjust',
  '生成详细报告': 'Generate detailed report',
  '估算输入tokens数量': 'Estimate input token count',
  '简单估算：英文约4个字符=1token，中文约1.5个字符=1token': 'Simple estimate: English ~4 chars=1token, Chinese ~1.5 chars=1token',
  '计算最优tokens分配': 'Calculate optimal token allocation',
  '基础分配策略': 'Basic allocation strategy',
  '策略1: 成本优先': 'Strategy 1: Cost priority',
  '策略2: 质量优先': 'Strategy 2: Quality priority',
  '策略3: 速度优先': 'Strategy 3: Speed priority',
  '留20%余量': 'Leave 20% margin',
  '考虑输入长度调整': 'Consider input length adjustment',
  '留100tokens余量': 'Leave 100 tokens margin',
  '智能调整算法': 'Intelligent adjustment algorithm',
  '计算调整因子': 'Calculate adjustment factor',
  '基于模型能力和任务复杂度的动态调整': 'Dynamic adjustment based on model capability and task complexity',
  '标准化到8k基准': 'Normalized to 8k baseline',
  '标准化到4k基准': 'Normalized to 4k baseline',
  '确定分配策略': 'Determine allocation strategy',
  '验证和调整最终tokens': 'Validate and adjust final tokens',
  '确保在模型限制范围内': 'Ensure within model limits',
  '特殊调整规则': 'Special adjustment rules',
  '生成分配报告': 'Generate allocation report',
  '计算成本估算': 'Calculate cost estimate',
  '生成优化建议': 'Generate optimization recommendations',
  '基于使用率的建议': 'Usage-based recommendations',
  '当前token分配较保守，可考虑增加以获得更好的输出质量': 'Current token allocation is conservative, consider increasing for better output quality',
  '接近模型token限制，建议分段处理复杂任务': 'Approaching model token limit, suggest processing complex tasks in segments',
  '基于成本的建议': 'Cost-based recommendations',
  '当前模型成本较高，可考虑使用更经济的替代模型': 'Current model has high cost, consider using more economical alternative models',
  '基于任务类型的建议': 'Task type-based recommendations',
  'programming task建议使用更多tokens以获得完整的代码实现': 'Programming tasks recommend using more tokens for complete code implementation',
  '获取提供商的token限制信息': 'Get provider token limit information',
  '批量处理token分配（用于多个请求）': 'Batch process token allocation (for multiple requests)',
  '获取token使用统计': 'Get token usage statistics',
  '排除default': 'Exclude default',
  '计算平均最优tokens': 'Calculate average optimal tokens',
  '计算成本范围': 'Calculate cost range'
};

// Apply translations
for (const [chinese, english] of Object.entries(translations)) {
  content = content.replace(new RegExp(chinese, 'g'), english);
}

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed Chinese comments in token-manager.js');
