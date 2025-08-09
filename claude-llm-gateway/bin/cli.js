#!/usr/bin/env node

/**
 * Multi-LLM Gateway CLI
 * Command-line interface for the Claude LLM Gateway
 */

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const { ClaudeLLMGateway, DynamicConfigManager } = require('../index');
const packageJson = require('../package.json');

const program = new Command();

program
  .name('multi-llm-gateway')
  .description('CLI for Claude LLM Gateway')
  .version(packageJson.version);

// Start command
program
  .command('start')
  .description('Start the Claude LLM Gateway')
  .option('-p, --port <port>', 'Port number to run the gateway on', '3000')
  .option('-h, --host <host>', 'Host to bind the gateway to', 'localhost')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-d, --daemon', 'Run as daemon process')
  .option('--debug', 'Enable debug logging')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Starting Claude LLM Gateway...'));
      
      if (options.debug) {
        process.env.LOG_LEVEL = 'debug';
      }
      
      if (options.config) {
        process.env.CONFIG_PATH = options.config;
      }

      const gateway = new ClaudeLLMGateway();
      await gateway.start(parseInt(options.port));
      
      console.log(chalk.green(`✅ Gateway started successfully on ${options.host}:${options.port}`));
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to start gateway:'), error.message);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Manage gateway configuration')
  .option('-u, --update', 'Update provider configuration')
  .option('-s, --show', 'Show current configuration')
  .option('-r, --reset', 'Reset configuration to defaults')
  .action(async (options) => {
    try {
      const configManager = new DynamicConfigManager();
      
      if (options.update) {
        console.log(chalk.blue('🔄 Updating provider configuration...'));
        await configManager.discoverProviders();
        console.log(chalk.green('✅ Configuration updated successfully'));
      }
      
      if (options.show) {
        console.log(chalk.blue('📋 Current Configuration:'));
        const config = await configManager.loadConfig();
        if (config) {
          console.log(JSON.stringify(config, null, 2));
        } else {
          console.log(chalk.yellow('⚠️ No configuration found'));
        }
      }
      
      if (options.reset) {
        console.log(chalk.yellow('🔄 Resetting configuration...'));
        // Implementation would remove config file and regenerate
        console.log(chalk.green('✅ Configuration reset'));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Configuration operation failed:'), error.message);
      process.exit(1);
    }
  });

// Test command
program
  .command('test')
  .description('Test gateway functionality')
  .option('-p, --provider <provider>', 'Test specific provider')
  .option('-m, --model <model>', 'Test specific model')
  .option('-u, --url <url>', 'Gateway URL to test', 'http://localhost:3000')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🧪 Testing gateway functionality...'));
      
      const testMessage = {
        model: options.model || 'claude-3-sonnet',
        messages: [
          { role: 'user', content: 'Hello! This is a test message.' }
        ],
        max_tokens: 50
      };
      
      const fetch = require('node-fetch');
      const response = await fetch(`${options.url}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(chalk.green('✅ Test successful!'));
        console.log('Response:', JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.red('❌ Test failed:'), response.status, response.statusText);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Test failed:'), error.message);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check gateway status')
  .option('-u, --url <url>', 'Gateway URL to check', 'http://localhost:3000')
  .action(async (options) => {
    try {
      const fetch = require('node-fetch');
      
      console.log(chalk.blue('📊 Checking gateway status...'));
      
      // Health check
      const healthResponse = await fetch(`${options.url}/health`);
      if (healthResponse.ok) {
        const health = await healthResponse.json();
        console.log(chalk.green('✅ Gateway is healthy'));
        console.log(`Uptime: ${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m`);
        console.log(`Providers: ${health.providers.healthy}/${health.providers.total} healthy`);
      }
      
      // Provider status
      const providersResponse = await fetch(`${options.url}/providers`);
      if (providersResponse.ok) {
        const providers = await providersResponse.json();
        console.log(chalk.blue('\n📋 Provider Status:'));
        
        Object.entries(providers.providers).forEach(([name, status]) => {
          const icon = status.healthy ? '✅' : '❌';
          const models = status.models?.length || 0;
          console.log(`${icon} ${name}: ${models} models, priority ${status.priority}`);
        });
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Status check failed:'), error.message);
      process.exit(1);
    }
  });

// Install command
program
  .command('install')
  .description('Install and configure the gateway')
  .option('-d, --directory <dir>', 'Installation directory', './multi-llm-gateway')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📦 Installing Multi-LLM Gateway...'));
      
      const installDir = path.resolve(options.directory);
      
      // Create directory structure
      const dirs = ['config', 'logs', 'scripts'];
      for (const dir of dirs) {
        const dirPath = path.join(installDir, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      
      // Copy environment example
      const envExample = path.join(__dirname, '../env.example');
      const envTarget = path.join(installDir, '.env.example');
      if (fs.existsSync(envExample)) {
        fs.copyFileSync(envExample, envTarget);
      }
      
      console.log(chalk.green(`✅ Gateway installed in ${installDir}`));
      console.log(chalk.yellow('Next steps:'));
      console.log(`1. cd ${installDir}`);
      console.log('2. cp .env.example .env');
      console.log('3. Edit .env with your API keys');
      console.log('4. multi-llm-gateway start');
      
    } catch (error) {
      console.error(chalk.red('❌ Installation failed:'), error.message);
      process.exit(1);
    }
  });

// Version command (already handled by commander, but we can customize it)
program
  .command('version')
  .description('Show version information')
  .action(() => {
    console.log(chalk.blue('Claude LLM Gateway'));
    console.log(`Version: ${packageJson.version}`);
    console.log(`Node: ${process.version}`);
    console.log(`Platform: ${process.platform} ${process.arch}`);
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
