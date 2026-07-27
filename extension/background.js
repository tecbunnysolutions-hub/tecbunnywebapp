const API_BASE_URL_CANDIDATES = ['https://api.tecbunny.com/api', 'https://www.tecbunny.com/api'];
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RAW_TEXT_LENGTH = 30000;
const PRODUCT_TEXT_FIELDS = [
  'title', 'price', 'mrp', 'category', 'brand', 'description', 'imageUrl', 'sourceUrl',
  'shortDescription', 'seoTitle', 'seoDescription', 'modelNo', 'warrantyPeriod',
  'warrantyType', 'additional1', 'additional2', 'additional3'
];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if ((sender.id && sender.id !== chrome.runtime.id) || !message || typeof message !== 'object') {
    sendResponse({ success: false, error: 'Invalid extension message.' });
    return false;
  }

  if (message.action === 'sendProduct') {
    // Perform asynchronous transmission and keep the channel open
    sendProductData(message.data)
      .then(response => {
        sendResponse(response);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for asynchronous reply
  } else if (message.action === 'enhanceProduct') {
    enhanceProductWithAI(message.rawText)
      .then(response => {
        sendResponse(response);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  sendResponse({ success: false, error: 'Unknown extension action.' });
  return false;
});

function validateProductPayload(productData) {
  if (!productData || typeof productData !== 'object' || Array.isArray(productData)) {
    throw new Error('Invalid product payload.');
  }

  if (!productData.title || typeof productData.title !== 'string' || productData.title.trim().length > 300) {
    throw new Error('Product title is required and must be under 300 characters.');
  }

  for (const field of PRODUCT_TEXT_FIELDS) {
    if (productData[field] !== undefined && typeof productData[field] !== 'string') {
      throw new Error(`Invalid product field: ${field}`);
    }
  }

  return PRODUCT_TEXT_FIELDS.reduce((payload, field) => {
    if (productData[field] !== undefined) {
      payload[field] = productData[field].trim();
    }
    return payload;
  }, {});
}

function validateRawText(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error('Raw product text is required.');
  }
  return rawText.slice(0, MAX_RAW_TEXT_LENGTH);
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchApiWithFallback(path, options) {
  const retriableStatuses = new Set([404, 408, 425, 429, 500, 502, 503, 504]);
  let lastNetworkError = null;

  for (let index = 0; index < API_BASE_URL_CANDIDATES.length; index += 1) {
    const baseUrl = API_BASE_URL_CANDIDATES[index];
    const requestUrl = `${baseUrl}${path}`;

    try {
      const response = await fetchWithTimeout(requestUrl, options);
      if (response.ok || !retriableStatuses.has(response.status) || index === API_BASE_URL_CANDIDATES.length - 1) {
        return response;
      }
    } catch (error) {
      lastNetworkError = error;
      if (index === API_BASE_URL_CANDIDATES.length - 1) {
        throw error;
      }
    }
  }

  if (lastNetworkError) {
    throw lastNetworkError;
  }

  throw new Error('No API host candidates configured for extension requests.');
}

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.remove(['accessToken']);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.remove(['accessToken']);
});

async function getAccessToken() {
  const sessionCredentials = await new Promise(resolve => {
    chrome.storage.session.get(['accessToken'], resolve);
  });

  return sessionCredentials.accessToken || '';
}

async function sendProductData(productData) {
  const validatedProductData = validateProductPayload(productData);
  
  const token = await getAccessToken();
  
  try {
    const response = await fetchApiWithFallback('/products/scraper', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(validatedProductData)
    });

    if (response.ok) {
      return { success: true };
    } else {
      // Extract error details if any
      let errorText = '';
      try {
        const rawText = await response.text();
        try {
          const parsed = JSON.parse(rawText);
          errorText = parsed.error || rawText;
        } catch (_) {
          errorText = rawText;
        }
      } catch (_) {}
      
      return { 
        success: false, 
        error: errorText || `Server responded with status ${response.status}`
      };
    }
  } catch (error) {
    // Network failures, CORS blocks, DNS failures
    return { 
      success: false, 
      error: `Network failure: ${error.message}. Make sure your website is online and accessible at https://www.tecbunny.com` 
    };
  }
}

async function getAISettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(['aiSource', 'aiProvider', 'aiApiKey', 'aiModel'], resolve);
  });
}

function buildExtractorPrompt(rawText) {
  return `You are an expert e-commerce data extraction assistant and copywriter.
Extract the product fields from the raw webpage text below into a JSON object matching this structure EXACTLY:

{
  "title": "Short brand & model name only (max 6-7 words, e.g. Boat Rockerz 200 Black)",
  "brand": "Brand name",
  "modelNo": "Model number",
  "mrp": "Original MRP price with currency symbol (e.g. ₹2,490)",
  "price": "Sale price with currency symbol (e.g. ₹760)",
  "category": "Product category breadcrumb",
  "shortDescription": "Compelling 1-2 sentence short description",
  "warrantyPeriod": "Warranty duration (e.g. 1 Year). Leave empty if omitted",
  "warrantyType": "Brand Warranty, Dealer Warranty, or No Warranty. Leave empty if omitted",
  "additional1": "Key specification or feature 1",
  "additional2": "Key specification or feature 2",
  "additional3": "Key specification or feature 3",
  "seoTitle": "SEO Title under 60 chars",
  "seoDescription": "SEO Meta Description under 160 chars",
  "htmlDescription": "<p>Introductory paragraph...</p><h3>Key Features & Benefits</h3><ul><li><strong>Feature:</strong> Detail</li></ul>"
}

IMPORTANT: Respond ONLY with valid JSON and no markdown wrapping or extra text.

RAW WEBPAGE TEXT:
---------------------
${rawText.slice(0, MAX_RAW_TEXT_LENGTH)}`;
}

async function enhanceWithDirectOpenAI(rawText, apiKey, model = 'gpt-4o-mini') {
  const prompt = buildExtractorPrompt(rawText);
  const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned empty response');
  return JSON.parse(text);
}

async function enhanceWithDirectGemini(rawText, apiKey, model = 'gemini-2.0-flash') {
  const prompt = buildExtractorPrompt(rawText);
  const selectedModel = model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
  if (!text) throw new Error('Gemini returned empty response');
  return JSON.parse(text);
}

async function enhanceWithDirectClaude(rawText, apiKey, model = 'claude-3-5-sonnet-20241022') {
  const prompt = buildExtractorPrompt(rawText);
  const selectedModel = model || 'claude-3-5-sonnet-20241022';
  const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: selectedModel,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  if (!text) throw new Error('Claude returned empty response');
  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}

async function enhanceProductWithAI(rawText) {
  const validatedRawText = validateRawText(rawText);
  const aiSettings = await getAISettings();

  if (aiSettings.aiSource === 'external' && aiSettings.aiApiKey) {
    try {
      let data = null;
      const provider = (aiSettings.aiProvider || 'gemini').toLowerCase();
      if (provider === 'openai') {
        data = await enhanceWithDirectOpenAI(validatedRawText, aiSettings.aiApiKey, aiSettings.aiModel);
      } else if (provider === 'claude') {
        data = await enhanceWithDirectClaude(validatedRawText, aiSettings.aiApiKey, aiSettings.aiModel);
      } else {
        data = await enhanceWithDirectGemini(validatedRawText, aiSettings.aiApiKey, aiSettings.aiModel);
      }
      return { success: true, data };
    } catch (directErr) {
      console.warn('Direct AI provider failed, falling back to website API:', directErr);
    }
  }

  const token = await getAccessToken();
  
  try {
    const response = await fetchApiWithFallback('/products/scraper/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rawText: validatedRawText })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data.data };
    } else {
      let errorText = '';
      try {
        const rawTextData = await response.text();
        try {
          const parsed = JSON.parse(rawTextData);
          errorText = parsed.error || rawTextData;
        } catch (_) {
          errorText = rawTextData;
        }
      } catch (_) {}
      
      return { 
        success: false, 
        error: errorText || `Server responded with status ${response.status}`
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: `Network failure: ${error.message}. Make sure your website is online.` 
    };
  }
}
