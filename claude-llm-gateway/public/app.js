// Global state
let providers = {};
let stats = {};
let modelStats = {};
let logs = [];

// Environment variables configuration
const envVariableConfigs = {
    'DEEPSEEK_API_KEY': { label: 'DeepSeek API Key', provider: 'deepseek', type: 'password' },
    'OPENAI_API_KEY': { label: 'OpenAI API Key', provider: 'openai', type: 'password' },
    'ANTHROPIC_API_KEY': { label: 'Anthropic API Key', provider: 'anthropic', type: 'password' },
    'GOOGLE_API_KEY': { label: 'Google API Key', provider: 'google', type: 'password' },
    'GEMINI_API_KEY': { label: 'Gemini API Key', provider: 'google', type: 'password' },
    'GROQ_API_KEY': { label: 'Groq API Key', provider: 'groq', type: 'password' },
    'MISTRAL_API_KEY': { label: 'Mistral API Key', provider: 'mistral', type: 'password' },
    'HUGGINGFACE_TOKEN': { label: 'Hugging Face Token', provider: 'huggingface', type: 'password' },
    'COHERE_API_KEY': { label: 'Cohere API Key', provider: 'cohere', type: 'password' },
    'QIANWEN_API_KEY': { label: 'Qianwen API Key', provider: 'qianwen', type: 'password' },
    'ZHIPU_API_KEY': { label: 'Zhipu API Key', provider: 'zhipu', type: 'password' },
    'OPENROUTER_API_KEY': { label: 'OpenRouter API Key', provider: 'openrouter', type: 'password' },
    'VOLCENGINE_API_KEY': { label: 'VolcEngine API Key', provider: 'volcengine', type: 'password' },
    'BAIDU_LLM_KEY': { label: 'Baidu LLM Key', provider: 'baidu', type: 'password' },
    'GROK_API_KEY': { label: 'Grok API Key', provider: 'grok', type: 'password' },
    'FINNHUB_API_KEY': { label: 'Finnhub API Key', provider: 'finnhub', type: 'password' },
    'ALPHAGENOME_API_KEY': { label: 'AlphaGenome API Key', provider: 'alphagenome', type: 'password' },
    'SERPAPI_KEY': { label: 'SerpAPI Key', provider: 'serpapi', type: 'password' },
    'PEXELS_API_KEY': { label: 'Pexels API Key', provider: 'pexels', type: 'password' },
    'PAPER_WITH_CODE_TOCKEN': { label: 'Papers With Code Token', provider: 'paperswithcode', type: 'password' },
    'MOONSHOT_API_KEY': { label: 'Moonshot API Key', provider: 'moonshot', type: 'password' },
    'MOONSHOT_BASE_URL': { label: 'Moonshot Base URL', provider: 'moonshot', type: 'url' },
    'OPENAI_BASE_URL': { label: 'OpenAI Base URL', provider: 'openai', type: 'url' },
    'ANTHROPIC_BASE_URL': { label: 'Anthropic Base URL', provider: 'anthropic', type: 'url' }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    setInterval(loadDashboard, 30000); // Refresh every 30 seconds
});

// API functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        showNotification('API请求失败: ' + error.message, 'error');
        throw error;
    }
}

async function loadProviders() {
    try {
        const data = await apiRequest('/providers');
        providers = data.providers;
        stats = data.summary;
        return data;
    } catch (error) {
        console.error('Failed to load providers:', error);
    }
}

async function loadModelStats() {
    try {
        const data = await apiRequest('/model-stats');
        modelStats = data;
        return data;
    } catch (error) {
        console.error('Failed to load model stats:', error);
    }
}

async function loadGatewayStats() {
    try {
        const data = await apiRequest('/stats');
        return data;
    } catch (error) {
        console.error('Failed to load gateway stats:', error);
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        const [providerData, modelData, gatewayData] = await Promise.all([
            loadProviders(),
            loadModelStats(),
            loadGatewayStats()
        ]);

        updateStatsOverview(providerData, gatewayData);
        renderProviders();
        renderModelStats();
        updateLastUpdateTime();
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

function updateStatsOverview(providerData, gatewayData) {
    if (providerData) {
        document.getElementById('healthy-count').textContent = providerData.summary.healthy;
        document.getElementById('total-count').textContent = providerData.summary.total;
        
        // Count total models
        let totalModels = 0;
        Object.values(providerData.providers).forEach(provider => {
            if (provider.models) {
                totalModels += provider.models.length;
            }
        });
        document.getElementById('models-count').textContent = totalModels;
    }
    
    if (gatewayData) {
        document.getElementById('requests-count').textContent = gatewayData.total_requests || 0;
    }
}

function renderProviders() {
    const grid = document.getElementById('providers-grid');
    if (!grid || !providers) return;

    grid.innerHTML = '';

    Object.entries(providers).forEach(([name, provider]) => {
        const card = createProviderCard(name, provider);
        grid.appendChild(card);
    });
}

function createProviderCard(name, provider) {
    const div = document.createElement('div');
    div.className = 'provider-card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow';

    const statusClass = provider.healthy ? 'healthy' : 'unhealthy';
    const statusText = provider.healthy ? '健康' : '不健康';
    const statusIcon = provider.healthy ? 'fas fa-check-circle text-green-500' : 'fas fa-exclamation-circle text-red-500';

    const priorityBadge = getPriorityBadge(provider.priority);
    const modelsList = provider.models ? provider.models.slice(0, 3).join(', ') : '无模型';
    const moreModels = provider.models && provider.models.length > 3 ? ` +${provider.models.length - 3}个` : '';

    div.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <i class="fas fa-server text-gray-600"></i>
                </div>
                <div>
                    <h3 class="text-lg font-medium text-gray-900">${name}</h3>
                    <div class="flex items-center text-sm text-gray-500">
                        <span class="status-dot ${statusClass}"></span>
                        ${statusText}
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                ${priorityBadge}
                <label class="toggle-switch">
                    <input type="checkbox" ${provider.enabled ? 'checked' : ''} 
                           onchange="toggleProvider('${name}', this.checked)">
                    <span class="slider"></span>
                </label>
            </div>
        </div>

        <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between">
                <span>请求数:</span>
                <span class="font-medium">${provider.request_count || 0}</span>
            </div>
            <div class="flex justify-between">
                <span>响应时间:</span>
                <span class="font-medium">${provider.response_time || 'N/A'}</span>
            </div>
            <div class="flex justify-between">
                <span>成本/1K tokens:</span>
                <span class="font-medium">$${(provider.cost_per_1k_tokens || 0).toFixed(4)}</span>
            </div>
            <div class="mt-3">
                <span class="text-xs font-medium text-gray-500">模型:</span>
                <p class="text-xs text-gray-600 mt-1">${modelsList}${moreModels}</p>
            </div>
        </div>

        <div class="mt-4 flex space-x-2">
            <button onclick="testProvider('${name}')" 
                    class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium">
                <i class="fas fa-flask mr-1"></i>测试
            </button>
            <button onclick="configureProvider('${name}')" 
                    class="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium">
                <i class="fas fa-cog mr-1"></i>配置
            </button>
        </div>

        ${provider.error ? `
            <div class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                ${provider.error}
            </div>
        ` : ''}
    `;

    return div;
}

function getPriorityBadge(priority) {
    let badgeClass, text;
    if (priority <= 3) {
        badgeClass = 'bg-green-100 text-green-800';
        text = '高';
    } else if (priority <= 6) {
        badgeClass = 'bg-yellow-100 text-yellow-800';
        text = '中';
    } else {
        badgeClass = 'bg-gray-100 text-gray-800';
        text = '低';
    }
    
    return `<span class="px-2 py-1 ${badgeClass} text-xs rounded-full">${text}</span>`;
}

function renderModelStats() {
    const container = document.getElementById('model-stats');
    if (!container || !modelStats.capabilities) return;

    container.innerHTML = '';

    // Performance stats
    const perfDiv = document.createElement('div');
    perfDiv.innerHTML = `
        <h3 class="text-lg font-medium text-gray-900 mb-4">模型性能统计</h3>
        <div class="space-y-3">
            ${Object.entries(modelStats.performance || {}).map(([model, perf]) => `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span class="font-medium">${model}</span>
                    <div class="text-sm text-gray-600">
                        成功率: ${perf.successRate} | 响应时间: ${perf.avgResponseTime}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Capabilities
    const capDiv = document.createElement('div');
    capDiv.innerHTML = `
        <h3 class="text-lg font-medium text-gray-900 mb-4">模型能力矩阵</h3>
        <div class="space-y-3">
            ${Object.entries(modelStats.capabilities).map(([model, caps]) => `
                <div class="p-4 border border-gray-200 rounded-lg">
                    <div class="font-medium text-gray-900 mb-2">${model}</div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span class="text-gray-500">优势:</span>
                            <span class="ml-2 text-green-600">${caps.strengths.join(', ')}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">基础分数:</span>
                            <span class="ml-2 font-medium">${caps.baseScore}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">速度:</span>
                            <span class="ml-2">${caps.speed}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">成本:</span>
                            <span class="ml-2">${caps.cost}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.appendChild(perfDiv);
    container.appendChild(capDiv);
}

function renderEnvironmentVariables() {
    const container = document.getElementById('env-variables');
    if (!container) return;

    container.innerHTML = Object.entries(envVariableConfigs).map(([key, config]) => `
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">${config.label}</label>
            <div class="flex space-x-2">
                <input type="${config.type}" 
                       id="env-${key}" 
                       placeholder="输入${config.label}..."
                       class="api-key-input flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
                <button onclick="testEnvVariable('${key}')" 
                        class="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded text-sm">
                    <i class="fas fa-flask"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Tab functions
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Remove active state from all tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active', 'border-blue-500', 'text-blue-600');
        button.classList.add('border-transparent', 'text-gray-500');
    });

    // Show selected tab content
    document.getElementById(`${tabName}-content`).classList.remove('hidden');

    // Add active state to selected tab
    const activeTab = document.getElementById(`${tabName}-tab`);
    activeTab.classList.add('active', 'border-blue-500', 'text-blue-600');
    activeTab.classList.remove('border-transparent', 'text-gray-500');

    // Load tab-specific content
    if (tabName === 'config') {
        renderEnvironmentVariables();
    } else if (tabName === 'logs') {
        startLogStreaming();
    }
}

// Provider management functions
async function toggleProvider(name, enabled) {
    try {
        const response = await apiRequest(`/providers/${name}/toggle`, {
            method: 'POST',
            body: JSON.stringify({ enabled })
        });
        
        showNotification(`${name} ${enabled ? '已启用' : '已禁用'}`, 'success');
        loadDashboard();
    } catch (error) {
        showNotification('切换提供者状态失败', 'error');
    }
}

async function testProvider(name) {
    showNotification(`正在测试 ${name}...`, 'info');
    
    try {
        const response = await apiRequest(`/providers/${name}/test`, {
            method: 'POST'
        });
        
        if (response.success) {
            showNotification(`${name} 测试成功`, 'success');
        } else {
            showNotification(`${name} 测试失败: ${response.error}`, 'error');
        }
        
        loadDashboard();
    } catch (error) {
        showNotification(`${name} 测试失败`, 'error');
    }
}

async function testAllProviders() {
    showNotification('正在测试所有提供者...', 'info');
    
    try {
        const response = await apiRequest('/providers/test-all', {
            method: 'POST'
        });
        
        showNotification('所有提供者测试完成', 'success');
        loadDashboard();
    } catch (error) {
        showNotification('批量测试失败', 'error');
    }
}

function configureProvider(name) {
    // This would open a detailed configuration modal
    showNotification(`打开 ${name} 配置面板 (功能开发中)`, 'info');
}

// Modal functions
function showAddProviderModal() {
    document.getElementById('add-provider-modal').classList.remove('hidden');
}

function closeAddProviderModal() {
    document.getElementById('add-provider-modal').classList.add('hidden');
    // Clear form
    document.getElementById('new-provider-name').value = '';
    document.getElementById('new-provider-key').value = '';
    document.getElementById('new-provider-priority').value = '10';
}

async function addProvider() {
    const name = document.getElementById('new-provider-name').value;
    const key = document.getElementById('new-provider-key').value;
    const priority = document.getElementById('new-provider-priority').value;

    if (!name || !key) {
        showNotification('请填写所有必填字段', 'error');
        return;
    }

    try {
        await apiRequest('/providers/add', {
            method: 'POST',
            body: JSON.stringify({
                name,
                apiKey: key,
                priority: parseInt(priority)
            })
        });
        
        showNotification(`${name} 添加成功`, 'success');
        closeAddProviderModal();
        loadDashboard();
    } catch (error) {
        showNotification('添加提供者失败', 'error');
    }
}

// Configuration functions
async function saveEnvironmentVariables() {
    const envVars = {};
    
    Object.keys(envVariableConfigs).forEach(key => {
        const input = document.getElementById(`env-${key}`);
        if (input && input.value.trim()) {
            envVars[key] = input.value.trim();
        }
    });

    try {
        await apiRequest('/config/environment', {
            method: 'POST',
            body: JSON.stringify(envVars)
        });
        
        showNotification('环境变量已保存', 'success');
        loadDashboard();
    } catch (error) {
        showNotification('保存环境变量失败', 'error');
    }
}

async function saveGatewaySettings() {
    const settings = {
        port: document.getElementById('gateway-port').value,
        timeout: document.getElementById('request-timeout').value,
        concurrency: document.getElementById('concurrency-limit').value,
        cors: document.getElementById('enable-cors').checked
    };

    try {
        await apiRequest('/config/gateway', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
        
        showNotification('网关设置已保存', 'success');
    } catch (error) {
        showNotification('保存网关设置失败', 'error');
    }
}

async function testEnvVariable(key) {
    const input = document.getElementById(`env-${key}`);
    const value = input.value.trim();
    
    if (!value) {
        showNotification('请先输入API密钥', 'error');
        return;
    }

    try {
        const response = await apiRequest('/config/test-env', {
            method: 'POST',
            body: JSON.stringify({ key, value })
        });
        
        if (response.success) {
            showNotification(`${key} 验证成功`, 'success');
        } else {
            showNotification(`${key} 验证失败`, 'error');
        }
    } catch (error) {
        showNotification('验证失败', 'error');
    }
}

// Refresh functions
async function refreshAll() {
    showNotification('正在刷新...', 'info');
    await loadDashboard();
    showNotification('刷新完成', 'success');
}

// Log functions
function startLogStreaming() {
    // Simulate log streaming (in a real implementation, this would use WebSockets)
    if (window.logInterval) {
        clearInterval(window.logInterval);
    }
    
    window.logInterval = setInterval(updateLogs, 2000);
}

function updateLogs() {
    const logContainer = document.getElementById('log-content');
    const autoScroll = document.getElementById('auto-scroll').checked;
    
    // Simulate new logs
    const newLog = `[${new Date().toISOString()}] [INFO] Gateway status: ${Object.keys(providers || {}).length} providers active`;
    logs.push(newLog);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
        logs = logs.slice(-100);
    }
    
    logContainer.innerHTML = logs.join('\n');
    
    if (autoScroll) {
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}

function clearLogs() {
    logs = [];
    document.getElementById('log-content').innerHTML = '';
}

// Utility functions
function updateLastUpdateTime() {
    document.getElementById('last-update').textContent = 
        `最后更新: ${new Date().toLocaleTimeString()}`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'info': 'bg-blue-500',
        'warning': 'bg-yellow-500'
    }[type] || 'bg-blue-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
