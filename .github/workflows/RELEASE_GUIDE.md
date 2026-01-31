# 🚀 Automated Release Guide

This guide explains how to use the automated GitHub Actions workflows to build and release your extension.

---

## 📋 Available Workflows

### 1. **Release Workflow** (`release.yml`)
Automatically builds and creates GitHub releases with downloadable extension packages.

### 2. **Validation Workflow** (`validate.yml`)
Validates extension files, checks syntax, and ensures quality before release.

### 3. **Static Pages Workflow** (`static.yml`)
Deploys the website (Web folder) to GitHub Pages.

---

## 🎯 How to Create a Release

### Method 1: Using Git Tags (Recommended)

1. **Update version in manifest.json**
   ```bash
   # Edit manifest.json and update version to 1.4.0
   ```

2. **Commit your changes**
   ```bash
   git add .
   git commit -m "Release v1.4.0"
   ```

3. **Create and push a version tag**
   ```bash
   git tag v1.4.0
   git push origin main
   git push origin v1.4.0
   ```

4. **GitHub Actions will automatically:**
   - ✅ Validate the manifest version matches the tag
   - ✅ Build the extension package
   - ✅ Create source code archive
   - ✅ Generate release notes from CHANGELOG.md
   - ✅ Create a GitHub Release
   - ✅ Upload both ZIP files as release assets

### Method 2: Manual Trigger

1. **Go to GitHub Actions tab**
   - Navigate to your repository on GitHub
   - Click "Actions" tab
   - Select "Build and Release Extension"

2. **Click "Run workflow"**
   - Select branch (usually `main`)
   - Enter version number (e.g., `1.4.0`)
   - Click "Run workflow"

3. **Wait for completion**
   - The workflow will build and create the release
   - Check the "Releases" page for the new release

---

## 📦 What Gets Released

Each release includes two ZIP files:

### 1. Extension Package
**Filename:** `ryco-ai-assistant-v1.4.0.zip`

**Contains:**
- manifest.json
- background.js
- content.js
- popup.js
- popup.html
- styles/ (all CSS files)
- icons/ (all icon files)

**Excludes:**
- .git, .github, .vscode
- node_modules
- Web/ (website files)
- Documentation files (*.md)
- .gitignore, .DS_Store

**Use for:** Installing the extension in Chrome/Edge/Brave

### 2. Source Code Archive
**Filename:** `ryco-ai-assistant-source-v1.4.0.zip`

**Contains:** Complete source code including:
- All extension files
- Website files (Web/)
- Documentation (README.md, CHANGELOG.md, etc.)
- GitHub workflows

**Use for:** Development, code review, or building from source

---

## 📝 Release Notes

Release notes are automatically extracted from `CHANGELOG.md`.

**Format your CHANGELOG.md like this:**

```markdown
# Changelog

## [1.4.0] - 2026-02-01

### Added
- New feature 1
- New feature 2

### Fixed
- Bug fix 1
- Bug fix 2

### Changed
- Improvement 1
- Improvement 2

## [1.3.0] - 2026-01-30
...
```

The workflow will automatically extract the section for your version.

---

## ✅ Pre-Release Checklist

Before creating a release, ensure:

- [ ] Version updated in `manifest.json`
- [ ] `CHANGELOG.md` updated with new version
- [ ] All changes committed and pushed
- [ ] Code tested locally
- [ ] No console.log statements in production code
- [ ] All files validated (run validation workflow)

---

## 🔍 Validation Workflow

The validation workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual trigger

**What it checks:**
- ✅ manifest.json is valid JSON
- ✅ Required fields present in manifest
- ✅ All required files exist
- ✅ JavaScript syntax is valid
- ✅ File sizes are reasonable
- ✅ CSS files are present

**To run manually:**
1. Go to Actions tab
2. Select "Validate Extension"
3. Click "Run workflow"

---

## 🎨 Website Deployment

The static pages workflow automatically deploys your website to GitHub Pages.

**Triggers:**
- Push to `main` branch
- Manual trigger

**What it does:**
- Deploys the `Web/` folder to GitHub Pages
- Makes your website available at: `https://yourusername.github.io/ryco-ai-assistant/`

---

## 🛠️ Troubleshooting

### Release workflow fails with "Version mismatch"

**Problem:** manifest.json version doesn't match the git tag

**Solution:**
```bash
# If tag is v1.4.0, manifest.json must have "version": "1.4.0"
# Update manifest.json and create a new tag
git tag -d v1.4.0  # Delete old tag
git push origin :refs/tags/v1.4.0  # Delete remote tag
# Update manifest.json
git add manifest.json
git commit -m "Fix version"
git tag v1.4.0
git push origin main
git push origin v1.4.0
```

### Release not appearing

**Check:**
1. Go to Actions tab and verify workflow completed successfully
2. Check "Releases" page (not "Tags")
3. Ensure you have write permissions to the repository

### ZIP file is too large

**Solution:**
- Check for large files: `find . -type f -size +1M`
- Remove unnecessary files
- Ensure node_modules is excluded

---

## 📊 Workflow Status

You can check workflow status:

1. **Actions Tab:** See all workflow runs
2. **Badges:** Add status badges to README.md
3. **Notifications:** GitHub will email you on failures

---

## 🔐 Permissions

The workflows require these permissions:
- `contents: write` - To create releases and upload assets
- `pages: write` - To deploy to GitHub Pages
- `id-token: write` - For GitHub Pages deployment

These are automatically granted by GitHub Actions.

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Creating Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [GitHub Pages](https://docs.github.com/en/pages)

---

## 🎉 Quick Start

**To create your first automated release:**

```bash
# 1. Update version
vim manifest.json  # Change version to 1.4.0

# 2. Update changelog
vim CHANGELOG.md  # Add release notes

# 3. Commit and tag
git add .
git commit -m "Release v1.4.0"
git tag v1.4.0

# 4. Push
git push origin main
git push origin v1.4.0

# 5. Wait for GitHub Actions to complete
# 6. Check Releases page for your new release!
```

---

**That's it! Your extension will be automatically built and released.** 🚀
