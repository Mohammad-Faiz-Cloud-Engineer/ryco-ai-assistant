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
        showErrorState('Failed to load settings. Please refresh the page.');
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
    // Validate elements exist before adding listeners
    if (!elements.themeToggle || !elements.saveKeys || !elements.saveUserDetails) {
        console.error('[Ryco] Critical DOM elements missing');
        return;
    }

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

/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
    if (!text || typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== Model Selectors ==========
function renderModelSelectors() {
    if (!elements.modelSection) {
        console.warn('[Ryco] Model section element not found');
        return;
    }
    
    // Clean up existing event listeners before clearing content
    cleanupDropdownListeners();
    
    // Clear existing content
    elements.modelSection.innerHTML = '';

    // Validate providers exist
    if (!providers || Object.keys(providers).length === 0) {
        console.warn('[Ryco] No providers available');
        elements.modelSection.innerHTML = '<p style="color: var(--ryco-text-tertiary); text-align: center; padding: 20px;">No models available</p>';
        return;
    }

    for (const [key, provider] of Object.entries(providers)) {
        // Validate provider structure
        if (!provider || !provider.name || !Array.isArray(provider.models) || provider.models.length === 0) {
            console.warn('[Ryco] Invalid provider structure:', key);
            continue;
        }

        const card = document.createElement('div');
        card.className = 'ryco-model-card';

        const selectedModel = settings.selectedModels[key] || provider.defaultModel;

        card.innerHTML = `
      <h4>${escapeHtml(provider.name)} Model</h4>
      <div class="ryco-select" data-provider="${escapeHtml(key)}">
        <div class="ryco-select-trigger">
          <span class="ryco-select-value">${escapeHtml(selectedModel)}</span>
          <span class="ryco-select-arrow">
            <svg viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
        <div class="ryco-select-dropdown">
          ${provider.models.map(model => `
            <div class="ryco-select-option ${model === selectedModel ? 'selected' : ''}" data-value="${escapeHtml(model)}">
              ${escapeHtml(model)}
            </div>
          `).join('')}
        </div>
        <select style="display: none;" aria-hidden="true">
          ${provider.models.map(model => `
            <option value="${escapeHtml(model)}" ${model === selectedModel ? 'selected' : ''}>
              ${escapeHtml(model)}
            </option>
          `).join('')}
        </select>
      </div>
    `;

        elements.modelSection.appendChild(card);
    }
    
    // Initialize custom dropdowns
    initCustomDropdowns();
}

// ========== Custom Dropdown Functionality ==========
let dropdownEventListeners = []; // Track event listeners for cleanup

function initCustomDropdowns() {
    // Clean up existing event listeners to prevent memory leaks
    cleanupDropdownListeners();
    
    const dropdowns = document.querySelectorAll('.ryco-select');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.ryco-select-trigger');
        const dropdownMenu = dropdown.querySelector('.ryco-select-dropdown');
        const options = dropdown.querySelectorAll('.ryco-select-option');
        const valueDisplay = dropdown.querySelector('.ryco-select-value');
        const hiddenSelect = dropdown.querySelector('select');
        const provider = dropdown.dataset.provider;
        
        // Validate all required elements exist
        if (!trigger || !dropdownMenu || !valueDisplay || !hiddenSelect) {
            console.warn('[Ryco] Missing dropdown elements for provider:', provider);
            return;
        }
        
        // Toggle dropdown handler
        const toggleHandler = (e) => {
            e.stopPropagation();
            
            // Close other dropdowns
            document.querySelectorAll('.ryco-select.open').forEach(other => {
                if (other !== dropdown) {
                    other.classList.remove('open');
                }
            });
            
            dropdown.classList.toggle('open');
        };
        
        trigger.addEventListener('click', toggleHandler);
        dropdownEventListeners.push({ element: trigger, event: 'click', handler: toggleHandler });
        
        // Handle option selection
        options.forEach(option => {
            const optionHandler = (e) => {
                e.stopPropagation();
                
                const value = option.dataset.value;
                
                // Validate value
                if (!value || typeof value !== 'string') {
                    console.error('[Ryco] Invalid option value:', value);
                    return;
                }
                
                // Update UI
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                valueDisplay.textContent = value;
                
                // Update hidden select
                hiddenSelect.value = value;
                
                // Update settings with validation
                if (provider && settings.selectedModels) {
                    settings.selectedModels[provider] = value;
                    saveSettings({ selectedModels: settings.selectedModels });
                }
                
                // Close dropdown
                dropdown.classList.remove('open');
            };
            
            option.addEventListener('click', optionHandler);
            dropdownEventListeners.push({ element: option, event: 'click', handler: optionHandler });
        });
    });
    
    // Close dropdowns when clicking outside (use capture phase for better performance)
    const outsideClickHandler = (e) => {
        if (!e.target.closest('.ryco-select')) {
            document.querySelectorAll('.ryco-select.open').forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    };
    
    document.addEventListener('click', outsideClickHandler, true);
    dropdownEventListeners.push({ element: document, event: 'click', handler: outsideClickHandler, capture: true });
    
    // Close dropdowns on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.ryco-select.open').forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    };
    
    document.addEventListener('keydown', escapeHandler);
    dropdownEventListeners.push({ element: document, event: 'keydown', handler: escapeHandler });
}

/**
 * Clean up dropdown event listeners to prevent memory leaks
 */
function cleanupDropdownListeners() {
    dropdownEventListeners.forEach(({ element, event, handler, capture }) => {
        if (element && handler) {
            element.removeEventListener(event, handler, capture || false);
        }
    });
    dropdownEventListeners = [];
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
let saveSettingsPending = false;
let saveSettingsQueue = [];

async function saveSettings(partial) {
    // Queue the save if one is already in progress
    if (saveSettingsPending) {
        saveSettingsQueue.push(partial);
        return;
    }
    
    saveSettingsPending = true;
    
    try {
        await chrome.runtime.sendMessage({
            type: 'RYCO_UPDATE_SETTINGS',
            settings: partial
        });
        
        // Process queued saves
        while (saveSettingsQueue.length > 0) {
            const queuedPartial = saveSettingsQueue.shift();
            await chrome.runtime.sendMessage({
                type: 'RYCO_UPDATE_SETTINGS',
                settings: queuedPartial
            });
        }
    } catch (error) {
        console.error('Failed to save settings:', error);
        // Clear queue on error to prevent infinite retry
        saveSettingsQueue = [];
    } finally {
        saveSettingsPending = false;
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
document.addEventListener('DOMContentLoaded', () => {
    init().catch(error => {
        console.error('[Ryco] Fatal initialization error:', error);
        showErrorState('Critical error loading extension. Please reinstall.');
    });
});
