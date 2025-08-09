const fs = require('fs');

let content = fs.readFileSync('public/index.html', 'utf8');

const htmlTranslations = {
  '刷新状态': 'Refresh Status',
  '加载中...': 'Loading...',
  '健康提供者': 'Healthy Providers',
  '总提供者': 'Total Providers',
  '可用模型': 'Available Models',
  '总请求数': 'Total Requests',
  '提供者管理': 'Provider Management',
  '配置管理': 'Configuration',
  '智能选择': 'Intelligent Selection',
  '实时日志': 'Real-time Logs',
  '提供者配置': 'Provider Configuration',
  '测试所有': 'Test All',
  '添加提供者': 'Add Provider',
  '环境变量配置': 'Environment Variables',
  '保存配置': 'Save Configuration',
  '网关设置': 'Gateway Settings',
  '默认端口': 'Default Port',
  '请求超时 (秒)': 'Request Timeout (seconds)',
  '并发限制': 'Concurrency Limit',
  '启用CORS': 'Enable CORS',
  '保存设置': 'Save Settings',
  '智能模型选择': 'Intelligent Model Selection',
  '实时日志': 'Real-time Logs',
  '清空日志': 'Clear Logs',
  '自动滚动': 'Auto Scroll',
  '网关启动成功，等待日志数据...': 'Gateway started successfully, waiting for log data...',
  '添加新提供者': 'Add New Provider',
  '提供者名称': 'Provider Name',
  '选择提供者...': 'Select Provider...',
  'API 密钥': 'API Key',
  '输入API密钥...': 'Enter API Key...',
  '优先级': 'Priority',
  '取消': 'Cancel',
  '添加': 'Add'
};

// Apply translations
for (const [chinese, english] of Object.entries(htmlTranslations)) {
  content = content.replace(new RegExp(chinese, 'g'), english);
}

// Write back
fs.writeFileSync('public/index.html', content, 'utf8');
console.log('✅ HTML translated successfully');
