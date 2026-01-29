# Ryco - Multi-LLM AI Assistant Browser Extension

<div align="center">

![Ryco Logo](icons/icon-128.png)

**Premium AI assistant that works anywhere on the web**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://www.google.com/chrome/)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant)
[![GitHub Stars](https://img.shields.io/github/stars/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant?style=social)](https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/stargazers)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [API Keys](#api-keys) • [Models](#supported-models) • [Contributing](#contributing)

**[Detailed Installation Guide](INSTALL.md)** | **[Changelog](CHANGELOG.md)**

</div>

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant.git

# Load in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the ryco-ai-assistant folder

# Configure
1. Click Ryco icon
2. Add your API key (get free at build.nvidia.com)
3. Start using: @Ryco [your prompt]//
```

**Note:** Always end your prompt with double slashes `//` to trigger the AI response.

---

## Overview

Ryco is a powerful browser extension that brings AI assistance to any text field on the web. Simply type `@Ryco` followed by your prompt and `//`, and get instant AI-generated responses from multiple LLM providers.

**Trigger Format:** `@Ryco [your prompt here]//`

**Example:** `@Ryco write a professional email//`

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
- Detects Quill, TinyMCE, ProseMirror, Draft.js editors

### Premium UI/UX
- Draggable command bar - move it anywhere on screen
- Real-time streaming responses
- Dark and light themes
- Clean, professional formatting
- Smooth animations and transitions
- Responsive design

### Security & Privacy
- AES-256 encryption for API keys
- Secure local storage
- No data collection
- No external tracking
- Your data stays between you and your chosen AI provider

### Performance
- Instant trigger detection
- Debounced input handling
- Efficient Shadow DOM implementation
- Minimal memory footprint
- Fast response streaming

## Installation

### From Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant.git
   cd ryco-ai-assistant
   ```

2. **Load in Chrome/Edge**
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `ryco-ai-assistant` folder

3. **Configure API Keys**
   - Click the Ryco extension icon
   - Go to "API Keys" tab
   - Enter your API keys
   - Select your preferred provider

### From Release (Coming Soon)
Download the latest `.zip` from [Releases](https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/releases) and follow step 2 above.

## API Keys

Get your free API keys from:

| Provider | Get API Key | Free Tier |
|----------|-------------|-----------|
| **NVIDIA NIM** | [build.nvidia.com](https://build.nvidia.com) | Yes |
| **Google Gemini** | [aistudio.google.com](https://aistudio.google.com/apikey) | Yes |
| **OpenAI** | [platform.openai.com](https://platform.openai.com/api-keys) | Paid (free trial) |

## Usage

### Basic Usage

**Trigger Format:**
```
@Ryco [your prompt here]//
```

**Important:** The trigger must end with double slashes `//`

1. Click on any text field on any website
2. Type: `@Ryco your prompt here//`
3. Wait for the AI response to appear in the command bar
4. Choose an action:
   - **Insert** - Add response to text field
   - **Copy** - Copy to clipboard
   - **Cancel** - Discard response

### Examples

**Email Writing**
```
@Ryco write a professional leave request email for tomorrow//
```

**Code Generation**
```
@Ryco create a Python function to sort a list of dictionaries by a key//
```

**Content Creation**
```
@Ryco write a LinkedIn post about AI in healthcare//
```

**Translation**
```
@Ryco translate "Hello, how are you?" to Spanish//
```

**Summarization**
```
@Ryco summarize this article in 3 bullet points: [paste article]//
```

**Business Writing**
```
@Ryco draft a meeting agenda for project kickoff//
```

**Quick Answers**
```
@Ryco what is the capital of France//
```

### Keyboard Shortcuts

- `Enter` - Insert response
- `Esc` - Cancel and close
- Drag the header to move the command bar

## Supported Models

### NVIDIA NIM (15 Models)

**Meta Llama**
- `meta/llama-3.1-70b-instruct`
- `meta/llama-3.1-405b-instruct`
- `nvidia/llama-3.1-nemotron-70b-instruct`

**OpenAI GPT-OSS (Open Source)**
- `openai/gpt-oss-120b` - 120B reasoning model
- `openai/gpt-oss-20b` - 20B efficient model

**DeepSeek**
- `deepseek-ai/deepseek-r1` - 671B reasoning model
- `deepseek-ai/deepseek-r1-0528` - Enhanced reasoning
- `deepseek-ai/deepseek-v3.1` - Hybrid AI model
- `deepseek-ai/deepseek-v3.1-terminus` - Improved stability
- `deepseek-ai/deepseek-v3.2` - Latest version

**Mistral AI**
- `mistralai/mistral-large-3-675b-instruct-2512` - Flagship model
- `mistralai/mistral-small-24b-instruct-2501` - Efficient model
- `mistralai/mistral-7b-instruct-v0.3` - Compact model
- `mistralai/mixtral-8x7b-instruct-v0.1` - MoE model
- `mistralai/mixtral-8x22b-instruct-v0.1` - Large MoE

### Google Gemini (4 Models)
- `gemini-3-pro-preview` - Most intelligent with SOTA reasoning
- `gemini-3-flash-preview` - Fast with frontier intelligence
- `gemini-flash-latest` - Latest Flash model (auto-updates)
- `gemini-flash-lite-latest` - Lightweight, cost-effective

### OpenAI (4 Models)
- `gpt-4o` - Most capable
- `gpt-4o-mini` - Fast and efficient
- `gpt-4-turbo` - Advanced reasoning
- `gpt-3.5-turbo` - Fast and affordable

## Configuration

### Settings Panel

Access via extension icon → Settings

**Provider Selection**
- Choose between NVIDIA NIM, Gemini, or OpenAI
- Each provider has its own API key

**Model Selection**
- Select your preferred model for each provider
- Models are automatically loaded based on provider

**Theme**
- Dark mode (default)
- Light mode
- Syncs across all command bars

## Project Structure

```
ryco-ai-assistant/
├── manifest.json           # Extension configuration
├── background.js          # Service worker (API handling)
├── content.js            # Content script (trigger detection)
├── popup.html            # Settings UI
├── popup.js              # Settings logic
├── icons/                # Extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── styles/               # CSS files
│   ├── tokens.css       # Design tokens
│   ├── inject.css       # Command bar styles
│   └── popup.css        # Settings panel styles
└── README.md            # This file
```

## Development

### Prerequisites
- Chrome/Edge browser
- Text editor (VS Code recommended)
- Basic knowledge of JavaScript

### Local Development

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Ryco extension
4. Test your changes

### Testing

Test on various websites:
- Gmail (contenteditable)
- Twitter (textarea)
- Slack (rich text editor)
- Notion (custom editor)
- LinkedIn (standard input)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Test on multiple websites
- Update documentation
- Add comments for complex logic

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Mohammad Faiz** - Creator and Developer
- NVIDIA for NIM API access
- Google for Gemini API
- OpenAI for GPT models
- All open-source contributors

## Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/discussions)
- **GitHub**: [@Mohammad-Faiz-Cloud-Engineer](https://github.com/Mohammad-Faiz-Cloud-Engineer)

## Roadmap

- [ ] Firefox extension support
- [ ] Safari extension support
- [ ] Custom model endpoints
- [ ] Conversation history
- [ ] Prompt templates
- [ ] Team collaboration features
- [ ] Chrome Web Store publication
- [ ] Multi-language support
- [ ] Voice input support
- [ ] Custom keyboard shortcuts

## Repository Stats

![GitHub repo size](https://img.shields.io/github/repo-size/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant)
![GitHub code size](https://img.shields.io/github/languages/code-size/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant)
![GitHub last commit](https://img.shields.io/github/last-commit/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant)

## Star History

If you find Ryco useful, please consider giving it a star on GitHub!

---

<div align="center">

**Made with care by Mohammad Faiz**

[Back to Top](#ryco---multi-llm-ai-assistant-browser-extension)

</div>
