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
  }
});

async function sendProductData(productData) {
  // Configured to point directly to the production tecbunny API endpoint
  const url = 'https://www.tecbunny.com/api/products/scraper';
  
  // Retrieve saved credentials from local storage
  const credentials = await new Promise(resolve => {
    chrome.storage.local.get(['superadminUser', 'superadminPass'], resolve);
  });

  const username = credentials.superadminUser || '';
  const password = credentials.superadminPass || '';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-superadmin-username': username,
        'x-superadmin-password': password
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
