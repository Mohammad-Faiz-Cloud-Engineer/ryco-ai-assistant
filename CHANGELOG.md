# Changelog

All notable changes to Ryco will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-01-29

### Added
- **User Details Tab** - Comprehensive profile management in extension popup
- Personal information fields (name, role, company, industry)
- Professional details (experience level, skills, goals)
- Communication preferences (tone, language, timezone)
- Custom context field for additional user notes
- Privacy notice explaining local-only storage
- User context integration in all AI requests
- Smart context builder (only includes filled fields)
- Gemini API safety settings to prevent content blocking
- Production-grade form validation and error handling

### Fixed
- **Critical:** Google Gemini safety settings (prevents response blocking)
- Gemini streaming now includes all 4 safety categories with BLOCK_NONE
- User profile data persistence across sessions
- Form field loading and saving with proper async handling

### Changed
- User context automatically prepended to system prompts
- All providers (NVIDIA, Gemini, OpenAI) now receive user context
- Enhanced Gemini request handler with user context parameter
- Settings storage now includes userDetails object
- Extension initialization includes userDetails default

### Improved
- AI responses now personalized based on user profile
- Context-aware suggestions matching user preferences
- Tone matching user's selected communication style
- Language-appropriate responses
- Industry-specific recommendations
- Better error feedback in popup UI
- Form UX with organized field groups and helpful placeholders

### Security
- All user data stored locally (never sent to external servers)
- Input sanitization with .trim() on all text fields
- No XSS vulnerabilities (plain text only)
- Privacy-first approach with transparent notice

## [1.1.0] - 2026-01-29

### Added
- Comprehensive logging for Google Gemini streaming
- Real Ryco logo integration in command bar
- Performance metrics tracking (events, chunks, bytes)
- Safety settings for Gemini API to prevent content filtering
- Enhanced error messages with detailed context
- API key masking in console logs for security

### Fixed
- Google Gemini streaming response issues
- SSE (Server-Sent Events) event parsing with proper double newline separation
- Buffer management for incomplete events at chunk boundaries
- Logo display in command bar (broken image issue)
- Web accessible resources configuration for icons

### Changed
- Enhanced Gemini streaming implementation with production-grade SSE parsing
- Improved buffer handling for streaming responses
- Optimized memory management with better cleanup
- Updated logo from SVG placeholder to actual Ryco logo image
- Enhanced CSS styling for logo display

### Improved
- Performance optimizations for DOM operations
- Memory efficiency with WeakSet tracking
- Error handling throughout codebase
- Code quality to corporate production-grade standards
- Security with proper API key masking

### Removed
- All redundant code and unused functions
- SVG placeholder logo
- Em dashes replaced with standard hyphens

## [1.0.0] - 2026-01-29

### Added
- Initial release of Ryco AI Assistant
- Multi-provider support (NVIDIA NIM, Google Gemini, OpenAI)
- 20+ AI models including:
  - DeepSeek-R1, DeepSeek-V3 series
  - Mistral Large, Mistral Small, Mixtral series
  - OpenAI GPT-OSS (120B, 20B)
  - Meta Llama 3.1 series
  - Google Gemini 3 Pro Preview, Gemini 3 Flash Preview, Gemini Flash Latest
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
- MutationObserver for dynamic content detection
- Support for popular rich text editors (Quill, TinyMCE, ProseMirror, Draft.js)

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
- Code of conduct in CONTRIBUTING.md

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
[1.0.0]: https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/releases/tag/v1.0.0
