/**
 * Ryco Popup Dashboard Logic
 * Settings management for API keys, models, and UI customization
 */

// ========== State ==========
let settings = {
    activeProvider: 'openai',
    selectedModels: {},
    apiKeys: {},
    userDetails: {
        name: '',
        role: '',
        company: '',
        industry: '',
        experience: '',
        skills: '',
        goals: '',
        tone: '',
        language: 'English',
        timezone: '',
        context: ''
    }
};

let providers = {};

// ========== DOM Elements ==========
const elements = {
    app: document.getElementById('app'),
    saveKeys: document.getElementById('saveKeys'),
    saveUserDetails: document.getElementById('saveUserDetails'),
    providerSelect: document.getElementById('providerSelect'),
    modelSection: document.getElementById('modelSection'),
    tabs: document.querySelectorAll('.ryco-tab'),
    panels: document.querySelectorAll('.ryco-panel')
};

// ========== Initialization ==========
async function init() {
    try {
        await loadSettings();
        setupEventListeners();
        renderModelSelectors();
        updateProviderStatuses();
    } catch (error) {
        console.error('[Ryco] Initialization error:', error);
        // Show error state in UI
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = 'padding: 20px; text-align: center; color: var(--ryco-error);';
        errorMsg.textContent = 'Failed to load settings. Please refresh.';
        elements.app?.appendChild(errorMsg);
    }
}

async function loadSettings() {
    try {
        const response = await chrome.runtime.sendMessage({ type: 'RYCO_GET_SETTINGS' });
        if (response?.success) {
            settings = response.settings;
            providers = response.providers;

            // Apply system theme
            applySystemTheme();

            // Set active provider radio
            const providerRadio = document.querySelector(`input[name="provider"][value="${settings.activeProvider}"]`);
            if (providerRadio) providerRadio.checked = true;

            // Load user details
            loadUserDetails();
        } else {
            throw new Error(response?.error || 'Failed to load settings');
        }
    } catch (e) {
        console.error('[Ryco] Failed to load settings:', e);
        throw e;
    }
}

function loadUserDetails() {
    if (!settings.userDetails) {
        settings.userDetails = {
            name: '', role: '', company: '', industry: '',
            experience: '', skills: '', goals: '', tone: '',
            language: 'English', timezone: '', context: ''
        };
    }

    const fields = {
        'user-name': 'name',
        'user-role': 'role',
        'user-company': 'company',
        'user-industry': 'industry',
        'user-experience': 'experience',
        'user-skills': 'skills',
        'user-goals': 'goals',
        'user-tone': 'tone',
        'user-language': 'language',
        'user-timezone': 'timezone',
        'user-context': 'context'
    };

    for (const [elementId, settingKey] of Object.entries(fields)) {
        const element = document.getElementById(elementId);
        if (element && settings.userDetails[settingKey]) {
            element.value = settings.userDetails[settingKey];
        }
    }
}



// ========== Event Listeners ==========
function setupEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Theme toggle button - properly toggle between light and dark
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            toggleTheme();
        });
    }

    // System theme listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);

    // Provider selection
    document.querySelectorAll('input[name="provider"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            settings.activeProvider = e.target.value;
            saveSettings({ activeProvider: settings.activeProvider });
        });
    });

    // Test connection buttons
    document.querySelectorAll('[data-action="test"]').forEach(btn => {
        btn.addEventListener('click', () => testConnection(btn.dataset.provider));
    });

    // Save all keys
    elements.saveKeys.addEventListener('click', saveAllKeys);

    // Save user details
    elements.saveUserDetails.addEventListener('click', saveUserDetails);
}

// ========== Tab Switching ==========
function switchTab(tabId) {
    elements.tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    elements.panels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-${tabId}`);
    });
}

// ========== Theme Management ==========
function toggleTheme() {
    const isCurrentlyLight = document.body.classList.contains('light');
    
    if (isCurrentlyLight) {
        // Switch to dark
        document.body.classList.remove('light');
    } else {
        // Switch to light
        document.body.classList.add('light');
    }
}

function applySystemTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
        document.body.classList.remove('light');
    } else {
        document.body.classList.add('light');
    }
}

// ========== Model Selectors ==========
function renderModelSelectors() {
    if (!elements.modelSection) return;

    elements.modelSection.innerHTML = '';

    for (const [key, provider] of Object.entries(providers)) {
        const card = document.createElement('div');
        card.className = 'ryco-model-card';

        const selectedModel = settings.selectedModels[key] || provider.defaultModel;

        card.innerHTML = `
      <h4>${provider.name} Model</h4>
      <select class="ryco-select" data-provider="${key}">
        ${provider.models.map(model => `
          <option value="${model}" ${model === selectedModel ? 'selected' : ''}>
            ${model}
          </option>
        `).join('')}
      </select>
    `;

        const select = card.querySelector('select');
        if (select) {
            select.addEventListener('change', (e) => {
                settings.selectedModels[key] = e.target.value;
                saveSettings({ selectedModels: settings.selectedModels });
            });
        }

        elements.modelSection.appendChild(card);
    }
}

// ========== API Key Management ==========
async function testConnection(provider) {
    const input = document.getElementById(`key-${provider}`);
    const statusEl = document.getElementById(`status-${provider}`);

    if (!input || !statusEl) {
        console.error('[Ryco] Missing DOM elements for provider:', provider);
        return;
    }

    const apiKey = input.value.trim();

    if (!apiKey) {
        updateStatus(statusEl, 'error', 'Enter an API key first');
        return;
    }

    // Validate API key format
    if (apiKey.length < 10) {
        updateStatus(statusEl, 'error', 'API key too short');
        return;
    }

    updateStatus(statusEl, 'testing', 'Testing...');

    try {
        const response = await chrome.runtime.sendMessage({
            type: 'RYCO_TEST_CONNECTION',
            provider,
            apiKey
        });

        if (response?.success) {
            updateStatus(statusEl, 'connected', 'Connected ✓');
        } else {
            const errorMsg = response?.error || 'Connection failed';
            updateStatus(statusEl, 'error', errorMsg);
        }
    } catch (error) {
        console.error('[Ryco] Test connection error:', error);
        const errorMsg = error.message || 'Connection failed';
        updateStatus(statusEl, 'error', errorMsg);
    }
}

function updateStatus(element, status, text) {
    if (!element) return;

    element.className = `ryco-status ${status}`;
    const textEl = element.querySelector('.ryco-status-text');
    if (textEl) {
        textEl.textContent = text;
    }
}

async function saveAllKeys() {
    const btn = elements.saveKeys;
    if (!btn) return;

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const providerIds = ['nvidia', 'gemini', 'openai'];
        let savedCount = 0;
        const errors = [];

        for (const provider of providerIds) {
            const input = document.getElementById(`key-${provider}`);
            if (!input) continue;

            const apiKey = input.value.trim();

            if (apiKey) {
                try {
                    const response = await chrome.runtime.sendMessage({
                        type: 'RYCO_SAVE_API_KEY',
                        provider,
                        apiKey
                    });

                    if (response?.success) {
                        savedCount++;
                        // Update status
                        const statusEl = document.getElementById(`status-${provider}`);
                        if (statusEl) {
                            updateStatus(statusEl, 'connected', 'Key saved ✓');
                        }
                    } else {
                        errors.push(`${provider}: ${response?.error || 'Failed'}`);
                    }
                } catch (error) {
                    errors.push(`${provider}: ${error.message}`);
                }
            }
        }

        if (errors.length > 0) {
            btn.textContent = `Saved ${savedCount}, ${errors.length} failed`;
            console.error('[Ryco] Save errors:', errors);
        } else {
            btn.textContent = savedCount > 0 ? `Saved ${savedCount} key(s) ✓` : 'No keys to save';
        }
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('[Ryco] Save keys error:', error);
        btn.textContent = 'Error saving';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    }
}

function updateProviderStatuses() {
    const providerIds = ['nvidia', 'gemini', 'openai'];

    for (const provider of providerIds) {
        const statusEl = document.getElementById(`status-${provider}`);
        if (!statusEl) continue;
        
        const hasKey = settings.apiKeys[provider] &&
            settings.apiKeys[provider].iv &&
            settings.apiKeys[provider].data;

        if (hasKey) {
            updateStatus(statusEl, 'connected', 'Key configured ✓');
        } else {
            updateStatus(statusEl, '', 'Not configured');
        }
    }
}

// ========== Settings Persistence ==========
async function saveSettings(partial) {
    try {
        await chrome.runtime.sendMessage({
            type: 'RYCO_UPDATE_SETTINGS',
            settings: partial
        });
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

// ========== User Details Management ==========
async function saveUserDetails() {
    const btn = elements.saveUserDetails;
    if (!btn) return;

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        // Helper function to sanitize and validate input
        const sanitizeInput = (value, maxLength = 500) => {
            if (!value || typeof value !== 'string') return '';
            const trimmed = value.trim();
            return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
        };

        const userDetails = {
            name: sanitizeInput(document.getElementById('user-name')?.value, 100),
            role: sanitizeInput(document.getElementById('user-role')?.value, 100),
            company: sanitizeInput(document.getElementById('user-company')?.value, 100),
            industry: sanitizeInput(document.getElementById('user-industry')?.value, 100),
            experience: sanitizeInput(document.getElementById('user-experience')?.value, 50),
            skills: sanitizeInput(document.getElementById('user-skills')?.value, 300),
            goals: sanitizeInput(document.getElementById('user-goals')?.value, 500),
            tone: sanitizeInput(document.getElementById('user-tone')?.value, 50),
            language: sanitizeInput(document.getElementById('user-language')?.value, 50),
            timezone: sanitizeInput(document.getElementById('user-timezone')?.value, 50),
            context: sanitizeInput(document.getElementById('user-context')?.value, 1000)
        };

        // Validate at least one field is filled
        const hasData = Object.values(userDetails).some(val => val.length > 0);
        
        if (!hasData) {
            btn.textContent = 'No data to save';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
            return;
        }

        settings.userDetails = userDetails;
        await saveSettings({ userDetails });

        btn.textContent = 'Saved Successfully ✓';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('[Ryco] Save user details error:', error);
        btn.textContent = 'Error saving';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    }
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', init);
