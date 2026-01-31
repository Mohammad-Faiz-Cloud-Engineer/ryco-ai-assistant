#!/bin/bash

# Ryco Extension Release Script
# This script helps create a new release

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Ryco Extension Release Creator${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo -e "${RED}❌ Error: manifest.json not found!${NC}"
    echo "Please run this script from the repository root."
    exit 1
fi

# Get current version from manifest
CURRENT_VERSION=$(grep -oP '"version":\s*"\K[^"]+' manifest.json)
echo -e "Current version: ${YELLOW}$CURRENT_VERSION${NC}"
echo ""

# Ask for new version
read -p "Enter new version (e.g., 1.4.1): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    echo -e "${RED}❌ Error: Version cannot be empty${NC}"
    exit 1
fi

# Validate version format (x.y.z)
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}❌ Error: Invalid version format. Use x.y.z (e.g., 1.4.1)${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 Release Checklist:${NC}"
echo ""

# Check if CHANGELOG.md has entry for new version
if grep -q "\[$NEW_VERSION\]" CHANGELOG.md; then
    echo -e "${GREEN}✅${NC} CHANGELOG.md has entry for v$NEW_VERSION"
else
    echo -e "${YELLOW}⚠️${NC}  CHANGELOG.md doesn't have entry for v$NEW_VERSION"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo "Aborted."
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️${NC}  You have uncommitted changes"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo "Aborted."
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🔄 Updating version...${NC}"

# Update manifest.json version
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" manifest.json
rm manifest.json.bak 2>/dev/null || true

echo -e "${GREEN}✅${NC} Updated manifest.json: $CURRENT_VERSION → $NEW_VERSION"

# Show what will be committed
echo ""
echo -e "${BLUE}📋 Changes to be committed:${NC}"
git diff manifest.json

echo ""
read -p "Commit these changes? (y/n): " COMMIT

if [ "$COMMIT" = "y" ]; then
    # Commit changes
    git add manifest.json
    git commit -m "Release v$NEW_VERSION"
    echo -e "${GREEN}✅${NC} Changes committed"
    
    # Create tag
    echo ""
    read -p "Create git tag v$NEW_VERSION? (y/n): " CREATE_TAG
    
    if [ "$CREATE_TAG" = "y" ]; then
        git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"
        echo -e "${GREEN}✅${NC} Tag v$NEW_VERSION created"
        
        # Push
        echo ""
        read -p "Push to origin (main + tag)? (y/n): " PUSH
        
        if [ "$PUSH" = "y" ]; then
            git push origin main
            git push origin "v$NEW_VERSION"
            echo ""
            echo -e "${GREEN}✅ Release v$NEW_VERSION pushed!${NC}"
            echo ""
            echo -e "${BLUE}🎉 GitHub Actions will now:${NC}"
            echo "  1. Build the extension package"
            echo "  2. Create source code archive"
            echo "  3. Generate release notes"
            echo "  4. Create GitHub Release"
            echo ""
            echo -e "${BLUE}📍 Check progress at:${NC}"
            echo "  https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
        else
            echo ""
            echo -e "${YELLOW}⚠️${NC}  Changes committed and tagged locally but not pushed."
            echo "To push later, run:"
            echo "  git push origin main"
            echo "  git push origin v$NEW_VERSION"
        fi
    else
        echo ""
        echo -e "${YELLOW}⚠️${NC}  Changes committed but tag not created."
        echo "To create tag later, run:"
        echo "  git tag -a v$NEW_VERSION -m \"Release version $NEW_VERSION\""
        echo "  git push origin main"
        echo "  git push origin v$NEW_VERSION"
    fi
else
    # Revert changes
    git checkout manifest.json
    echo -e "${YELLOW}⚠️${NC}  Changes reverted. No release created."
fi

echo ""
echo -e "${GREEN}Done!${NC}"
