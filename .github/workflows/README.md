# GitHub Actions Workflows

This directory contains automated workflows for the Ryco AI Assistant extension.

## 📋 Workflows

### 🚀 release.yml
**Purpose:** Automatically build and release the extension

**Triggers:**
- Git tags matching `v*.*.*` (e.g., v1.4.0)
- Manual trigger with version input

**What it does:**
1. Validates manifest.json version matches tag
2. Creates extension package (ZIP)
3. Creates source code archive (ZIP)
4. Generates release notes from CHANGELOG.md
5. Creates GitHub Release with both ZIPs

**Usage:**
```bash
git tag v1.4.0
git push origin v1.4.0
```

---

### ✅ validate.yml
**Purpose:** Validate extension files and code quality

**Triggers:**
- Push to main/develop branches
- Pull requests to main/develop
- Manual trigger

**What it checks:**
- manifest.json validity
- Required files presence
- JavaScript syntax
- File sizes
- Common issues

**Usage:** Runs automatically on push/PR

---

### 🌐 static.yml
**Purpose:** Deploy website to GitHub Pages

**Triggers:**
- Push to main branch
- Manual trigger

**What it does:**
- Deploys Web/ folder to GitHub Pages
- Makes website available at GitHub Pages URL

**Usage:** Runs automatically on push to main

---

## 🎯 Quick Commands

### Create a Release
```bash
# Update manifest.json version to 1.4.0
git add manifest.json CHANGELOG.md
git commit -m "Release v1.4.0"
git tag v1.4.0
git push origin main
git push origin v1.4.0
```

### Run Validation
```bash
# Validation runs automatically on push
git push origin main

# Or trigger manually from GitHub Actions tab
```

### Deploy Website
```bash
# Deploys automatically when you push to main
git push origin main
```

---

## 📦 Release Assets

Each release includes:

1. **Extension Package** (`ryco-ai-assistant-v1.4.0.zip`)
   - Ready to install in Chrome/Edge/Brave
   - Contains only extension files
   - Excludes documentation and website

2. **Source Code** (`ryco-ai-assistant-source-v1.4.0.zip`)
   - Complete source code
   - Includes everything (extension + website + docs)
   - For development and code review

---

## 🔧 Configuration

All workflows use:
- Ubuntu latest runner
- Standard GitHub Actions
- No external dependencies
- Automatic permissions

---

## 📚 Documentation

See [RELEASE_GUIDE.md](../RELEASE_GUIDE.md) for detailed instructions.

---

## ✅ Status

All workflows are:
- ✅ Production-ready
- ✅ Fully automated
- ✅ Well-documented
- ✅ Error-handled

---

**Need help?** Check the [RELEASE_GUIDE.md](../RELEASE_GUIDE.md) or GitHub Actions logs.
