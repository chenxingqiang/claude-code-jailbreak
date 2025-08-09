const fs = require('fs');

// Final cleanup for remaining Chinese characters
const files = [
  'src/intelligent-model-selector.js',
  'src/claude-compatibility.js', 
  'src/config/dynamic-config-manager.js'
];

const finalTranslations = {
  '现象': 'phenomenon',
  '差异': 'difference',
  '结果': 'result',
  '故事': 'story',
  '方案': 'solution',
  '想法': 'idea',
  '诗词': 'poetry',
  '成': 'to',
  '为': 'as',
  '一下': '',
  '给': 'give',
  'tokenanalysis': 'token analysis',
  '元data': 'metadata',
  'conversion响应': 'transform response',
  'provider信息': 'provider information',
  'provider': 'provider',
  'model数组': 'model array',
  'model列表': 'model list',
  'providerclass型': 'provider type',
  'model': 'model',
  'API密钥': 'API key',
  'OpenAImodel列表': 'OpenAI model list',
  '开源model': 'open source models'
};

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const [chinese, english] of Object.entries(finalTranslations)) {
    const regex = new RegExp(chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, english);
      changed = true;
    }
  }
  
  // Clean up double spaces and fix grammar
  content = content.replace(/\s+/g, ' ');
  content = content.replace(/explanation\.\*\?phenomenon\|phenomenon\.\*\?explanation/gi, 'explain phenomenon');
  content = content.replace(/comparison\.\*\?difference\|comparison\.\*\?result/gi, 'compare differences');
  content = content.replace(/写\.\*\?story\|creation\.\*\?article/gi, 'write story or create article');
  content = content.replace(/design\.\*\?solution\|creativity\.\*\?idea/gi, 'design solution or creative idea');
  content = content.replace(/写\.\*\?poetry\|creation\.\*\?poetry/gi, 'write poetry');
  content = content.replace(/translation\.\*\?to\|translate\.\*\?as/gi, 'translate to');
  content = content.replace(/suggestion\.\*\?\|give\.\*\?suggestion/gi, 'give suggestion');
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Final cleanup: ${filePath}`);
  }
});

console.log('✅ Final cleanup completed!');
