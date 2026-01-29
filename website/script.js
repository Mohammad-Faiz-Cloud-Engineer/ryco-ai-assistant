/**
 * Ryco Website JavaScript
 * Interactive functionality for the static website
 */

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
- Ryco Version: [e.g. 1.0.0]
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

[1.0.0]: https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/releases/tag/v1.0.0`
};

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Install tabs
const installTabs = document.querySelectorAll('.install-tab');
const installPanels = document.querySelectorAll('.install-panel');

installTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        installTabs.forEach(t => t.classList.remove('active'));
        installPanels.forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${targetTab}-panel`).classList.add('active');
    });
});

// Download Modal
function showDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Documentation Modal
function showDocModal(docType) {
    const modal = document.getElementById('docModal');
    const title = document.getElementById('docModalTitle');
    const content = document.getElementById('docModalContent');
    
    const titles = {
        readme: 'README',
        install: 'Installation Guide',
        contributing: 'Contributing Guidelines',
        changelog: 'Changelog'
    };
    
    title.textContent = titles[docType] || 'Documentation';
    content.innerHTML = formatMarkdown(docs[docType] || 'Documentation not found.');
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDocModal() {
    const modal = document.getElementById('docModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modals on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeDownloadModal();
        closeDocModal();
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDownloadModal();
        closeDocModal();
    }
});

// Simple markdown formatter
function formatMarkdown(markdown) {
    let html = markdown;
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
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
    
    return html;
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && !href.includes('onclick')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards, model providers, and doc cards
document.querySelectorAll('.feature-card, .model-provider, .doc-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

console.log('Ryco website loaded successfully');