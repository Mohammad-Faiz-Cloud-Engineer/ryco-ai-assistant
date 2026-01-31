/**
 * Ryco Content Script
 * Trigger detection engine and Shadow DOM command palette injector
 */

(() => {
    'use strict';

    // ========== Configuration ==========
    const TRIGGER_PATTERN = /@Ryco\s+(.+?)\/\/$/im;
    const DEBOUNCE_DELAY = 100; // Optimized for snappier UX

    // ========== State ==========
    let currentTheme = 'dark';
    let activeCommandBar = null;
    let toastContainer = null;
    let currentRequestId = null;
    let activeElement = null;
    let triggerMatch = null;

    // ========== Utility Functions ==========
    function generateId() {
        return `ryco-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    function debounce(fn, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    }

    function getElementValue(element) {
        if (element.isContentEditable) {
            return element.innerText || element.textContent;
        }
        return element.value || '';
    }

    function setElementValue(element, value) {
        if (element.isContentEditable) {
            element.innerText = value;
        } else {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function getCaretPosition(element) {
        if (element.isContentEditable) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                return range.startOffset;
            }
            return 0;
        }
        return element.selectionStart || 0;
    }

    // ========== Theme Loading ==========
    async function loadTheme() {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'RYCO_GET_THEME' });
            if (response?.success) {
                currentTheme = response.theme;
            }
        } catch (e) {
            // Use default theme
        }
    }

    // ========== Shadow DOM Setup ==========
    function createShadowHost() {
        const host = document.createElement('ryco-root');
        host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
        document.body.appendChild(host);

        const shadow = host.attachShadow({ mode: 'closed' });
        return { host, shadow };
    }

    async function injectStyles(shadow) {
        const tokensUrl = chrome.runtime.getURL('styles/tokens.css');
        const injectUrl = chrome.runtime.getURL('styles/inject.css');

        const [tokensRes, injectRes] = await Promise.all([
            fetch(tokensUrl),
            fetch(injectUrl)
        ]);

        const [tokensCSS, injectCSS] = await Promise.all([
            tokensRes.text(),
            injectRes.text()
        ]);

        const style = document.createElement('style');
        style.textContent = tokensCSS + '\n' + injectCSS;
        shadow.appendChild(style);
    }

    // ========== Icons ==========
    const ICONS = {
        logo: null, // Will use image instead
        success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
        error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
        close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
        insert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>`
    };

    // ========== Toast Notification System ==========
    function initToastContainer() {
        if (toastContainer) return;

        const { host, shadow } = createShadowHost();
        host.style.cssText = 'all: initial;';

        injectStyles(shadow).then(() => {
            const wrapper = document.createElement('div');
            wrapper.setAttribute('data-theme', currentTheme);

            const container = document.createElement('div');
            container.className = 'ryco-toast-container';

            wrapper.appendChild(container);
            shadow.appendChild(wrapper);

            toastContainer = { host, shadow, container, wrapper };
        });
    }

    function showToast(type, title, message, duration = 4000) {
        if (!toastContainer) {
            initToastContainer();
            setTimeout(() => showToast(type, title, message, duration), 100);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `ryco-toast ${type}`;
        toast.innerHTML = `
      <div class="ryco-toast-icon">${ICONS[type] || ICONS.info}</div>
      <div class="ryco-toast-content">
        <div class="ryco-toast-title">${title}</div>
        <div class="ryco-toast-message">${message}</div>
      </div>
      <button class="ryco-toast-close">${ICONS.close}</button>
    `;

        const closeBtn = toast.querySelector('.ryco-toast-close');
        const dismissToast = () => {
            toast.classList.add('dismissing');
            setTimeout(() => toast.remove(), 200);
        };

        closeBtn.addEventListener('click', dismissToast);
        if (duration > 0) {
            setTimeout(dismissToast, duration);
        }

        toastContainer.container.appendChild(toast);
    }

    // ========== Command Bar ==========
    async function showCommandBar(element, prompt, matchInfo) {
        // Close existing command bar
        closeCommandBar();

        activeElement = element;
        triggerMatch = matchInfo;
        currentRequestId = generateId();

        const { host, shadow } = createShadowHost();

        await injectStyles(shadow);

        // Get settings for provider info
        let providerName = 'AI';
        let providerKey = 'openai';
        try {
            const response = await chrome.runtime.sendMessage({ type: 'RYCO_GET_SETTINGS' });
            if (response?.success) {
                providerKey = response.settings.activeProvider;
                providerName = response.providers[providerKey]?.name || 'AI';
            }
        } catch (e) { }

        // Create wrapper with theme
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-theme', currentTheme);

        // Position the command bar near the element
        const rect = element.getBoundingClientRect();
        const barWidth = 420;
        const barHeight = 280;
        const padding = 16;

        let top, left;

        // Try to position above the element first
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;

        if (spaceAbove >= barHeight + padding) {
            // Enough space above - position above
            top = rect.top - barHeight - 12;
        } else if (spaceBelow >= barHeight + padding) {
            // Not enough space above, but enough below - position below
            top = rect.bottom + 12;
        } else {
            // Not enough space either way - center vertically with padding
            top = Math.max(padding, (window.innerHeight - barHeight) / 2);
        }

        // Horizontal positioning
        left = rect.left;

        // Adjust for viewport boundaries
        if (left + barWidth > window.innerWidth - padding) {
            left = window.innerWidth - barWidth - padding;
        }
        if (left < padding) {
            left = padding;
        }

        // Ensure top doesn't go off screen
        if (top + barHeight > window.innerHeight - padding) {
            top = window.innerHeight - barHeight - padding;
        }
        if (top < padding) {
            top = padding;
        }

        const commandBar = document.createElement('div');
        commandBar.className = 'ryco-command-bar';
        commandBar.style.top = `${top}px`;
        commandBar.style.left = `${left}px`;

        commandBar.innerHTML = `
      <div class="ryco-command-container">
        <header class="ryco-header ryco-draggable">
          <div class="ryco-logo">
            <img src="${chrome.runtime.getURL('icons/icon-48.png')}" alt="Ryco" class="ryco-logo-icon-img">
            <span class="ryco-logo-text">RYCO</span>
          </div>
          <div class="ryco-provider-badge" data-provider="${providerKey}">
            <span class="ryco-provider-dot"></span>
            <span>${providerName}</span>
          </div>
        </header>
        
        <div class="ryco-content">
          <div class="ryco-prompt-display">${escapeHtml(prompt)}</div>
          <div class="ryco-response-area">
            <div class="ryco-loading-skeleton ryco-shimmer">
              <div class="ryco-skeleton-line"></div>
              <div class="ryco-skeleton-line"></div>
              <div class="ryco-skeleton-line"></div>
            </div>
          </div>
        </div>
        
        <footer class="ryco-footer">
          <div class="ryco-shortcut">
            <span class="ryco-kbd">↵</span> Insert
            <span class="ryco-kbd">Esc</span> Cancel
          </div>
          <div class="ryco-actions">
            <button class="ryco-btn ryco-btn-ghost" data-action="cancel">
              ${ICONS.close} Cancel
            </button>
            <button class="ryco-btn ryco-btn-ghost" data-action="copy">
              ${ICONS.copy} Copy
            </button>
            <button class="ryco-btn ryco-btn-primary" data-action="insert">
              ${ICONS.insert} Insert
            </button>
          </div>
        </footer>
      </div>
    `;

        wrapper.appendChild(commandBar);
        shadow.appendChild(wrapper);

        activeCommandBar = {
            host,
            shadow,
            wrapper,
            commandBar,
            responseArea: commandBar.querySelector('.ryco-response-area'),
            loadingSkeleton: commandBar.querySelector('.ryco-loading-skeleton'),
            response: '',
            requestId: currentRequestId
        };

        // Setup action handlers
        setupCommandBarActions(activeCommandBar);

        // Setup drag functionality
        setupDragFunctionality(commandBar);

        // Send request to background
        sendPromptToBackground(prompt);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function setupDragFunctionality(commandBar) {
        const header = commandBar.querySelector('.ryco-draggable');
        if (!header) return;

        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        header.style.cursor = 'move';

        const dragStart = (e) => {
            // Prevent text selection during drag
            e.preventDefault();
            
            const rect = commandBar.getBoundingClientRect();
            initialX = e.clientX - rect.left;
            initialY = e.clientY - rect.top;

            isDragging = true;
            commandBar.style.transition = 'none';
        };

        const drag = (e) => {
            if (!isDragging) return;

            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Keep within viewport bounds with padding
            const padding = 16;
            const barRect = commandBar.getBoundingClientRect();
            const maxX = window.innerWidth - barRect.width - padding;
            const maxY = window.innerHeight - barRect.height - padding;

            currentX = Math.max(padding, Math.min(currentX, maxX));
            currentY = Math.max(padding, Math.min(currentY, maxY));

            commandBar.style.left = `${currentX}px`;
            commandBar.style.top = `${currentY}px`;
        };

        const dragEnd = () => {
            isDragging = false;
            commandBar.style.transition = '';
        };

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        // Cleanup on close
        const cleanup = () => {
            header.removeEventListener('mousedown', dragStart);
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
        };

        // Store cleanup function for later use
        commandBar._dragCleanup = cleanup;
    }

    function setupCommandBarActions(bar) {
        const cancelBtn = bar.commandBar.querySelector('[data-action="cancel"]');
        const copyBtn = bar.commandBar.querySelector('[data-action="copy"]');
        const insertBtn = bar.commandBar.querySelector('[data-action="insert"]');

        cancelBtn?.addEventListener('click', () => {
            closeCommandBar();
            showToast('info', 'Cancelled', 'Response discarded');
        });

        copyBtn?.addEventListener('click', () => {
            navigator.clipboard.writeText(bar.response);
            showToast('success', 'Copied', 'Response copied to clipboard');
        });

        insertBtn?.addEventListener('click', () => {
            insertResponse();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeydown);
    }

    function handleKeydown(e) {
        if (!activeCommandBar) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closeCommandBar();
        } else if (e.key === 'Enter' && !e.shiftKey) {
            if (activeCommandBar.response) {
                e.preventDefault();
                insertResponse();
            }
        }
    }

    function insertResponse() {
        if (!activeCommandBar || !activeElement || !triggerMatch) return;

        const currentValue = getElementValue(activeElement);
        const newValue = currentValue.substring(0, triggerMatch.start) +
            activeCommandBar.response +
            currentValue.substring(triggerMatch.end);

        setElementValue(activeElement, newValue);
        closeCommandBar();

        showToast('success', 'Inserted', 'Response inserted successfully');
    }

    function closeCommandBar() {
        if (activeCommandBar) {
            activeCommandBar.commandBar.classList.add('closing');
            
            // Cleanup drag listeners
            if (activeCommandBar.commandBar._dragCleanup) {
                activeCommandBar.commandBar._dragCleanup();
            }
            
            setTimeout(() => {
                activeCommandBar.host.remove();
                activeCommandBar = null;
            }, 200);
        }

        document.removeEventListener('keydown', handleKeydown);
        activeElement = null;
        triggerMatch = null;
        currentRequestId = null;
    }

    async function sendPromptToBackground(prompt) {
        if (!activeCommandBar) return;
        
        try {
            await chrome.runtime.sendMessage({
                type: 'RYCO_CHAT',
                prompt,
                requestId: currentRequestId
            });
        } catch (error) {
            console.error('[Ryco] Failed to send prompt:', error);
            showToast('error', 'Error', error.message || 'Failed to send request');
            closeCommandBar();
        }
    }

    // ========== Stream Handler ==========
    chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
        if (message.type === 'RYCO_STREAM_CHUNK') {
            handleStreamChunk(message);
        }
        return false;
    });

    function handleStreamChunk(message) {
        if (!activeCommandBar || message.requestId !== activeCommandBar.requestId) {
            return;
        }

        try {
            // Hide loading skeleton on first chunk
            if (activeCommandBar.loadingSkeleton) {
                activeCommandBar.loadingSkeleton.remove();
                activeCommandBar.loadingSkeleton = null;
                activeCommandBar.responseArea.innerHTML = '';
            }

            if (message.chunk) {
                activeCommandBar.response += message.chunk;
                activeCommandBar.responseArea.innerHTML =
                    escapeHtml(activeCommandBar.response) +
                    (message.isDone ? '' : '<span class="ryco-cursor"></span>');
            }

            if (message.isDone) {
                // Remove cursor when done
                const cursor = activeCommandBar.responseArea.querySelector('.ryco-cursor');
                cursor?.remove();
            }
        } catch (error) {
            console.error('[Ryco] Stream chunk error:', error);
        }
    }

    // ========== Trigger Detection ==========
    function checkForTrigger(element) {
        const value = getElementValue(element);
        const match = value.match(TRIGGER_PATTERN);

        if (match) {
            const prompt = match[1].trim();
            if (prompt.length < 2) return; // Minimum prompt length

            const matchStart = match.index;
            const matchEnd = matchStart + match[0].length;

            // Check if we're at the end of the trigger (user finished typing)
            const caretPos = getCaretPosition(element);
            if (caretPos >= matchEnd || value.charAt(matchEnd) === '\n' || matchEnd === value.length) {
                showCommandBar(element, prompt, {
                    start: matchStart,
                    end: matchEnd,
                    fullMatch: match[0]
                });
            }
        }
    }

    const debouncedCheck = debounce((element) => {
        checkForTrigger(element);
    }, DEBOUNCE_DELAY);

    function isEditableElement(element) {
        if (!element) return false;

        const tagName = element.tagName?.toLowerCase();
        
        // Standard input fields
        if (tagName === 'input') {
            const type = element.type?.toLowerCase();
            // Support more input types
            return ['text', 'search', 'email', 'url', 'tel', 'number', ''].includes(type);
        }
        
        // Textarea
        if (tagName === 'textarea') return true;
        
        // ContentEditable elements
        if (element.isContentEditable) return true;
        if (element.getAttribute('contenteditable') === 'true') return true;
        
        // Check for common rich text editor attributes
        if (element.getAttribute('role') === 'textbox') return true;
        if (element.classList?.contains('ql-editor')) return true; // Quill editor
        if (element.classList?.contains('tox-edit-area')) return true; // TinyMCE
        if (element.classList?.contains('ProseMirror')) return true; // ProseMirror
        if (element.classList?.contains('DraftEditor-editorContainer')) return true; // Draft.js
        
        return false;
    }

    // ========== Event Listeners ==========
    function handleInput(e) {
        const element = e.target;
        if (isEditableElement(element)) {
            debouncedCheck(element);
        }
    }

    function handleKeyUp(e) {
        // Check on space key as trigger ends with space + text
        if (e.key === ' ' || e.key === 'Enter' || e.key === '/') {
            const element = e.target;
            if (isEditableElement(element)) {
                debouncedCheck(element);
            }
        }
    }

    // Track elements to prevent duplicate listeners
    const trackedElements = new WeakSet();

    // Use capturing to catch events before they're handled
    document.addEventListener('input', handleInput, true);
    document.addEventListener('keyup', handleKeyUp, true);
    
    // Also listen on focus to catch dynamically added elements
    document.addEventListener('focus', (e) => {
        if (isEditableElement(e.target) && !trackedElements.has(e.target)) {
            trackedElements.add(e.target);
            e.target.addEventListener('input', handleInput);
            e.target.addEventListener('keyup', handleKeyUp);
        }
    }, true);

    // ========== MutationObserver for Dynamic Content ==========
    const trackedDynamicElements = new WeakSet();
    
    const observerCallback = debounce((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if the added node is an editable element
                    if (isEditableElement(node) && !trackedDynamicElements.has(node)) {
                        trackedDynamicElements.add(node);
                        node.addEventListener('input', handleInput);
                        node.addEventListener('keyup', handleKeyUp);
                    }
                    // Check for editable children
                    const editables = node.querySelectorAll?.('input, textarea, [contenteditable="true"]');
                    editables?.forEach(el => {
                        if (isEditableElement(el) && !trackedDynamicElements.has(el)) {
                            trackedDynamicElements.add(el);
                            el.addEventListener('input', handleInput);
                            el.addEventListener('keyup', handleKeyUp);
                        }
                    });
                }
            }
        }
    }, DEBOUNCE_DELAY);

    const observer = new MutationObserver(observerCallback);

    // Start observing when DOM is ready
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        // Wait for body to be available
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // ========== Initialize ==========
    loadTheme();
    initToastContainer();

    console.log('Ryco Content Script loaded');
})();
