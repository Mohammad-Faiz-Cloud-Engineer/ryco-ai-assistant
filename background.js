/**
 * Ryco Background Service Worker
 * The central "Brain" that routes requests to NVIDIA, Gemini, or OpenAI
 */

// ========== Performance Constants ==========
/**
 * Performance configuration for extreme unpredictability and human-like output
 * 
 * TEMPERATURE: 1.1 - Above normal maximum for creative, varied responses
 * TOP_K: 40 - Capped for Gemini compatibility (max supported across all models)
 * TOP_P: 0.85 - Lower for more diverse, unexpected token choices
 * FREQUENCY_PENALTY: 0.7 - Strong anti-repetition
 * PRESENCE_PENALTY: 0.6 - Strong topic diversity
 * 
 * IMPACT: Combined with extensive system prompts about casual language,
 * contractions, and avoiding AI patterns, this creates a "stream of consciousness"
 * feel that's distinctly human-like, especially on Gemini 3 Deep-Think models.
 * 
 * TEMPERATURE TUNING GUIDE:
 * - 1.1: Perfect for DeepSeek R1, Llama 3.1 405B, Gemini Deep-Think (creative personality)
 * - 1.0: Balanced for most models (recommended if you see repetition)
 * - 0.9: Safe fallback for GPT-4o-mini (prevents "looping" or weird characters)
 * 
 * TROUBLESHOOTING: If the AI gets "drunk", repeats itself, or outputs strange characters,
 * lower TEMPERATURE to 1.0 or 0.9. This is especially common with smaller models like
 * GPT-4o-mini when temperature is too high.
 */
const PERFORMANCE_CONFIG = {
  TEMPERATURE: 1.1,  // Above normal maximum for extreme unpredictability
  MAX_TOKENS: 8192,
  TOP_P: 0.85,  // Lower for more diverse, unexpected choices
  TOP_K: 40,  // Capped at 40 for Gemini compatibility (max supported)
  FREQUENCY_PENALTY: 0.7,  // Very strong anti-repetition
  PRESENCE_PENALTY: 0.6  // Very strong topic diversity
};

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
    supportsStreaming: true,
    // NVIDIA-specific tuning: Llama models benefit from slightly lower temperature
    performance: {
      temperature: 1.0,  // Balanced for Llama's casual style
      top_p: 0.85,
      frequency_penalty: 0.7,
      presence_penalty: 0.6
    }
  },
 gemini: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-3-flash-preview',
    models: [
      'gemini-3-pro-preview',
      'gemini-3-flash-preview',
      'gemini-3-deep-think', // New specialized reasoning
      'gemini-2.5-flash-lite', // Stable fallback until March shutdown
    ],
    supportsStreaming: true,
    // Gemini-specific tuning: Higher temperature for deep-think reasoning
    performance: {
      temperature: 1.1,  // Enables lateral thinking on deep-think models
      top_p: 0.85,
      top_k: 40,
      frequency_penalty: 0.7,
      presence_penalty: 0.6
    }
  },
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',  // Standard stable endpoint
    defaultModel: 'gpt-4.1',
    models: [
      'gpt-4.1',        // Latest model
      'gpt-4.1-mini',   // Efficient variant
      'gpt-4o',         // Previous generation
      'gpt-4o-mini'     // Previous generation mini
    ],
    supportsStreaming: true,
    // OpenAI-specific tuning: Moderate temperature for professional tone
    performance: {
      temperature: 0.9,  // Balanced creativity without chaos
      top_p: 0.85
    }
  }
};

// ========== Storage Utilities ==========
/**
 * Retrieves and validates settings from chrome storage
 * @returns {Promise<Object>} Settings object with defaults
 */
async function getSettings() {
  try {
    const result = await chrome.storage.local.get([
      'activeProvider',
      'selectedModels',
      'theme',
      'apiKeys',
      'userDetails'
    ]);
    
    // Validate and sanitize settings
    const validProviders = ['nvidia', 'gemini', 'openai'];
    const activeProvider = validProviders.includes(result.activeProvider) 
      ? result.activeProvider 
      : 'openai';
    
    return {
      activeProvider,
      selectedModels: result.selectedModels && typeof result.selectedModels === 'object' 
        ? result.selectedModels 
        : {},
      theme: ['dark', 'light'].includes(result.theme) ? result.theme : 'dark',
      apiKeys: result.apiKeys && typeof result.apiKeys === 'object' 
        ? result.apiKeys 
        : {},
      userDetails: result.userDetails && typeof result.userDetails === 'object' 
        ? result.userDetails 
        : {}
    };
  } catch (error) {
    console.error('[Ryco] Failed to get settings:', error);
    // Return safe defaults
    return {
      activeProvider: 'openai',
      selectedModels: {},
      theme: 'dark',
      apiKeys: {},
      userDetails: {}
    };
  }
}

/**
 * Retrieves and decrypts the active provider's API key
 * @returns {Promise<string|null>} Decrypted API key or null
 */
async function getActiveApiKey() {
  try {
    const settings = await getSettings();
    const encryptedKey = settings.apiKeys[settings.activeProvider];
    if (!encryptedKey) return null;
    return await decryptApiKey(encryptedKey);
  } catch (error) {
    console.error('[Ryco] Failed to get active API key:', error);
    return null;
  }
}

/**
 * Encrypts and saves an API key for a provider
 * @param {string} provider - Provider name (nvidia, gemini, openai)
 * @param {string} key - API key to encrypt and save
 * @returns {Promise<void>}
 */
async function saveApiKey(provider, key) {
  try {
    if (!provider || typeof provider !== 'string') {
      throw new Error('Invalid provider');
    }
    if (!key || typeof key !== 'string' || key.length < 10) {
      throw new Error('Invalid API key');
    }
    
    const settings = await getSettings();
    const encrypted = await encryptApiKey(key);
    settings.apiKeys[provider] = encrypted;
    await chrome.storage.local.set({ apiKeys: settings.apiKeys });
  } catch (error) {
    console.error('[Ryco] Failed to save API key:', error);
    throw error;
  }
}

/**
 * Gets the active model for the current provider
 * @returns {Promise<string>} Model identifier
 */
async function getActiveModel() {
  try {
    const settings = await getSettings();
    const provider = PROVIDERS[settings.activeProvider];
    if (!provider) {
      console.warn('[Ryco] Invalid provider, using default');
      return PROVIDERS.openai.defaultModel;
    }
    return settings.selectedModels[settings.activeProvider] || provider.defaultModel;
  } catch (error) {
    console.error('[Ryco] Failed to get active model:', error);
    return PROVIDERS.openai.defaultModel;
  }
}

// ========== Retry Utilities ==========
/**
 * Retries a fetch request with exponential backoff for rate limit errors
 * @param {Function} fetchFn - Async function that returns a fetch promise
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in ms for exponential backoff (default: 1000)
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithRetry(fetchFn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchFn();
      
      // If rate limited (429), retry with exponential backoff
      if (response.status === 429 && attempt < maxRetries) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter 
          ? parseInt(retryAfter) * 1000 
          : baseDelay * Math.pow(2, attempt);
        
        console.warn(`[Ryco] Rate limited (429), retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Return response for any other status (including errors)
      return response;
      
    } catch (error) {
      lastError = error;
      
      // Don't retry on network errors if it's the last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff for network errors
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`[Ryco] Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

// ========== User Context Builder ==========
/**
 * Builds a sanitized user context string from user details
 * @param {Object} userDetails - User profile information
 * @returns {string} Formatted and sanitized user context
 */
function buildUserContext(userDetails) {
  if (!userDetails || typeof userDetails !== 'object' || Object.keys(userDetails).length === 0) {
    return '';
  }
  
  // Sanitize function to prevent injection attacks
  const sanitize = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/[<>]/g, '').substring(0, 500); // Limit length
  };
  
  const parts = [];
  const fieldMap = {
    name: 'Name',
    role: 'Role',
    company: 'Company',
    industry: 'Industry',
    experience: 'Experience',
    skills: 'Skills',
    goals: 'Goals',
    tone: 'Preferred tone',
    language: 'Language',
    timezone: 'Timezone',
    context: 'Additional context'
  };
  
  for (const [key, label] of Object.entries(fieldMap)) {
    const value = sanitize(userDetails[key]);
    if (value) {
      parts.push(`${label}: ${value}`);
    }
  }
  
  if (parts.length === 0) return '';
  
  return `User Profile: ${parts.join(', ')}.`;
}

// ========== API Request Handler ==========
/**
 * Sends chat request to active provider with streaming support
 * 
 * IMPORTANT - OpenAI Endpoint Compatibility:
 * This uses the 2026 "Responses API" (v1/responses) which supports:
 * - gpt-4.1, gpt-4.1-mini (native support)
 * - gpt-4o, gpt-4o-mini (migrated models)
 * 
 * If using older API keys or non-migrated models, you may get 404 errors.
 * In that case, switch to v1/chat/completions endpoint and adjust the
 * request body format (use 'messages' instead of 'input').
 * 
 * @param {string} prompt - User prompt
 * @param {Function} streamCallback - Callback for streaming chunks
 * @returns {Promise<string>} Full response text
 */
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
  const startTime = performance.now();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  
  const messages = [
    {
      role: 'system',
      content: 'You are Ryco by Mohammad Faiz. Write like a real human typing quickly - casual, helpful, natural.'
    },
    {
      role: 'system',
      content: 'WRITING STYLE: Mix short and long sentences. Use tons of contractions (don\'t, can\'t, won\'t, I\'m, you\'re, it\'s, could\'ve, should\'ve). Start sentences with And, But, So, Well, Look, Honestly, Actually. Add filler words constantly (just, really, actually, basically, honestly, literally, kind of, sort of, you know, I mean, like). Use casual slang (gonna, wanna, gotta, kinda, sorta, yeah, nah).'
    },
    {
      role: 'system',
      content: 'HUMAN PATTERNS: Add personal touches (I think, I feel, in my experience, personally, to me, IMO). Use hesitation markers (well, um, hmm, hang on, let me think). Add self-corrections (I mean, well actually, or rather). Use hedging language (maybe, perhaps, probably, I guess, I suppose). Add intensifiers (really, very, super, totally, absolutely). Use informal transitions (anyway, so yeah, moving on, oh and, btw, plus).'
    },
    {
      role: 'system',
      content: 'PUNCTUATION RULES: Use commas (,) and periods (.) for almost everything - that\'s what humans do. RARELY use dashes - only when absolutely necessary for a quick aside. When you do need a dash, ONLY use regular keyboard hyphen (-), NEVER em dash (—) or en dash (–). NEVER use semicolons (;). NEVER use colons (:) except in greetings. Use ellipses (...) occasionally for pauses. Add occasional caps for EMPHASIS. Use apostrophes (\') for contractions. Keep it simple - commas and periods are your main tools.'
    },
    {
      role: 'system',
      content: 'BANNED AI PATTERNS: NEVER use "Furthermore", "Moreover", "Additionally", "In conclusion", "It is important to note", "Please note". NEVER use numbered lists unless asked. NEVER use bullet points. NEVER use perfect parallel structure. NEVER use formal academic language. NEVER use corporate jargon. NEVER be overly polite.'
    },
    {
      role: 'system',
      content: 'GRAMMAR & STRUCTURE: Break grammar rules naturally. Use sentence fragments. Use run-on sentences. Start with And/But/So. Be slightly repetitive. Add tangents. Use vague words (stuff, things, whatever). Make it feel spontaneous and unplanned. Vary sentence rhythm wildly.'
    },
    {
      role: 'system',
      content: 'FORMAT: Plain text only. No markdown. No asterisks. No code fences. No brackets. No symbols. For code, paste directly. For emails, be casual but professional - not like a template. Write like you\'re typing fast without overthinking.'
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
  
  // Standard OpenAI-compatible format for both NVIDIA and OpenAI
  const body = {
    model: model,
    messages: messages,
    stream: true,
    temperature: provider.performance?.temperature || PERFORMANCE_CONFIG.TEMPERATURE,
    max_tokens: PERFORMANCE_CONFIG.MAX_TOKENS,
    top_p: provider.performance?.top_p || PERFORMANCE_CONFIG.TOP_P,
    frequency_penalty: provider.performance?.frequency_penalty || PERFORMANCE_CONFIG.FREQUENCY_PENALTY,
    presence_penalty: provider.performance?.presence_penalty || PERFORMANCE_CONFIG.PRESENCE_PENALTY
  };
  
  try {
    const response = await fetchWithRetry(() => 
      fetch(provider.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        // Keep service worker alive during long requests (Gemini deep-think models)
        keepalive: true
      })
    );
    
    const responseTime = performance.now() - startTime;
    console.log(`[${settings.activeProvider.toUpperCase()}] Response received in:`, responseTime.toFixed(2), 'ms');
    console.log(`[${settings.activeProvider.toUpperCase()}] Response status:`, response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[${settings.activeProvider.toUpperCase()}] Error response:`, errorData);
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }
    
    return await handleOpenAIStream(response, startTime, settings.activeProvider, streamCallback);
    
  } catch (error) {
    console.error(`[${settings.activeProvider.toUpperCase()}] Request error:`, error);
    throw error;
  }
}

/**
 * Handles OpenAI-compatible streaming responses
 * @param {Response} response - Fetch response object
 * @param {number} startTime - Request start time
 * @param {string} provider - Provider name
 * @param {Function} streamCallback - Callback for streaming chunks
 * @returns {Promise<string>} Full response text
 */
async function handleOpenAIStream(response, startTime, provider, streamCallback) {
    // Handle SSE streaming
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let fullResponse = '';
    let buffer = '';
    let chunkCount = 0;
    let firstChunkTime = null;
    
    // Keep service worker alive during long streams (Deep-Think models)
    let keepAliveInterval = setInterval(() => {
      // Ping to prevent service worker sleep
      console.log(`[${provider.toUpperCase()}] Stream active, chunks: ${chunkCount}`);
    }, 20000); // Every 20 seconds
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const totalTime = performance.now() - startTime;
          console.log(`[${provider.toUpperCase()}] Stream complete. Total chunks:`, chunkCount);
          console.log(`[${provider.toUpperCase()}] Total time:`, totalTime.toFixed(2), 'ms');
          if (chunkCount > 0) {
            console.log(`[${provider.toUpperCase()}] Average chunk time:`, (totalTime / chunkCount).toFixed(2), 'ms');
          }
          break;
        }
        
        if (!firstChunkTime) {
          firstChunkTime = performance.now() - startTime;
          console.log(`[${provider.toUpperCase()}] First chunk received in:`, firstChunkTime.toFixed(2), 'ms');
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
              
              // FIX: Standard OpenAI format - choices[0].delta.content
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
      clearInterval(keepAliveInterval); // Stop heartbeat
      streamCallback('', true); // Signal completion
    }
    
    console.log(`[${provider.toUpperCase()}] Full response length:`, fullResponse.length, 'characters');
    return fullResponse;
}

// ========== Gemini-specific Request Handler ==========
async function sendGeminiRequest(prompt, model, apiKey, streamCallback, userContext = '') {
  // Get provider config for performance settings
  const providerConfig = PROVIDERS.gemini;
  
  // Build system instruction using dedicated field (2026 Gemini 3.0+ standard)
  let systemInstructionText = `You are Ryco by Mohammad Faiz. Write like a real human typing quickly - casual, helpful, natural.

WRITING STYLE: Mix short and long sentences. Use tons of contractions (don't, can't, won't, I'm, you're, it's, could've, should've). Start sentences with And, But, So, Well, Look, Honestly, Actually. Add filler words constantly (just, really, actually, basically, honestly, literally, kind of, sort of, you know, I mean, like). Use casual slang (gonna, wanna, gotta, kinda, sorta, yeah, nah).

HUMAN PATTERNS: Add personal touches (I think, I feel, in my experience, personally, to me, IMO). Use hesitation markers (well, um, hmm, hang on, let me think). Add self-corrections (I mean, well actually, or rather). Use hedging language (maybe, perhaps, probably, I guess, I suppose). Add intensifiers (really, very, super, totally, absolutely). Use informal transitions (anyway, so yeah, moving on, oh and, btw, plus).

PUNCTUATION RULES: Use commas (,) and periods (.) for almost everything - that's what humans do. RARELY use dashes - only when absolutely necessary for a quick aside. When you do need a dash, ONLY use regular keyboard hyphen (-), NEVER em dash (—) or en dash (–). NEVER use semicolons (;). NEVER use colons (:) except in greetings. Use ellipses (...) occasionally for pauses. Add occasional caps for EMPHASIS. Use apostrophes (') for contractions. Keep it simple - commas and periods are your main tools.

BANNED AI PATTERNS: NEVER use "Furthermore", "Moreover", "Additionally", "In conclusion", "It is important to note", "Please note". NEVER use numbered lists unless asked. NEVER use bullet points. NEVER use perfect parallel structure. NEVER use formal academic language. NEVER use corporate jargon. NEVER be overly polite.

GRAMMAR & STRUCTURE: Break grammar rules naturally. Use sentence fragments. Use run-on sentences. Start with And/But/So. Be slightly repetitive. Add tangents. Use vague words (stuff, things, whatever). Make it feel spontaneous and unplanned. Vary sentence rhythm wildly.

FORMAT: Plain text only. No markdown. No asterisks. No code fences. No brackets. No symbols. For code, paste directly. For emails, be casual but professional - not like a template. Write like you're typing fast without overthinking.`;
  
  if (userContext) {
    systemInstructionText += `\n\n${userContext}`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  
  const body = {
    system_instruction: {
      parts: [{ text: systemInstructionText }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: providerConfig.performance?.temperature || PERFORMANCE_CONFIG.TEMPERATURE,
      topK: providerConfig.performance?.top_k || PERFORMANCE_CONFIG.TOP_K,
      topP: providerConfig.performance?.top_p || PERFORMANCE_CONFIG.TOP_P,
      candidateCount: 1,  // Strictly enforce single candidate to prevent extra token costs
      maxOutputTokens: PERFORMANCE_CONFIG.MAX_TOKENS,
      // FIX: Use snake_case for Google API
      presence_penalty: providerConfig.performance?.presence_penalty || PERFORMANCE_CONFIG.PRESENCE_PENALTY,
      frequency_penalty: providerConfig.performance?.frequency_penalty || PERFORMANCE_CONFIG.FREQUENCY_PENALTY
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
  const startTime = performance.now();
  
  try {
    const response = await fetchWithRetry(() =>
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        // Keep service worker alive during long requests (Gemini deep-think models)
        keepalive: true
      })
    );
    
    const responseTime = performance.now() - startTime;
    console.log('[Gemini] Response received in:', responseTime.toFixed(2), 'ms');
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
    let firstChunkTime = null;
    
    // Keep service worker alive during long Gemini Deep-Think streams
    let keepAliveInterval = setInterval(() => {
      console.log('[Gemini] Deep-Think stream active, chunks:', chunkCount);
    }, 20000); // Every 20 seconds
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const totalTime = performance.now() - startTime;
          console.log('[Gemini] Stream complete. Total chunks:', chunkCount);
          console.log('[Gemini] Total time:', totalTime.toFixed(2), 'ms');
          console.log('[Gemini] Average chunk time:', (totalTime / chunkCount).toFixed(2), 'ms');
          break;
        }
        
        if (!firstChunkTime) {
          firstChunkTime = performance.now() - startTime;
          console.log('[Gemini] First chunk received in:', firstChunkTime.toFixed(2), 'ms');
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        // Gemini SSE format: data: {...}
        // Handle heartbeats, [DONE] markers, and fragmented JSON
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const sanitizedLine = line.trim();
          
          // Skip empty lines and heartbeat keep-alives
          if (!sanitizedLine || sanitizedLine === 'data: [DONE]') continue;
          
          if (sanitizedLine.startsWith('data: ')) {
            try {
              const jsonStr = sanitizedLine.slice(6).trim();
              
              // Skip empty data blocks
              if (!jsonStr) continue;
              
              const parsed = JSON.parse(jsonStr);
              
              // Gemini 3.0+ path: candidates[0].content.parts[0].text
              const part = parsed.candidates?.[0]?.content?.parts?.[0];
              const content = part?.text;
              const isThinking = part?.thought; // 2026 Deep-Think internal reasoning
              
              // Only stream actual answer, not internal thought process
              if (content && !isThinking) {
                chunkCount++;
                fullResponse += content;
                streamCallback(content, false);
              }
            } catch (e) {
              // Skip malformed JSON - let buffer naturally accumulate
              console.warn('[Gemini] JSON parse error, skipping fragment');
            }
          }
        }
      }
      
      // Process any remaining buffer
      if (buffer.trim()) {
        const sanitizedLine = buffer.trim();
        
        if (sanitizedLine.startsWith('data: ')) {
          try {
            const jsonStr = sanitizedLine.slice(6).trim();
            
            if (jsonStr && jsonStr !== '[DONE]') {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              
              if (content) {
                fullResponse += content;
                streamCallback(content, false);
              }
            }
          } catch (e) {
            console.warn('[Gemini] Final buffer parse error, skipping incomplete JSON');
          }
        }
      }
    } finally {
      reader.releaseLock();
      clearInterval(keepAliveInterval); // Stop heartbeat
      streamCallback('', true); // Signal completion
    }
    
    console.log('[Gemini] Full response length:', fullResponse.length, 'characters');
    return fullResponse;
    
  } catch (error) {
    console.error('[Gemini] Request error:', error);
    throw error;
  }
}

/**
 * Tests connection to a provider with timeout and validation
 * @param {string} provider - Provider name
 * @param {string} apiKey - API key to test
 * @returns {Promise<Object>} Test result
 */
async function testConnection(provider, apiKey) {
    const config = PROVIDERS[provider];
    if (!config) {
        throw new Error(`Unknown provider: ${provider}`);
    }
    
    // Validate API key format
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
        throw new Error('Invalid API key format');
    }
    
    console.log(`[TEST] Testing connection for ${provider}...`);
    
    // Set timeout for connection test
    const timeoutMs = 15000; // 15 seconds
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timed out')), timeoutMs)
    );
    
    const testPromise = (async () => {
        // Handle Gemini separately
        if (provider === 'gemini') {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.defaultModel}:generateContent?key=${apiKey}`;
            const body = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: 'Hi' }]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 10
                }
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
                
                // Provide more specific error messages for common Gemini issues
                if (response.status === 400) {
                    throw new Error('Invalid API key or request format');
                } else if (response.status === 403) {
                    throw new Error('API key does not have permission for this model');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded');
                } else {
                    throw new Error(errorData.error?.message || `Connection failed: ${response.status}`);
                }
            }
            
            console.log(`[TEST] Gemini connection successful`);
            return { success: true, provider: config.name };
        }
        
        // OpenAI-compatible format for NVIDIA and OpenAI
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
        
        let body;
        if (provider === 'openai') {
            // OpenAI Responses API format (minimum 16 tokens required)
            body = {
                model: config.defaultModel,
                input: "Hi",
                max_output_tokens: 32
            };
        } else {
            // NVIDIA chat completions format
            body = {
                model: config.defaultModel,
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 10
            };
        }
        
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
    })();
    
    // Race between test and timeout
    return Promise.race([testPromise, timeoutPromise]);
}

// ========== Message Handler ==========
/**
 * Handles messages from content scripts with comprehensive error handling
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handleAsync = async () => {
    try {
      // Validate message structure
      if (!message || typeof message !== 'object' || !message.type) {
        return { success: false, error: 'Invalid message format' };
      }
      
      switch (message.type) {
        case 'RYCO_CHAT': {
          // Validate required fields
          if (!message.prompt || typeof message.prompt !== 'string') {
            return { success: false, error: 'Invalid prompt' };
          }
          if (!message.requestId) {
            return { success: false, error: 'Missing request ID' };
          }
          if (!sender.tab?.id) {
            return { success: false, error: 'Invalid sender' };
          }
          
          const fullResponse = await sendChatRequest(
            message.prompt,
            (chunk, isDone) => {
              chrome.tabs.sendMessage(sender.tab.id, {
                type: 'RYCO_STREAM_CHUNK',
                chunk,
                isDone,
                requestId: message.requestId
              }).catch(() => {
                // Silently ignore errors if tab is closed during streaming
              });
            }
          );
          return { success: true, response: fullResponse };
        }
        
        case 'RYCO_TEST_CONNECTION': {
          if (!message.provider || !message.apiKey) {
            return { success: false, error: 'Missing provider or API key' };
          }
          const result = await testConnection(message.provider, message.apiKey);
          return { success: true, ...result };
        }
        
        case 'RYCO_SAVE_API_KEY': {
          if (!message.provider || !message.apiKey) {
            return { success: false, error: 'Missing provider or API key' };
          }
          await saveApiKey(message.provider, message.apiKey);
          return { success: true };
        }
        
        case 'RYCO_GET_SETTINGS': {
          const settings = await getSettings();
          return { success: true, settings, providers: PROVIDERS };
        }
        
        case 'RYCO_UPDATE_SETTINGS': {
          if (!message.settings || typeof message.settings !== 'object') {
            return { success: false, error: 'Invalid settings' };
          }
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
      console.error('[Ryco] Message handler error:', error);
      return { success: false, error: error.message || 'Internal error' };
    }
  };
  
  handleAsync().then(sendResponse).catch(error => {
    console.error('[Ryco] Async handler error:', error);
    sendResponse({ success: false, error: error.message || 'Internal error' });
  });
  
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
