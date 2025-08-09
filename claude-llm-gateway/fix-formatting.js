const fs = require('fs');

// Fix files that got compressed into single lines and remaining Chinese
const files = [
  'src/claude-compatibility.js',
  'src/config/dynamic-config-manager.js'
];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix "thellos" typo back to "this"
  content = content.replace(/thellos\./g, 'this.');
  
  // Fix remaining Chinese in console.log
  content = content.replace(/conversion响应/g, 'transform response');
  
  // Fix formatting by adding proper line breaks
  content = content.replace(/; /g, ';\n');
  content = content.replace(/\{ /g, '{\n    ');
  content = content.replace(/ \}/g, '\n}');
  content = content.replace(/class /g, '\nclass ');
  content = content.replace(/async /g, '\n  async ');
  content = content.replace(/\*\//g, '*/\n');
  content = content.replace(/\/\*\*/g, '\n  /**');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed formatting: ${filePath}`);
});

console.log('✅ Formatting fixes completed!');
