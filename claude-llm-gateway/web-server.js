#!/usr/bin/env node

const express = require('express');
const path = require('path');
const chalk = require('chalk');

// Create Express app
const app = express();
const PORT = process.env.WEB_PORT || 9000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Main route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check for web server
app.get('/web-health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'claude-llm-gateway-web',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(chalk.green('🌐 Claude LLM Gateway Web Interface Started!'));
    console.log(chalk.blue(`📱 Web Interface: http://localhost:${PORT}`));
    console.log(chalk.blue(`🔧 Gateway API: http://localhost:8765`));
    console.log(chalk.yellow('📋 Make sure the gateway is running on port 8765'));
    console.log(chalk.gray('─'.repeat(50)));
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Shutting down web server...'));
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(chalk.yellow('\n🛑 Shutting down web server...'));
    process.exit(0);
});
