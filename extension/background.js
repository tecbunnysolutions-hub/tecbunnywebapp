const API_BASE_URL_CANDIDATES = ['https://api.tecbunny.com/api', 'https://www.tecbunny.com/api'];
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RAW_TEXT_LENGTH = 30000;

// Groq API key must be provided by the user via the extension options page.
// Never hardcode secrets here — they would be committed to source control.
const DEFAULT_GROQ_API_KEY = '';
// groq/compound has the highest token-per-minute throughput (70K TPM) and no
// daily token cap — best for bulk/high-volume scraping of large product pages.
const DEFAULT_GROQ_MODEL = 'groq/compound';
// Superseded keys that should be auto-migrated to the current default.
const LEGACY_GROQ_API_KEYS = [];
// Superseded model overrides that should be auto-migrated to the current default.
const LEGACY_GROQ_MODELS = ['llama-3.3-70b-versatile'];
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
  // Force Groq (free) as the AI engine, migrating any legacy Gemini/website settings.
  chrome.storage.local.get(['aiSource', 'aiProvider', 'aiApiKey', 'aiModel'], (existing) => {
    const updates = {};
    // Migrate legacy configs (website source or gemini provider) to Groq.
    if (existing.aiSource !== 'external') updates.aiSource = 'external';
    if (existing.aiProvider !== 'groq' && existing.aiProvider !== 'openai' && existing.aiProvider !== 'claude') {
      updates.aiProvider = 'groq';
    }
    if (!existing.aiProvider) updates.aiProvider = 'groq';
    if (!existing.aiApiKey) updates.aiApiKey = DEFAULT_GROQ_API_KEY;
    // Replace any superseded Groq key with the current default.
    if (existing.aiApiKey && LEGACY_GROQ_API_KEYS.includes(existing.aiApiKey)) {
      updates.aiApiKey = DEFAULT_GROQ_API_KEY;
    }
    if ((updates.aiProvider === 'groq' || existing.aiProvider === 'groq') && !existing.aiModel) {
      updates.aiModel = DEFAULT_GROQ_MODEL;
    }
    // Migrate a previously-defaulted Groq model to the current default.
    if (existing.aiModel && LEGACY_GROQ_MODELS.includes(existing.aiModel)) {
      updates.aiModel = DEFAULT_GROQ_MODEL;
    }
    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
    }
  });
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
  return `You are an expert e-commerce data extraction assistant and product copywriter.
Read the RAW WEBPAGE TEXT below and return a SINGLE JSON object with EXACTLY these keys.
Fill every value using the REAL details found in the text. Never copy the instructions
or example wording literally — if a detail is missing, infer sensibly or use "".

Keys and how to fill them:
{
  "title": "Short brand + model name only, 6-7 words max (e.g. Boat Rockerz 200 Black)",
  "brand": "Brand name",
  "modelNo": "Model number / SKU",
  "mrp": "Original MRP with currency symbol (e.g. ₹2,490)",
  "price": "Current sale price with currency symbol (e.g. ₹760)",
  "category": "Category breadcrumb",
  "shortDescription": "Compelling 1-2 sentence summary written from the real product details",
  "warrantyPeriod": "Warranty duration (e.g. 1 Year); \"\" if not stated",
  "warrantyType": "Brand Warranty, Dealer Warranty, or No Warranty; \"\" if not stated",
  "additional1": "A real key specification or feature",
  "additional2": "A second real key specification or feature",
  "additional3": "A third real key specification or feature",
  "seoTitle": "SEO title under 60 characters",
  "seoDescription": "SEO meta description under 160 characters",
  "htmlDescription": "Rich HTML product description (see DETAILED DESCRIPTION RULES)"
}

PRICE RULES (mrp and price) — STRICT:
- Use ONLY the exact prices that literally appear in the RAW WEBPAGE TEXT. Never invent,
  estimate, round, calculate or guess any amount.
- "price" = the current selling / offer price the customer actually pays (usually the most
  prominent price, shown near "Buy now" / after any discount).
- "mrp" = the original / list price (often labelled MRP, struck-through, or the higher of two
  prices). If only one price exists on the page, put it in "price" and leave "mrp" as "".
- Keep the exact currency symbol and number formatting as shown on the page (e.g. ₹3,512).
- If a price is not present in the text, return "" for that field. Do NOT fill it from
  memory, other products, or assumptions.

DETAILED DESCRIPTION RULES (htmlDescription):
- Write ORIGINAL marketing copy based only on the actual product in the text. Do NOT
  output the words "Introductory paragraph", "Feature", "Detail" or any placeholder.
- Structure it as valid HTML using ONLY these tags: <p>, <h3>, <ul>, <li>, <strong>, <br>.
- Start with one engaging <p> intro paragraph (2-4 sentences) describing the product.
- Then a <h3>Key Features &amp; Benefits</h3> heading followed by a <ul> with 4-8 <li>
  items. Each <li> should read "<strong>Real feature name:</strong> concrete benefit or
  spec" using genuine details (capacity, interface, speed, material, compatibility, etc.).
- Optionally add a <h3>Specifications</h3> section with more <li> items if specs exist.
- Keep it factual, specific to THIS product, and free of invented claims.

IMPORTANT: Respond with ONLY the valid JSON object — no markdown fences, no commentary.

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

// Groq fallback chain: primary (compound, highest throughput) then quality /
// high daily limit models so scraping keeps working when a model hits its rate
// limit. (Limits per Groq free tier: compound=250/day 70K TPM no daily token
//  cap, 70b=1K req/day 12K TPM, 8b-instant=14.4K req/day.)
const GROQ_MODEL_FALLBACKS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
// Models that do NOT support response_format:json_object (agentic compound).
const GROQ_NO_JSON_MODE = new Set(['groq/compound', 'groq/compound-mini']);
const GROQ_RETRIABLE_STATUS = new Set([408, 413, 429, 500, 502, 503, 504]);

function parseGroqJson(text) {
  const cleaned = String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Extract the first JSON object if the model added surrounding prose.
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('Groq returned a non-JSON response');
  }
}

async function callGroqModel(prompt, apiKey, model) {
  const payload = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1
  };
  if (!GROQ_NO_JSON_MODE.has(model)) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    const err = new Error(`Groq API error (${response.status}) on ${model}: ${errText}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error(`Groq returned empty response on ${model}`);
  return parseGroqJson(text);
}

async function enhanceWithDirectGroq(rawText, apiKey, model = DEFAULT_GROQ_MODEL) {
  const prompt = buildExtractorPrompt(rawText);
  // Preferred model first, then the fallback chain (deduplicated).
  const models = [model || DEFAULT_GROQ_MODEL, ...GROQ_MODEL_FALLBACKS]
    .filter((value, index, self) => value && self.indexOf(value) === index);

  let lastError = null;
  for (let i = 0; i < models.length; i += 1) {
    try {
      return await callGroqModel(prompt, apiKey, models[i]);
    } catch (err) {
      lastError = err;
      // Only fall through to the next model on retriable (rate/limit) errors.
      const status = err && err.status;
      const isRetriable = status ? GROQ_RETRIABLE_STATUS.has(status) : true;
      if (!isRetriable || i === models.length - 1) {
        throw err;
      }
      console.warn(`Groq model ${models[i]} failed (${status}); trying ${models[i + 1]}`);
    }
  }
  throw lastError || new Error('Groq enhancement failed');
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

  // Resolve effective AI config, defaulting to the built-in Groq free tier.
  const provider = (aiSettings.aiProvider || 'groq').toLowerCase();
  const apiKey = aiSettings.aiApiKey || (provider === 'groq' ? DEFAULT_GROQ_API_KEY : '');
  const useExternal = aiSettings.aiSource !== 'website' && !!apiKey;

  if (useExternal) {
    try {
      let data = null;
      if (provider === 'groq') {
        data = await enhanceWithDirectGroq(validatedRawText, apiKey, aiSettings.aiModel);
      } else if (provider === 'openai') {
        data = await enhanceWithDirectOpenAI(validatedRawText, apiKey, aiSettings.aiModel);
      } else if (provider === 'claude') {
        data = await enhanceWithDirectClaude(validatedRawText, apiKey, aiSettings.aiModel);
      } else {
        data = await enhanceWithDirectGemini(validatedRawText, apiKey, aiSettings.aiModel);
      }
      return { success: true, data };
    } catch (directErr) {
      // Do NOT fall back to the website API — surface the real provider error
      // so quota/config issues aren't misreported as a different error.
      return { success: false, error: directErr.message || String(directErr) };
    }
  }

  // External source is set but no key provided — don't attempt the website API (requires login).
  if (aiSettings.aiSource !== 'website') {
    return {
      success: false,
      error: `No AI API key configured. Open extension settings (⚙) and enter a Groq, OpenAI, Claude, or Gemini API key.`
    };
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
