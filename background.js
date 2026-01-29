/**
 * Ryco Background Service Worker
 * The central "Brain" that routes requests to NVIDIA, Gemini, or OpenAI
 */

// ========== Crypto Utilities ==========
const CRYPTO_KEY_NAME = 'ryco-encryption-key';

async function getOrCreateCryptoKey() {
  const stored = await chrome.storage.local.get(CRYPTO_KEY_NAME);
  if (stored[CRYPTO_KEY_NAME]) {
    const keyData = new Uint8Array(stored[CRYPTO_KEY_NAME]);
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  const exported = await crypto.subtle.exportKey('raw', key);
  await chrome.storage.local.set({ 
    [CRYPTO_KEY_NAME]: Array.from(new Uint8Array(exported)) 
  });
  
  return key;
}

async function encryptApiKey(plaintext) {
  const key = await getOrCreateCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  
  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext))
  };
}

async function decryptApiKey(encrypted) {
  if (!encrypted || !encrypted.iv || !encrypted.data) return null;
  
  try {
    const key = await getOrCreateCryptoKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encrypted.iv) },
      key,
      new Uint8Array(encrypted.data)
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error('Decryption failed:', e);
    return null;
  }
}

// ========== Provider Configuration ==========
const PROVIDERS = {
  nvidia: {
    name: 'NVIDIA NIM',
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    defaultModel: 'meta/llama-3.1-70b-instruct',
    models: [
      // Meta Llama Models
      'meta/llama-3.1-70b-instruct',
      'meta/llama-3.1-405b-instruct',
      'nvidia/llama-3.1-nemotron-70b-instruct',
      
      // OpenAI GPT-OSS Models (Open Source)
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      
      // DeepSeek Models
      'deepseek-ai/deepseek-r1',
      'deepseek-ai/deepseek-r1-0528',
      'deepseek-ai/deepseek-v3.1',
      'deepseek-ai/deepseek-v3.1-terminus',
      'deepseek-ai/deepseek-v3.2',
      
      // Mistral Models
      'mistralai/mistral-large-3-675b-instruct-2512',
      'mistralai/mixtral-8x7b-instruct-v0.1',
      'mistralai/mixtral-8x22b-instruct-v0.1',
      'mistralai/mistral-7b-instruct-v0.3',
      'mistralai/mistral-small-24b-instruct-2501'
    ],
    supportsStreaming: true
  },
  gemini: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    defaultModel: 'gemini-2.0-flash',
    models: [
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ],
    supportsStreaming: true
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-3.5-turbo'
    ],
    supportsStreaming: true
  }
};

// ========== Storage Utilities ==========
async function getSettings() {
  const result = await chrome.storage.local.get([
    'activeProvider',
    'selectedModels',
    'theme',
    'apiKeys'
  ]);
  
  return {
    activeProvider: result.activeProvider || 'openai',
    selectedModels: result.selectedModels || {},
    theme: result.theme || 'dark',
    apiKeys: result.apiKeys || {}
  };
}

async function getActiveApiKey() {
  const settings = await getSettings();
  const encryptedKey = settings.apiKeys[settings.activeProvider];
  if (!encryptedKey) return null;
  return await decryptApiKey(encryptedKey);
}

async function saveApiKey(provider, key) {
  const settings = await getSettings();
  const encrypted = await encryptApiKey(key);
  settings.apiKeys[provider] = encrypted;
  await chrome.storage.local.set({ apiKeys: settings.apiKeys });
}

async function getActiveModel() {
  const settings = await getSettings();
  const provider = PROVIDERS[settings.activeProvider];
  return settings.selectedModels[settings.activeProvider] || provider.defaultModel;
}

// ========== API Request Handler ==========
async function sendChatRequest(prompt, tabId, streamCallback) {
  const settings = await getSettings();
  const provider = PROVIDERS[settings.activeProvider];
  const apiKey = await getActiveApiKey();
  const model = await getActiveModel();
  
  if (!apiKey) {
    throw new Error(`No API key configured for ${provider.name}`);
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  
  const body = {
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are Ryco, an AI assistant created by Mohammad Faiz.'
      },
      {
        role: 'system',
        content: 'Core Behavior: Get straight to the point. Provide direct, concise answers without unnecessary introductions, preambles, or filler text. Be brief, clear, and actionable.'
      },
      {
        role: 'system',
        content: 'Formatting Rules: Write in clean plain text without markdown symbols. Never use asterisks for bold (**text**), brackets for placeholders [text], or other markup syntax. Use natural punctuation and spacing instead.'
      },
      {
        role: 'system',
        content: 'Professional Communication: When writing emails or business content, maintain a professional tone with proper grammar. Format naturally as a human would write, suitable for corporate environments.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    stream: true,
    max_tokens: 2048,
    temperature: 0.7
  };
  
  try {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }
    
    // Handle SSE streaming
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              streamCallback(content, false);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
    
    streamCallback('', true);
    return fullResponse;
    
  } catch (error) {
    throw error;
  }
}

// ========== Connection Test ==========
async function testConnection(provider, apiKey) {
  const config = PROVIDERS[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  
  const body = {
    model: config.defaultModel,
    messages: [{ role: 'user', content: 'Hi' }],
    max_tokens: 5
  };
  
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Connection failed: ${response.status}`);
  }
  
  return { success: true, provider: config.name };
}

// ========== Message Handler ==========
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handleAsync = async () => {
    try {
      switch (message.type) {
        case 'RYCO_CHAT': {
          const fullResponse = await sendChatRequest(
            message.prompt,
            sender.tab?.id,
            (chunk, isDone) => {
              chrome.tabs.sendMessage(sender.tab.id, {
                type: 'RYCO_STREAM_CHUNK',
                chunk,
                isDone,
                requestId: message.requestId
              });
            }
          );
          return { success: true, response: fullResponse };
        }
        
        case 'RYCO_TEST_CONNECTION': {
          const result = await testConnection(message.provider, message.apiKey);
          return { success: true, ...result };
        }
        
        case 'RYCO_SAVE_API_KEY': {
          await saveApiKey(message.provider, message.apiKey);
          return { success: true };
        }
        
        case 'RYCO_GET_SETTINGS': {
          const settings = await getSettings();
          return { success: true, settings, providers: PROVIDERS };
        }
        
        case 'RYCO_UPDATE_SETTINGS': {
          await chrome.storage.local.set(message.settings);
          return { success: true };
        }
        
        case 'RYCO_GET_THEME': {
          const settings = await getSettings();
          return { success: true, theme: settings.theme };
        }
        
        default:
          return { success: false, error: 'Unknown message type' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  handleAsync().then(sendResponse);
  return true; // Keep channel open for async response
});

// ========== Extension Install Handler ==========
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.local.set({
      activeProvider: 'openai',
      selectedModels: {},
      theme: 'dark',
      apiKeys: {}
    });
    
    console.log('Ryco installed successfully');
  }
});

// Log service worker activation
console.log('Ryco Background Service Worker loaded');
