const API_BASE_URL = 'https://www.tecbunny.com/api';
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

async function getAccessToken() {
  const sessionCredentials = await new Promise(resolve => {
    chrome.storage.session.get(['accessToken'], resolve);
  });

  if (sessionCredentials.accessToken) {
    return sessionCredentials.accessToken;
  }

  const legacyCredentials = await new Promise(resolve => {
    chrome.storage.local.get(['accessToken'], resolve);
  });

  return legacyCredentials.accessToken || '';
}

async function sendProductData(productData) {
  // Configured to point directly to the production tecbunny API endpoint
  const url = `${API_BASE_URL}/products/scraper`;
  const validatedProductData = validateProductPayload(productData);
  
  const token = await getAccessToken();
  
  try {
    const response = await fetchWithTimeout(url, {
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

async function enhanceProductWithAI(rawText) {
  const url = `${API_BASE_URL}/products/scraper/ai`;
  const validatedRawText = validateRawText(rawText);
  const token = await getAccessToken();
  
  try {
    const response = await fetchWithTimeout(url, {
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
