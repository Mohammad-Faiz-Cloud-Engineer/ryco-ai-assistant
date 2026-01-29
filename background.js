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
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-3-flash-preview',
    models: [
      'gemini-3-pro-preview',
      'gemini-3-flash-preview',
      'gemini-flash-latest',
      'gemini-flash-lite-latest'
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
    'apiKeys',
    'userDetails'
  ]);
  
  return {
    activeProvider: result.activeProvider || 'openai',
    selectedModels: result.selectedModels || {},
    theme: result.theme || 'dark',
    apiKeys: result.apiKeys || {},
    userDetails: result.userDetails || {}
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

// ========== User Context Builder ==========
function buildUserContext(userDetails) {
  if (!userDetails || Object.keys(userDetails).length === 0) return '';
  
  const parts = [];
  
  if (userDetails.name) parts.push(`Name: ${userDetails.name}`);
  if (userDetails.role) parts.push(`Role: ${userDetails.role}`);
  if (userDetails.company) parts.push(`Company: ${userDetails.company}`);
  if (userDetails.industry) parts.push(`Industry: ${userDetails.industry}`);
  if (userDetails.experience) parts.push(`Experience: ${userDetails.experience}`);
  if (userDetails.skills) parts.push(`Skills: ${userDetails.skills}`);
  if (userDetails.goals) parts.push(`Goals: ${userDetails.goals}`);
  if (userDetails.tone) parts.push(`Preferred tone: ${userDetails.tone}`);
  if (userDetails.language) parts.push(`Language: ${userDetails.language}`);
  if (userDetails.timezone) parts.push(`Timezone: ${userDetails.timezone}`);
  if (userDetails.context) parts.push(`Additional context: ${userDetails.context}`);
  
  if (parts.length === 0) return '';
  
  return `User Profile: ${parts.join(', ')}.`;
}

// ========== API Request Handler ==========
async function sendChatRequest(prompt, streamCallback) {
  const settings = await getSettings();
  const provider = PROVIDERS[settings.activeProvider];
  const apiKey = await getActiveApiKey();
  const model = await getActiveModel();
  
  if (!apiKey) {
    throw new Error(`No API key configured for ${provider.name}`);
  }
  
  // Build user context
  const userContext = buildUserContext(settings.userDetails);
  
  // Handle Gemini separately due to different API format
  if (settings.activeProvider === 'gemini') {
    return await sendGeminiRequest(prompt, model, apiKey, streamCallback, userContext);
  }
  
  // OpenAI-compatible format for NVIDIA and OpenAI
  console.log(`[${settings.activeProvider.toUpperCase()}] Sending request to:`, model);
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  
  const messages = [
    {
      role: 'system',
      content: 'You are Ryco by Mohammad Faiz. Be extremely concise and direct. No introductions, no preambles, no filler. Get straight to the answer immediately. Keep responses brief and actionable.'
    },
    {
      role: 'system',
      content: 'Format: Plain text only. No markdown, no asterisks, no brackets, no symbols. Write naturally like a human. For emails/business content, be professional but concise.'
    }
  ];
  
  if (userContext) {
    messages.push({
      role: 'system',
      content: userContext
    });
  }
  
  messages.push({
    role: 'user',
    content: prompt
  });
  
  const body = {
    model: model,
    messages: messages,
    stream: true,
    temperature: 0.5
  };
  
  try {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    console.log(`[${settings.activeProvider.toUpperCase()}] Response status:`, response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[${settings.activeProvider.toUpperCase()}] Error response:`, errorData);
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }
    
    // Handle SSE streaming
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let fullResponse = '';
    let buffer = '';
    let chunkCount = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`[${settings.activeProvider.toUpperCase()}] Stream complete. Total chunks:`, chunkCount);
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            if (!data) continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                chunkCount++;
                fullResponse += content;
                streamCallback(content, false);
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    console.log(`[${settings.activeProvider.toUpperCase()}] Full response length:`, fullResponse.length);
    streamCallback('', true);
    return fullResponse;
    
  } catch (error) {
    console.error(`[${settings.activeProvider.toUpperCase()}] Request error:`, error);
    throw error;
  }
}

// ========== Gemini-specific Request Handler ==========
async function sendGeminiRequest(prompt, model, apiKey, streamCallback, userContext = '') {
  let systemPrompt = `You are Ryco by Mohammad Faiz. Be extremely concise and direct. No introductions, no preambles, no filler. Get straight to the answer immediately. Keep responses brief and actionable. Format: Plain text only. No markdown, no asterisks, no brackets, no symbols. Write naturally like a human. For emails/business content, be professional but concise.`;
  
  if (userContext) {
    systemPrompt += ` ${userContext}`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemPrompt + '\n\nUser: ' + prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.5,
      candidateCount: 1
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE'
      }
    ]
  };
  
  console.log('[Gemini] Sending request to:', model);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    console.log('[Gemini] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Gemini] Error response:', errorData);
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let fullResponse = '';
    let buffer = '';
    let chunkCount = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('[Gemini] Stream complete. Total chunks:', chunkCount);
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        // Gemini SSE format: data: {...}
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (!data) continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (content) {
                chunkCount++;
                fullResponse += content;
                streamCallback(content, false);
              }
            } catch (e) {
              console.error('[Gemini] Parse error:', e, 'Line:', data.substring(0, 100));
            }
          }
        }
      }
      
      // Process any remaining buffer
      if (buffer.trim() && buffer.startsWith('data: ')) {
        try {
          const data = buffer.slice(6).trim();
          const parsed = JSON.parse(data);
          const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            fullResponse += content;
            streamCallback(content, false);
          }
        } catch (e) {
          console.error('[Gemini] Final buffer parse error:', e);
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    console.log('[Gemini] Full response length:', fullResponse.length);
    streamCallback('', true);
    return fullResponse;
    
  } catch (error) {
    console.error('[Gemini] Request error:', error);
    throw error;
  }
}

// ========== Connection Test ==========
async function testConnection(provider, apiKey) {
  const config = PROVIDERS[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  
  console.log(`[TEST] Testing connection for ${provider}...`);
  
  // Handle Gemini separately
  if (provider === 'gemini') {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.defaultModel}:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Hi' }]
        }
      ]
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    console.log(`[TEST] Gemini response status:`, response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[TEST] Gemini error:`, errorData);
      throw new Error(errorData.error?.message || `Connection failed: ${response.status}`);
    }
    
    console.log(`[TEST] Gemini connection successful`);
    return { success: true, provider: config.name };
  }
  
  // OpenAI-compatible format for NVIDIA and OpenAI
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  
  const body = {
    model: config.defaultModel,
    messages: [{ role: 'user', content: 'Hi' }]
  };
  
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  console.log(`[TEST] ${provider.toUpperCase()} response status:`, response.status);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`[TEST] ${provider.toUpperCase()} error:`, errorData);
    throw new Error(errorData.error?.message || `Connection failed: ${response.status}`);
  }
  
  console.log(`[TEST] ${provider.toUpperCase()} connection successful`);
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
      apiKeys: {},
      userDetails: {}
    });
    
    console.log('Ryco installed successfully');
  }
});

// Log service worker activation
console.log('Ryco Background Service Worker loaded');
