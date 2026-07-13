chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
});

async function sendProductData(productData) {
  // Configured to point directly to the production tecbunny API endpoint
  const url = 'https://www.tecbunny.com/api/products/scraper';
  
  // Retrieve saved credentials from local storage
  const credentials = await new Promise(resolve => {
    chrome.storage.local.get(['accessToken'], resolve);
  });

  const token = credentials.accessToken || '';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
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
  const url = 'https://www.tecbunny.com/api/products/scraper/ai';
  // Retrieve saved credentials from local storage
  const credentials = await new Promise(resolve => {
    chrome.storage.local.get(['accessToken'], resolve);
  });

  const token = credentials.accessToken || '';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rawText })
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
