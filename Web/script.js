/**
 * Ryco Website JavaScript
 * Interactive functionality for the static website
 */

// ============================================
// THEME MANAGEMENT SYSTEM
// ============================================

/**
 * Theme Manager - Handles automatic system theme detection and real-time switching
 * Follows corporate-level best practices for theme management
 */
const ThemeManager = {
    // Theme constants
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark',
        AUTO: 'auto'
    },
    
    STORAGE_KEY: 'ryco-theme-preference',
    
    /**
     * Initialize theme system
     */
    init() {
        // Load saved preference or default to auto
        const savedTheme = this.getSavedTheme();
        this.applyTheme(savedTheme);
        
        // Listen for system theme changes
        this.watchSystemTheme();
        
        // Listen for storage changes (sync across tabs)
        this.watchStorageChanges();
        
        console.log('Theme Manager initialized:', savedTheme);
    },
    
    /**
     * Get saved theme preference from localStorage
     */
    getSavedTheme() {
        try {
            return localStorage.getItem(this.STORAGE_KEY) || this.THEMES.AUTO;
        } catch (e) {
            console.warn('Failed to read theme preference:', e);
            return this.THEMES.AUTO;
        }
    },
    
    /**
     * Save theme preference to localStorage
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.STORAGE_KEY, theme);
        } catch (e) {
            console.warn('Failed to save theme preference:', e);
        }
    },
    
    /**
     * Get current system theme preference
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return this.THEMES.DARK;
        }
        return this.THEMES.LIGHT;
    },
    
    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === this.THEMES.AUTO) {
            // Remove manual theme attribute, let CSS media query handle it
            root.removeAttribute('data-theme');
        } else {
            // Set manual theme
            root.setAttribute('data-theme', theme);
        }
        
        // Save preference
        this.saveTheme(theme);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme, effectiveTheme: this.getEffectiveTheme() }
        }));
    },
    
    /**
     * Get the effective theme (what's actually displayed)
     */
    getEffectiveTheme() {
        const savedTheme = this.getSavedTheme();
        if (savedTheme === this.THEMES.AUTO) {
            return this.getSystemTheme();
        }
        return savedTheme;
    },
    
    /**
     * Watch for system theme changes and apply automatically
     */
    watchSystemTheme() {
        if (!window.matchMedia) return;
        
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Handler function for theme changes
        const handleThemeChange = (e) => {
            const savedTheme = this.getSavedTheme();
            // Only react if user is on auto mode
            if (savedTheme === this.THEMES.AUTO) {
                console.log('System theme changed:', e.matches ? 'dark' : 'light');
                // Trigger re-render by dispatching event
                window.dispatchEvent(new CustomEvent('themechange', { 
                    detail: { 
                        theme: this.THEMES.AUTO, 
                        effectiveTheme: e.matches ? this.THEMES.DARK : this.THEMES.LIGHT 
                    }
                }));
            }
        };
        
        // Use modern addEventListener (supported in all modern browsers)
        try {
            darkModeQuery.addEventListener('change', handleThemeChange);
        } catch (e) {
            // Fallback for older browsers (though deprecated, still supported)
            try {
                darkModeQuery.addListener(handleThemeChange);
            } catch (err) {
                console.warn('Unable to watch system theme changes:', err);
            }
        }
    },
    
    /**
     * Watch for storage changes to sync theme across tabs
     */
    watchStorageChanges() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY && e.newValue) {
                console.log('Theme synced from another tab:', e.newValue);
                this.applyTheme(e.newValue);
            }
        });
    },
    
    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const currentTheme = this.getEffectiveTheme();
        const newTheme = currentTheme === this.THEMES.DARK ? this.THEMES.LIGHT : this.THEMES.DARK;
        this.applyTheme(newTheme);
        return newTheme;
    },
    
    /**
     * Set specific theme
     */
    setTheme(theme) {
        if (Object.values(this.THEMES).includes(theme)) {
            this.applyTheme(theme);
        } else {
            console.warn('Invalid theme:', theme);
        }
    }
};

// Initialize theme system immediately (before DOM ready for no flash)
ThemeManager.init();

// Documentation content
const docs = {
    readme: `# Ryco - Multi-LLM AI Assistant Browser Extension

**Premium AI assistant that works anywhere on the web**

## Overview

Ryco is a powerful browser extension that brings AI assistance to any text field on the web. Simply type \`@Ryco\` followed by your prompt and \`//\`, and get instant AI-generated responses from multiple LLM providers.

**Trigger Format:** \`@Ryco [your prompt here]//\`

**Example:** \`@Ryco write a professional email//\`

Created by **Mohammad Faiz**

## Features

### Multi-Provider Support
- **NVIDIA NIM** - 15+ models including DeepSeek-R1, Mistral Large, GPT-OSS
- **Google Gemini** - Gemini 3 Pro Preview, Gemini 3 Flash Preview, Gemini Flash Latest
- **OpenAI** - GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo

### Universal Compatibility
- Works on **any website** with text input
- Supports Gmail, Slack, Twitter, LinkedIn, Notion, Discord, and more
- Compatible with standard inputs, textareas, and rich text editors

### Premium UI/UX
- Draggable command bar - move it anywhere on screen
- Real-time streaming responses
- Dark and light themes
- Clean, professional formatting

### Security & Privacy
- AES-256 encryption for API keys
- Secure local storage
- No data collection
- No external tracking

## Usage

### Basic Usage

**Trigger Format:**
\`\`\`
@Ryco [your prompt here]//
\`\`\`

**Important:** The trigger must end with double slashes \`//\`

1. Click on any text field on any website
2. Type: \`@Ryco your prompt here//\`
3. Wait for the AI response to appear in the command bar
4. Choose an action:
   - **Insert** - Add response to text field
   - **Copy** - Copy to clipboard
   - **Cancel** - Discard response

### Examples

**Email Writing**
\`\`\`
@Ryco write a professional leave request email for tomorrow//
\`\`\`

**Code Generation**
\`\`\`
@Ryco create a Python function to sort a list of dictionaries by a key//
\`\`\`

**Content Creation**
\`\`\`
@Ryco write a LinkedIn post about AI in healthcare//
\`\`\`

**Translation**
\`\`\`
@Ryco translate "Hello, how are you?" to Spanish//
\`\`\`

## Supported Models

### NVIDIA NIM (15 Models)
- Meta Llama 3.1 series
- OpenAI GPT-OSS (120B, 20B)
- DeepSeek-R1, DeepSeek-V3 series
- Mistral Large, Mistral Small, Mixtral series

### Google Gemini (4 Models)
- Gemini 3 Pro Preview
- Gemini 3 Flash Preview
- Gemini Flash Latest
- Gemini Flash Lite Latest

### OpenAI (4 Models)
- GPT-4o
- GPT-4o Mini
- GPT-4 Turbo
- GPT-3.5 Turbo

## API Keys

Get your free API keys from:

| Provider | Get API Key | Free Tier |
|----------|-------------|-----------|
| **NVIDIA NIM** | [build.nvidia.com](https://build.nvidia.com) | Yes |
| **Google Gemini** | [aistudio.google.com](https://aistudio.google.com/apikey) | Yes |
| **OpenAI** | [platform.openai.com](https://platform.openai.com/api-keys) | Paid (free trial) |

## License

This project is licensed under the MIT License.

## Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/issues)
- **GitHub**: [@Mohammad-Faiz-Cloud-Engineer](https://github.com/Mohammad-Faiz-Cloud-Engineer)

---

**Made with care by Mohammad Faiz**`,

    install: `# Installation Guide

## Method 1: Install from Source (GitHub)

### Prerequisites
- Google Chrome, Microsoft Edge, or Brave browser
- Git (optional, for cloning)

### Step-by-Step Installation

1. **Download the Extension**
   
   **Option A: Using Git**
   \`\`\`bash
   git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant.git
   cd ryco-ai-assistant
   \`\`\`
   
   **Option B: Download ZIP**
   - Go to https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant
   - Click the green "Code" button
   - Select "Download ZIP"
   - Extract the ZIP file to a folder

2. **Load Extension in Browser**
   
   **For Chrome:**
   - Open Chrome and navigate to \`chrome://extensions/\`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the \`ryco-ai-assistant\` folder
   - The Ryco icon should appear in your extensions toolbar
   
   **For Edge:**
   - Open Edge and navigate to \`edge://extensions/\`
   - Enable "Developer mode" (toggle in left sidebar)
   - Click "Load unpacked"
   - Select the \`ryco-ai-assistant\` folder
   
   **For Brave:**
   - Open Brave and navigate to \`brave://extensions/\`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the \`ryco-ai-assistant\` folder

3. **Configure API Keys**
   
   - Click the Ryco extension icon in your toolbar
   - Go to the "API Keys" tab
   - Choose your preferred provider:
     - **NVIDIA NIM** (Recommended for free tier): Get key at https://build.nvidia.com
     - **Google Gemini**: Get key at https://aistudio.google.com/apikey
     - **OpenAI**: Get key at https://platform.openai.com/api-keys
   - Enter your API key and click "Test Connection"
   - Click "Save All Keys"

4. **Select Your Model**
   
   - Go to the "Models" tab
   - Select your preferred AI model from the dropdown
   - The extension will remember your choice

5. **Choose Your Theme**
   
   - Go to the "Settings" tab
   - Select Dark or Light theme
   - Theme applies immediately

## Verification

To verify the installation worked:

1. Go to any website with a text field (e.g., Gmail, Twitter)
2. Click in a text field
3. Type: \`@Ryco hello//\`
4. You should see the Ryco command bar appear with a response

## Troubleshooting

### Extension Not Loading
- Make sure you selected the correct folder (the one containing \`manifest.json\`)
- Check that "Developer mode" is enabled
- Try restarting your browser

### Trigger Not Working
- Make sure you type the full trigger: \`@Ryco your prompt//\`
- The trigger must end with double slashes \`//\`
- Try clicking in the text field first

### API Key Issues
- Verify your API key is correct
- Check that you have credits/quota remaining
- Use the "Test Connection" button to verify

## Updating the Extension

To update to the latest version:

1. **Using Git:**
   \`\`\`bash
   cd ryco-ai-assistant
   git pull origin main
   \`\`\`

2. **Manual Update:**
   - Download the latest version from GitHub
   - Replace the old folder with the new one
   - Go to \`chrome://extensions/\`
   - Click the refresh icon on the Ryco extension

## Privacy & Security

- All API keys are encrypted with AES-256-GCM
- Keys are stored locally in your browser
- No data is sent to external servers (except your chosen AI provider)
- No tracking or analytics
- Open source - you can review the code

Enjoy using Ryco!`,

    contributing: `# Contributing to Ryco

First off, thank you for considering contributing to Ryco! It's people like you that make Ryco such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
\`\`\`markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Type '@Ryco ...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g. Chrome 120]
- OS: [e.g. Windows 11]
- Ryco Version: [e.g. 1.1.0]
- Website: [e.g. gmail.com]
\`\`\`

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title** - Use a descriptive title
- **Detailed description** - Explain the enhancement and why it would be useful
- **Examples** - Provide examples of how it would work
- **Mockups** - If applicable, include mockups or screenshots

### Pull Requests

1. **Fork the repo** and create your branch from \`main\`
2. **Make your changes** following our coding standards
3. **Test thoroughly** on multiple websites
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Setup

1. **Clone your fork**
   \`\`\`bash
   git clone https://github.com/YOUR-USERNAME/ryco-ai-assistant.git
   cd ryco-ai-assistant
   \`\`\`

2. **Load extension in browser**
   - Open \`chrome://extensions/\`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project folder

3. **Make changes and test**
   - Edit files
   - Reload extension
   - Test on various websites

## Coding Standards

### JavaScript Style

- Use ES6+ features
- Use \`const\` and \`let\`, avoid \`var\`
- Use arrow functions where appropriate
- Add JSDoc comments for functions
- Keep functions small and focused
- Use meaningful variable names

### CSS Style

- Use CSS custom properties (variables)
- Follow BEM naming convention
- Keep selectors specific but not overly nested
- Group related properties
- Add comments for complex styles

### Commit Messages

Follow the conventional commits specification:

- \`feat:\` - New feature
- \`fix:\` - Bug fix
- \`docs:\` - Documentation changes
- \`style:\` - Code style changes (formatting)
- \`refactor:\` - Code refactoring
- \`test:\` - Adding tests
- \`chore:\` - Maintenance tasks

**Examples:**
\`\`\`
feat: add support for TinyMCE editor
fix: command bar positioning on small screens
docs: update installation instructions
\`\`\`

## Testing Guidelines

### Manual Testing Checklist

Test on these websites:
- Gmail (contenteditable)
- Twitter (textarea)
- LinkedIn (standard input)
- Slack (rich text editor)
- Notion (custom editor)
- Discord (custom input)

Test these scenarios:
- Trigger detection works
- Command bar appears correctly
- Streaming responses work
- Insert functionality works
- Copy functionality works
- Cancel functionality works

## Questions?

Feel free to:
- Open an issue with the \`question\` label
- Start a discussion in GitHub Discussions
- Reach out to the maintainers

Thank you for contributing to Ryco!`,

    changelog: `# Changelog

All notable changes to Ryco will be documented in this file.

## [1.1.0] - 2025-01-29

### Added
- Comprehensive logging for Google Gemini streaming
- Real Ryco logo integration in command bar
- Performance metrics tracking
- Safety settings for Gemini API

### Fixed
- Google Gemini streaming response issues
- SSE event parsing with proper buffer management
- Logo display in command bar

### Improved
- Performance optimizations
- Memory efficiency
- Error handling
- Code quality to production-grade standards

## [1.0.0] - 2025-01-29

### Added
- Initial release of Ryco AI Assistant
- Multi-provider support (NVIDIA NIM, Google Gemini, OpenAI)
- 20+ AI models including:
  - DeepSeek-R1, DeepSeek-V3 series
  - Mistral Large, Mistral Small, Mixtral series
  - OpenAI GPT-OSS (120B, 20B)
  - Meta Llama 3.1 series
  - Google Gemini 3 Pro Preview, Gemini 3 Flash Preview
  - OpenAI GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
- Universal trigger system (@Ryco prompt//)
- Works on any website with text input
- Support for standard inputs, textareas, and rich text editors
- Draggable command bar interface
- Real-time streaming responses
- Dark and light theme support
- AES-256 API key encryption
- Professional formatting for business content
- Copy, Insert, and Cancel actions
- Keyboard shortcuts (Enter to insert, Esc to cancel)

### Optimized
- Ultra-fast response generation with optimized system prompts
- Reduced temperature (0.5) for faster, more focused responses
- Streamlined prompt engineering for minimal latency
- Concise system instructions for quicker LLM processing

### Security
- Implemented AES-256-GCM encryption for API keys
- Secure local storage
- No external data collection or tracking

### Documentation
- Comprehensive README with installation and usage instructions
- Contributing guidelines
- MIT License

---

## Future Releases

### [Planned] - TBD
- Firefox extension support
- Safari extension support
- Custom model endpoints
- Conversation history
- Prompt templates
- Team collaboration features
- Chrome Web Store publication
- Multi-language support
- Voice input support
- Custom keyboard shortcuts

---

[1.1.0]: https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/releases/tag/v1.1.0
[1.0.0]: https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/releases/tag/v1.0.0`
};

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.setAttribute('aria-expanded', 
            navMenu.classList.contains('active') ? 'true' : 'false'
        );
    });
}

// Theme toggle button
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        ThemeManager.toggle();
        
        // Add a subtle animation feedback
        themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 300);
    });
}

// Install tabs
const installTabs = document.querySelectorAll('.install-tab');
const installPanels = document.querySelectorAll('.install-panel');

if (installTabs.length > 0 && installPanels.length > 0) {
    installTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            const targetPanel = document.getElementById(`${targetTab}-panel`);
            
            if (targetPanel) {
                installTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                installPanels.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                targetPanel.classList.add('active');
            }
        });
    });
}

// Download Modal
function showDownloadModal() {
    const modal = document.getElementById('downloadModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus trap - focus first focusable element
        const focusableElements = modal.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        modal.setAttribute('aria-hidden', 'true');
    }
}

// Documentation Modal
function showDocModal(docType) {
    const modal = document.getElementById('docModal');
    const title = document.getElementById('docModalTitle');
    const content = document.getElementById('docModalContent');
    
    if (!modal || !title || !content) return;
    
    const titles = {
        readme: 'README',
        install: 'Installation Guide',
        contributing: 'Contributing Guidelines',
        changelog: 'Changelog'
    };
    
    title.textContent = titles[docType] || 'Documentation';
    
    const docContent = docs[docType];
    if (docContent) {
        content.innerHTML = formatMarkdown(docContent);
    } else {
        content.innerHTML = '<p>Documentation not found.</p>';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus trap
    const focusableElements = modal.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
}

function closeDocModal() {
    const modal = document.getElementById('docModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        modal.setAttribute('aria-hidden', 'true');
    }
}

// Close modals on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
        closeDownloadModal();
        closeDocModal();
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const downloadModal = document.getElementById('downloadModal');
        const docModal = document.getElementById('docModal');
        
        if (downloadModal && downloadModal.classList.contains('active')) {
            closeDownloadModal();
        }
        if (docModal && docModal.classList.contains('active')) {
            closeDocModal();
        }
    }
});

// Simple markdown formatter with security improvements
function formatMarkdown(markdown) {
    if (!markdown || typeof markdown !== 'string') return '';
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    let html = markdown;
    
    // Code blocks (preserve content)
    const codeBlocks = [];
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
        return placeholder;
    });
    
    // Inline code (preserve content)
    const inlineCodes = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
        const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
        inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
        return placeholder;
    });
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Links (with security attributes)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Paragraphs
    html = html.split('\n\n').map(para => {
        if (!para.match(/^<[h|u|o|p|l]/)) {
            return '<p>' + para + '</p>';
        }
        return para;
    }).join('\n');
    
    // Restore code blocks
    codeBlocks.forEach((block, i) => {
        html = html.replace(`__CODE_BLOCK_${i}__`, block);
    });
    
    // Restore inline codes
    inlineCodes.forEach((code, i) => {
        html = html.replace(`__INLINE_CODE_${i}__`, code);
    });
    
    return html;
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just # or has onclick handler
        if (href === '#' || this.getAttribute('onclick')) {
            return;
        }
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update URL without triggering scroll
            if (history.pushState) {
                history.pushState(null, null, href);
            }
        }
    });
});

// Animate elements on scroll with performance optimization
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            // Unobserve after animation to improve performance
            animateOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe feature cards, model providers, and doc cards
document.querySelectorAll('.feature-card, .model-provider, .doc-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    animateOnScroll.observe(el);
});

// ============================================
// THEME CHANGE LISTENER
// ============================================

// Listen for theme changes and log them (can be extended for UI updates)
window.addEventListener('themechange', (e) => {
    console.log('Theme changed:', e.detail);
    // You can add additional UI updates here if needed
    // For example, updating a theme toggle button state
});

// ============================================
// EXPOSE THEME MANAGER GLOBALLY
// ============================================

// Make ThemeManager available globally for console access and debugging
window.RycoTheme = ThemeManager;

console.log('Ryco website loaded successfully');
console.log('Theme system active. Current theme:', ThemeManager.getEffectiveTheme());
console.log('Use RycoTheme.toggle() to switch themes or RycoTheme.setTheme("light"|"dark"|"auto")');
