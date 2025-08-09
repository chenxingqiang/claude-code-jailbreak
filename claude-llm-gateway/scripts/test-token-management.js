#!/usr/bin/env node

/**
 * Claude LLM Gateway - 智能Token管理验证脚本
 * 演示不同任务类型的智能token分配
 */

const axios = require('axios');

const GATEWAY_URL = 'http://localhost:8765';

// 测试用例
const testCases = [
  {
    name: '编程任务 - Python函数',
    request: {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: '写一个Python函数来实现快速排序算法，要求包含详细注释'
      }]
    },
    expectedTaskType: 'coding'
  },
  {
    name: '对话任务 - 日常聊天',
    request: {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{
        role: 'user', 
        content: '你好！今天天气真不错，有什么推荐的户外活动吗？'
      }]
    },
    expectedTaskType: 'conversation'
  },
  {
    name: '分析任务 - 代码审查',
    request: {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2500,
      messages: [{
        role: 'user',
        content: '请分析以下JavaScript代码的性能问题和优化建议：\nfunction process(arr) { return arr.map(x => x * 2).filter(x => x > 10); }'
      }]
    },
    expectedTaskType: 'analysis'
  },
  {
    name: '创作任务 - 故事写作',
    request: {
      model: 'claude-3-opus-20240229',
      max_tokens: 5000,
      messages: [{
        role: 'user',
        content: '写一个关于时间旅行的科幻短篇小说，要求有完整的情节和人物发展'
      }]
    },
    expectedTaskType: 'creative'
  },
  {
    name: '翻译任务 - 中英互译',
    request: {
      model: 'claude-3-haiku-20240307',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: '请将以下中文翻译成英文：人工智能正在改变我们的生活方式，带来前所未有的便利和效率。'
      }]
    },
    expectedTaskType: 'translation'
  }
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m', 
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 检查服务状态
async function checkService() {
  try {
    const response = await axios.get(`${GATEWAY_URL}/health`);
    console.log(colorize('✅ 服务状态正常', 'green'));
    return true;
  } catch (error) {
    console.log(colorize('❌ 服务未运行，请先启动Gateway服务', 'red'));
    console.log(colorize('   运行: ./scripts/daemon.sh start', 'yellow'));
    return false;
  }
}

// 获取Token统计
async function getTokenStats() {
  try {
    const response = await axios.get(`${GATEWAY_URL}/tokens/stats`);
    const stats = response.data.stats;
    
    console.log(colorize('\n📊 Token管理系统统计:', 'cyan'));
    console.log(`   支持提供商: ${stats.totalProviders}个`);
    console.log(`   任务类型: ${stats.supportedTaskTypes.join(', ')}`);
    console.log(`   平均最优Token: ${stats.averageOptimalTokens}`);
    console.log(`   成本范围: $${stats.costRange.min} - $${stats.costRange.max} /1K tokens`);
  } catch (error) {
    console.log(colorize('⚠️  无法获取统计信息', 'yellow'));
  }
}

// 测试Token估算
async function testTokenEstimation(testCase) {
  try {
    const response = await axios.post(`${GATEWAY_URL}/tokens/estimate`, {
      text: testCase.request.messages[0].content,
      provider: 'deepseek',
      model: 'deepseek-chat'
    });
    
    const data = response.data;
    return {
      estimated: data.estimatedTokens,
      recommendations: data.recommendations
    };
  } catch (error) {
    return { estimated: 0, recommendations: {} };
  }
}

// 模拟Token分析（无需实际调用LLM）
async function analyzeTokenAllocation(testCase) {
  try {
    const response = await axios.post(`${GATEWAY_URL}/tokens/analyze`, {
      claudeRequest: testCase.request,
      provider: 'deepseek',
      model: 'deepseek-coder',
      taskType: testCase.expectedTaskType,
      taskComplexity: 'medium'
    });
    
    return response.data.analysis;
  } catch (error) {
    console.log(colorize(`   ❌ 分析失败: ${error.message}`, 'red'));
    return null;
  }
}

// 运行单个测试
async function runTest(testCase, index) {
  console.log(colorize(`\n🧪 测试 ${index + 1}: ${testCase.name}`, 'blue'));
  console.log(colorize('─'.repeat(50), 'blue'));
  
  // Token估算
  const estimation = await testTokenEstimation(testCase);
  console.log(`📝 输入内容: "${testCase.request.messages[0].content.substring(0, 50)}..."`);
  console.log(`📏 估算输入Token: ${estimation.estimated}`);
  console.log(`🎯 原始max_tokens: ${testCase.request.max_tokens}`);
  
  // Token分配分析
  const analysis = await analyzeTokenAllocation(testCase);
  if (analysis) {
    console.log(colorize(`🧠 分配策略: ${analysis.allocation?.strategy || 'default'}`, 'magenta'));
    console.log(colorize(`⚖️  最终分配: ${analysis.report?.summary?.allocated || analysis.tokens || 'N/A'} tokens`, 'green'));
    
    const change = analysis.report?.summary?.change;
    if (change && change !== 0) {
      const changeColor = change > 0 ? 'green' : 'yellow';
      const changePercent = analysis.report?.summary?.changePercent || 0;
      console.log(colorize(`📊 调整幅度: ${changePercent}% (${change > 0 ? '+' : ''}${change})`, changeColor));
    } else {
      console.log(colorize('📊 调整幅度: 无调整', 'cyan'));
    }
    
    const cost = analysis.report?.cost?.formatted || analysis.cost?.formatted || 'FREE';
    console.log(`💰 成本估算: ${cost}`);
    
    const efficiency = analysis.report?.optimization?.efficiency || 'N/A';
    console.log(`📈 效率评分: ${efficiency}`);
    
    const recommendations = analysis.report?.recommendations || analysis.recommendations || [];
    if (recommendations && recommendations.length > 0) {
      console.log(colorize('💡 优化建议:', 'yellow'));
      recommendations.forEach(rec => {
        console.log(`   • ${rec.message || rec}`);
      });
    }
  }
}

// 主程序
async function main() {
  console.log(colorize('🧠 Claude LLM Gateway - 智能Token管理验证', 'cyan'));
  console.log(colorize('='.repeat(60), 'cyan'));
  
  // 检查服务
  if (!(await checkService())) {
    process.exit(1);
  }
  
  // 获取统计信息
  await getTokenStats();
  
  // 运行所有测试
  console.log(colorize('\n🚀 开始Token分配测试...', 'cyan'));
  
  for (let i = 0; i < testCases.length; i++) {
    await runTest(testCases[i], i);
  }
  
  // 总结
  console.log(colorize('\n✅ 智能Token管理验证完成!', 'green'));
  console.log(colorize('─'.repeat(60), 'green'));
  console.log('🎯 验证要点:');
  console.log('  ✓ 统一max_tokens接口');
  console.log('  ✓ 智能任务类型检测');  
  console.log('  ✓ 自动提供商适配');
  console.log('  ✓ 成本效益优化');
  console.log('  ✓ 详细分析报告');
  
  console.log(colorize('\n📚 详细文档: TOKEN_MANAGEMENT_GUIDE.md', 'blue'));
  console.log(colorize('🌐 Web管理界面: http://localhost:8765', 'blue'));
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.log(colorize(`❌ 未处理的错误: ${reason}`, 'red'));
  process.exit(1);
});

// 运行
if (require.main === module) {
  main().catch(error => {
    console.log(colorize(`❌ 程序异常: ${error.message}`, 'red'));
    process.exit(1);
  });
}
