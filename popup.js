/**
 * Ryco Popup Dashboard Logic
 * Settings management for API keys, models, and UI customization
 */

// ========== State ==========
let settings = {
    activeProvider: 'openai',
    selectedModels: {},
    theme: 'dark',
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
    themeToggle: document.getElementById('themeToggle'),
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

/**
 * Loads and validates settings from storage
 * @returns {Promise<void>}
 */
async function loadSettings() {
    try {
        const response = await chrome.runtime.sendMessage({ type: 'RYCO_GET_SETTINGS' });
        if (response?.success) {
            // Validate settings structure
            if (!response.settings || typeof response.settings !== 'object') {
                throw new Error('Invalid settings structure');
            }
            if (!response.providers || typeof response.providers !== 'object') {
                throw new Error('Invalid providers structure');
            }
            
            settings = response.settings;
            providers = response.providers;

            // Apply theme
            applyTheme(settings.theme);

            // Set active provider radio
            const providerRadio = document.querySelector(`input[name="provider"][value="${settings.activeProvider}"]`);
            if (providerRadio) providerRadio.checked = true;

            // Set theme radio
            const themeRadio = document.querySelector(`input[name="theme"][value="${settings.theme}"]`);
            if (themeRadio) themeRadio.checked = true;

            // Load user details
            loadUserDetails();
        } else {
            throw new Error(response?.error || 'Failed to load settings');
        }
    } catch (e) {
        console.error('[Ryco] Failed to load settings:', e);
        // Show user-friendly error
        showErrorState('Failed to load settings. Please refresh the page.');
        throw e;
    }
}

/**
 * Shows error state in UI
 * @param {string} message - Error message to display
 */
function showErrorState(message) {
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = 'padding: 20px; text-align: center; color: var(--ryco-error);';
    errorMsg.textContent = message;
    elements.app?.appendChild(errorMsg);
}

/**
 * Loads user details into form fields with validation
 */
function loadUserDetails() {
    if (!settings.userDetails || typeof settings.userDetails !== 'object') {
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
        if (element) {
            const value = settings.userDetails[settingKey];
            // Validate and sanitize before setting
            if (typeof value === 'string') {
                element.value = value;
            }
        }
    }
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
    } else {
        document.body.classList.remove('light');
    }
}

// ========== Event Listeners ==========
function setupEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Theme toggle button
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Theme radio buttons
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            settings.theme = e.target.value;
            applyTheme(settings.theme);
            saveSettings({ theme: settings.theme });
        });
    });

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

// ========== Theme Toggle ==========
function toggleTheme() {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme(settings.theme);

    const themeRadio = document.querySelector(`input[name="theme"][value="${settings.theme}"]`);
    if (themeRadio) themeRadio.checked = true;

    saveSettings({ theme: settings.theme });
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

    updateStatus(statusEl, 'testing', 'Testing...');

    try {
        const response = await chrome.runtime.sendMessage({
            type: 'RYCO_TEST_CONNECTION',
            provider,
            apiKey
        });

        if (response?.success) {
            updateStatus(statusEl, 'connected', 'Connected');
        } else {
            updateStatus(statusEl, 'error', response?.error || 'Connection failed');
        }
    } catch (error) {
        console.error('[Ryco] Test connection error:', error);
        updateStatus(statusEl, 'error', error.message || 'Connection failed');
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
    
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const providerIds = ['nvidia', 'gemini', 'openai'];
        let savedCount = 0;

        for (const provider of providerIds) {
            const input = document.getElementById(`key-${provider}`);
            if (!input) continue;
            
            const apiKey = input.value.trim();

            if (apiKey) {
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
                        updateStatus(statusEl, 'connected', 'Key saved');
                    }
                }
            }
        }

        btn.textContent = savedCount > 0 ? `Saved ${savedCount} key(s)!` : 'No keys to save';
        setTimeout(() => {
            btn.textContent = 'Save All Keys';
            btn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('[Ryco] Save keys error:', error);
        btn.textContent = 'Error saving';
        setTimeout(() => {
            btn.textContent = 'Save All Keys';
            btn.disabled = false;
        }, 2000);
    }
}

function updateProviderStatuses() {
    const providerIds = ['nvidia', 'gemini', 'openai'];

    for (const provider of providerIds) {
        const statusEl = document.getElementById(`status-${provider}`);
        const hasKey = settings.apiKeys[provider] &&
            settings.apiKeys[provider].iv &&
            settings.apiKeys[provider].data;

        if (hasKey) {
            updateStatus(statusEl, 'connected', 'Key configured');
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
/**
 * Validates and sanitizes user input
 * @param {string} value - Input value to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized value
 */
function sanitizeInput(value, maxLength = 500) {
    if (typeof value !== 'string') return '';
    // Remove potentially dangerous characters and limit length
    return value.trim()
        .replace(/[<>]/g, '')
        .substring(0, maxLength);
}

/**
 * Validates user details before saving
 * @param {Object} userDetails - User details object
 * @returns {Object} Validation result with isValid and errors
 */
function validateUserDetails(userDetails) {
    const errors = [];
    
    // Optional validation rules
    if (userDetails.name && userDetails.name.length > 100) {
        errors.push('Name is too long (max 100 characters)');
    }
    
    if (userDetails.skills && userDetails.skills.length > 500) {
        errors.push('Skills field is too long (max 500 characters)');
    }
    
    if (userDetails.context && userDetails.context.length > 1000) {
        errors.push('Context field is too long (max 1000 characters)');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

async function saveUserDetails() {
    const btn = elements.saveUserDetails;
    if (!btn) return;

    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        // Collect and sanitize user details
        const userDetails = {
            name: sanitizeInput(document.getElementById('user-name')?.value, 100),
            role: sanitizeInput(document.getElementById('user-role')?.value, 100),
            company: sanitizeInput(document.getElementById('user-company')?.value, 100),
            industry: sanitizeInput(document.getElementById('user-industry')?.value, 100),
            experience: document.getElementById('user-experience')?.value || '',
            skills: sanitizeInput(document.getElementById('user-skills')?.value, 500),
            goals: sanitizeInput(document.getElementById('user-goals')?.value, 500),
            tone: document.getElementById('user-tone')?.value || '',
            language: document.getElementById('user-language')?.value || 'English',
            timezone: sanitizeInput(document.getElementById('user-timezone')?.value, 50),
            context: sanitizeInput(document.getElementById('user-context')?.value, 1000)
        };

        // Validate user details
        const validation = validateUserDetails(userDetails);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        settings.userDetails = userDetails;
        await saveSettings({ userDetails });

        btn.textContent = 'Saved Successfully!';
        setTimeout(() => {
            btn.textContent = 'Save User Details';
            btn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('[Ryco] Save user details error:', error);
        btn.textContent = 'Error: ' + (error.message || 'Failed to save');
        setTimeout(() => {
            btn.textContent = 'Save User Details';
            btn.disabled = false;
        }, 3000);
    }
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', init);
