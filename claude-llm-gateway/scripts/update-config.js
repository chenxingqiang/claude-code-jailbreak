#!/usr/bin/env node

require('dotenv').config();
const DynamicConfigManager = require('../src/config/dynamic-config-manager');

async function updateConfiguration() {
  console.log('🔄 开始更新提供者配置...');
  
  const configManager = new DynamicConfigManager();
  
  try {
    // 检查是否需要更新
    const shouldUpdate = await configManager.shouldUpdateConfig();
    
    if (!shouldUpdate) {
      console.log('✅ 配置文件是最新的，无需更新');
      const config = await configManager.loadConfig();
      if (config) {
        displayConfigSummary(config);
      }
      return;
    }
    
    // 动态发现提供者
    console.log('🔍 正在发现提供者...');
    const config = await configManager.discoverProviders();
    
    // 显示配置摘要
    displayConfigSummary(await configManager.loadConfig());
    
  } catch (error) {
    console.error('❌ 配置更新失败:', error);
    process.exit(1);
  }
}

function displayConfigSummary(config) {
  if (!config) {
    console.log('❌ 无法加载配置');
    return;
  }

  console.log('\n📊 配置摘要:');
  console.log(`⏰ 生成时间: ${config.generated_at}`);
  console.log(`📦 LLM Interface版本: ${config.llm_interface_version}`);
  console.log(`🔢 总提供者数: ${config.total_providers}`);
  console.log(`✅ 已启用提供者: ${config.enabled_providers}`);
  
  const enabledProviders = Object.entries(config.providers)
    .filter(([name, conf]) => conf.enabled)
    .sort((a, b) => (a[1].priority || 10) - (b[1].priority || 10));

  const localProviders = enabledProviders.filter(([name, conf]) => conf.local);
  const remoteProviders = enabledProviders.filter(([name, conf]) => !conf.local);
  
  console.log('\n🎯 已启用的提供者:');
  
  if (remoteProviders.length > 0) {
    console.log('\n🔗 远程提供者:');
    remoteProviders.forEach(([name, conf]) => {
      const modelCount = conf.models?.length || 0;
      const cost = conf.cost_per_1k_tokens || 0;
      const priority = conf.priority || 10;
      console.log(`  • ${name}: ${modelCount} 个模型, 优先级 ${priority}, 成本 $${cost}/1k tokens`);
    });
  }
  
  if (localProviders.length > 0) {
    console.log('\n🏠 本地提供者:');
    localProviders.forEach(([name, conf]) => {
      const modelCount = conf.models?.length || 0;
      const priority = conf.priority || 10;
      console.log(`  • ${name}: ${modelCount} 个模型, 优先级 ${priority}, 免费`);
    });
  }

  const disabledProviders = Object.entries(config.providers)
    .filter(([name, conf]) => !conf.enabled);
  
  if (disabledProviders.length > 0) {
    console.log('\n⚠️  未启用的提供者 (缺少API密钥或不可用):');
    disabledProviders.forEach(([name, conf]) => {
      const reason = conf.requires_api_key ? '缺少API密钥' : '服务不可用';
      console.log(`  • ${name}: ${reason}`);
    });
  }

  console.log('\n💡 提示:');
  console.log('  - 设置相应的环境变量以启用更多提供者');
  console.log('  - 检查 env.example 文件了解所需的API密钥');
  console.log('  - 本地提供者 (如Ollama) 需要相应服务运行');
}

// 如果直接运行此脚本
if (require.main === module) {
  updateConfiguration();
}

module.exports = updateConfiguration;
