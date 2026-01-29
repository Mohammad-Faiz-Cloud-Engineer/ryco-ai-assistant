# Installation Guide

## Method 1: Install from Source (GitHub)

### Prerequisites
- Google Chrome, Microsoft Edge, or Brave browser
- Git (optional, for cloning)

### Step-by-Step Installation

1. **Download the Extension**
   
   **Option A: Using Git**
   ```bash
   git clone https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant.git
   cd ryco-ai-assistant
   ```
   
   **Option B: Download ZIP**
   - Go to https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant
   - Click the green "Code" button
   - Select "Download ZIP"
   - Extract the ZIP file to a folder

2. **Load Extension in Browser**
   
   **For Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `ryco-ai-assistant` folder
   - The Ryco icon should appear in your extensions toolbar
   
   **For Edge:**
   - Open Edge and navigate to `edge://extensions/`
   - Enable "Developer mode" (toggle in left sidebar)
   - Click "Load unpacked"
   - Select the `ryco-ai-assistant` folder
   - The Ryco icon should appear in your extensions toolbar
   
   **For Brave:**
   - Open Brave and navigate to `brave://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `ryco-ai-assistant` folder
   - The Ryco icon should appear in your extensions toolbar

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

## Method 2: Install from Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon for one-click installation.

## Verification

To verify the installation worked:

1. Go to any website with a text field (e.g., Gmail, Twitter)
2. Click in a text field
3. Type: `@Ryco hello//`
4. You should see the Ryco command bar appear with a response

## Troubleshooting

### Extension Not Loading
- Make sure you selected the correct folder (the one containing `manifest.json`)
- Check that "Developer mode" is enabled
- Try restarting your browser

### Trigger Not Working
- Make sure you type the full trigger: `@Ryco your prompt//`
- The trigger must end with double slashes `//`
- Try clicking in the text field first

### API Key Issues
- Verify your API key is correct
- Check that you have credits/quota remaining
- Use the "Test Connection" button to verify

### Command Bar Not Appearing
- Check browser console for errors (F12 → Console tab)
- Try reloading the extension
- Make sure the website allows extensions

## Updating the Extension

To update to the latest version:

1. **Using Git:**
   ```bash
   cd ryco-ai-assistant
   git pull origin main
   ```

2. **Manual Update:**
   - Download the latest version from GitHub
   - Replace the old folder with the new one
   - Go to `chrome://extensions/`
   - Click the refresh icon on the Ryco extension

3. **Reload Extension:**
   - Go to `chrome://extensions/`
   - Find Ryco
   - Click the refresh/reload icon

## Uninstallation

To remove Ryco:

1. Go to `chrome://extensions/`
2. Find Ryco in the list
3. Click "Remove"
4. Confirm removal

Your API keys are stored locally and will be deleted with the extension.

## Getting Help

If you encounter issues:

- Check the [README](README.md) for usage instructions
- Search [GitHub Issues](https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/issues)
- Open a new issue if your problem isn't listed
- Join [GitHub Discussions](https://github.com/Mohammad-Faiz-Cloud-Engineer/ryco-ai-assistant/discussions)

## Privacy & Security

- All API keys are encrypted with AES-256-GCM
- Keys are stored locally in your browser
- No data is sent to external servers (except your chosen AI provider)
- No tracking or analytics
- Open source - you can review the code

## Next Steps

After installation:
- Read the [Usage Guide](README.md#usage) for examples
- Explore different AI models
- Try it on various websites
- Customize your theme and settings

Enjoy using Ryco!
