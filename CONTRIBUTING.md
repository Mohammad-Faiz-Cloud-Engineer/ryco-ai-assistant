# Contributing to Ryco

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
```markdown
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

**Additional context**
Any other context about the problem.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title** - Use a descriptive title
- **Detailed description** - Explain the enhancement and why it would be useful
- **Examples** - Provide examples of how it would work
- **Mockups** - If applicable, include mockups or screenshots

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test thoroughly** on multiple websites
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

**Pull Request Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Gmail
- [ ] Tested on Twitter
- [ ] Tested on Slack
- [ ] Tested on other sites: [list]

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Development Setup

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/ryco-ai-assistant.git
   cd ryco-ai-assistant
   ```
   
   *Note: Replace YOUR-USERNAME with your GitHub username*

2. **Load extension in browser**
   - Open `chrome://extensions/`
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
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Add JSDoc comments for functions
- Keep functions small and focused
- Use meaningful variable names

**Example:**
```javascript
/**
 * Checks if an element is editable
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if element is editable
 */
function isEditableElement(element) {
    if (!element) return false;
    // Implementation
}
```

### CSS Style

- Use CSS custom properties (variables)
- Follow BEM naming convention
- Keep selectors specific but not overly nested
- Group related properties
- Add comments for complex styles

**Example:**
```css
/* Command Bar Container */
.ryco-command-bar {
    position: fixed;
    z-index: var(--ryco-z-modal);
    /* More properties */
}
```

### Commit Messages

Follow the conventional commits specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add support for TinyMCE editor
fix: command bar positioning on small screens
docs: update installation instructions
style: format code with prettier
refactor: simplify trigger detection logic
```

## Testing Guidelines

### Manual Testing Checklist

Test on these websites:
- [ ] Gmail (contenteditable)
- [ ] Twitter (textarea)
- [ ] LinkedIn (standard input)
- [ ] Slack (rich text editor)
- [ ] Notion (custom editor)
- [ ] Discord (custom input)
- [ ] GitHub (textarea)
- [ ] Reddit (textarea)

Test these scenarios:
- [ ] Trigger detection works
- [ ] Command bar appears correctly
- [ ] Streaming responses work
- [ ] Insert functionality works
- [ ] Copy functionality works
- [ ] Cancel functionality works
- [ ] Drag functionality works
- [ ] Theme switching works
- [ ] API key encryption works
- [ ] Model switching works

### Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Brave (latest)

## Documentation

When adding new features:
- Update README.md
- Add JSDoc comments
- Update GITHUB.md if needed
- Add examples in documentation

## Questions?

Feel free to:
- Open an issue with the `question` label
- Start a discussion in GitHub Discussions
- Reach out to the maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to Ryco!
