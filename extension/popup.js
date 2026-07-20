document.addEventListener('DOMContentLoaded', () => {
  const ALLOWED_HTML_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'UL', 'OL', 'LI', 'H3', 'H4', 'SPAN']);
  const ALLOWED_HTML_ATTRS = new Set(['href', 'title']);

  // Screens
  const settingsScreen = document.getElementById('settingsScreen');
  const scraperScreen = document.getElementById('scraperScreen');

  // Triggers/Buttons
  const settingsBtn = document.getElementById('settingsBtn');
  const backBtn = document.getElementById('backBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const scrapeBtn = document.getElementById('scrapeBtn');
  const aiBtn = document.getElementById('aiBtn');
  const sendBtn = document.getElementById('sendBtn');

  // Input Fields
  const superadminUser = document.getElementById('superadminUser');
  const superadminPass = document.getElementById('superadminPass');
  const titleInput = document.getElementById('productTitle');
  const priceInput = document.getElementById('productPrice');
  const mrpInput = document.getElementById('productMrp');
  const categoryInput = document.getElementById('productCategory');
  const brandInput = document.getElementById('productBrand');
  const shortDescInput = document.getElementById('productShortDesc');
  const seoTitleInput = document.getElementById('seoTitle');
  const seoDescInput = document.getElementById('seoDesc');
  const descInput = document.getElementById('productDescription');
  const imgInput = document.getElementById('productImage');
  const modelInput = document.getElementById('productModel');
  const warrantyPeriodInput = document.getElementById('productWarrantyPeriod');
  const warrantyTypeInput = document.getElementById('productWarrantyType');
  const add1Input = document.getElementById('productAdd1');
  const add2Input = document.getElementById('productAdd2');
  const add3Input = document.getElementById('productAdd3');

  // Image Preview elements
  const imgThumbnail = document.getElementById('imgThumbnail');
  const imgPlaceholder = document.getElementById('imgPlaceholder');

  // Status containers
  const statusContainer = document.getElementById('statusContainer');
  const settingsStatus = document.getElementById('settingsStatus');

  let currentSourceUrl = '';
  let scrapedRawText = '';

  // Helpers
  function sanitizeHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html || '';

    template.content.querySelectorAll('*').forEach((element) => {
      if (!ALLOWED_HTML_TAGS.has(element.tagName)) {
        element.replaceWith(document.createTextNode(element.textContent || ''));
        return;
      }

      Array.from(element.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();
        if (!ALLOWED_HTML_ATTRS.has(name) || name.startsWith('on') || value.startsWith('javascript:')) {
          element.removeAttribute(attr.name);
        }
      });
    });

    return template.innerHTML;
  }

  function normalizeHttpUrl(value) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : '';
    } catch (_) {
      return '';
    }
  }

  function showStatus(message, type) {
    statusContainer.textContent = message;
    statusContainer.className = 'status-container'; // Reset
    
    if (type === 'success') {
      statusContainer.classList.add('status-success');
    } else if (type === 'error') {
      statusContainer.classList.add('status-error');
    } else {
      statusContainer.classList.add('status-info');
    }
    statusContainer.style.display = 'flex';
  }

  function clearStatus() {
    statusContainer.style.display = 'none';
    statusContainer.textContent = '';
  }

  function showSettingsStatus(message, type) {
    settingsStatus.textContent = message;
    settingsStatus.className = 'status-container'; // Reset
    
    if (type === 'success') {
      settingsStatus.classList.add('status-success');
    } else if (type === 'error') {
      settingsStatus.classList.add('status-error');
    } else {
      settingsStatus.classList.add('status-info');
    }
    settingsStatus.style.display = 'flex';
  }

  function clearSettingsStatus() {
    settingsStatus.style.display = 'none';
    settingsStatus.textContent = '';
  }

  function updateImagePreview(url) {
    const normalizedUrl = normalizeHttpUrl(url);
    if (normalizedUrl) {
      imgThumbnail.src = normalizedUrl;
      imgThumbnail.style.display = 'block';
      imgPlaceholder.style.display = 'none';
    } else {
      imgThumbnail.src = '';
      imgThumbnail.style.display = 'none';
      imgPlaceholder.style.display = 'flex';
    }
  }

  // Navigation functions
  function checkCredentials() {
    chrome.storage.local.get(['superadminUser'], (localData) => {
      chrome.storage.session.get(['accessToken'], (sessionData) => {
        const accessToken = sessionData.accessToken;
        if (!localData.superadminUser || !accessToken) {
          // First-time or reset credentials setup
          superadminUser.value = localData.superadminUser || '';
          superadminPass.value = '';
          backBtn.style.display = 'none'; // Force save
          scraperScreen.classList.remove('active');
          settingsScreen.classList.add('active');
          showSettingsStatus('Please sign in to generate a secure session token.', 'info');
        } else {
          // Normal scrape screen
          superadminUser.value = localData.superadminUser;
          superadminPass.value = '';
          backBtn.style.display = 'block';
          settingsScreen.classList.remove('active');
          scraperScreen.classList.add('active');
        }
      });
    });
  }

  // Trigger check on load
  checkCredentials();

  // Settings screen navigation button
  settingsBtn.addEventListener('click', () => {
    clearSettingsStatus();
    backBtn.style.display = 'block'; // Can cancel out
    scraperScreen.classList.remove('active');
    settingsScreen.classList.add('active');
  });

  // Cancel / Back Button Click
  backBtn.addEventListener('click', () => {
    settingsScreen.classList.remove('active');
    scraperScreen.classList.add('active');
  });

  // Save Credentials Click
  saveSettingsBtn.addEventListener('click', async () => {
    clearSettingsStatus();
    const email = superadminUser.value.trim();
    const pass = superadminPass.value.trim();

    if (!email || !pass) {
      showSettingsStatus('Please fill in both email and password fields.', 'error');
      return;
    }
    
    saveSettingsBtn.disabled = true;
    saveSettingsBtn.textContent = 'Authenticating...';

    try {
      const response = await fetch('https://www.tecbunny.com/api/auth/extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      chrome.storage.local.set({ superadminUser: email }, () => {
        chrome.storage.session.set({ accessToken: data.access_token }, () => {
          chrome.storage.local.remove(['superadminPass', 'accessToken']);
          superadminPass.value = '';
          showSettingsStatus('Authenticated successfully!', 'success');
          setTimeout(() => {
            settingsScreen.classList.remove('active');
            scraperScreen.classList.add('active');
          }, 800);
        });
      });
    } catch (error) {
      showSettingsStatus(error.message || 'Network error during login.', 'error');
    } finally {
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.textContent = 'Save Credentials';
    }
  });

  // Update preview image when user types in URL
  imgInput.addEventListener('input', () => {
    updateImagePreview(imgInput.value.trim());
  });

  // Scrape Button Click Handler
  scrapeBtn.addEventListener('click', async () => {
    clearStatus();
    scrapeBtn.disabled = true;
    scrapeBtn.textContent = 'Scraping...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('No active tab found.');
      }

      // Check if page can be scripted
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        throw new Error('Cannot scrape system pages. Please navigate to a product web page.');
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        
        // Populate inputs
        titleInput.value = data.title || '';
        priceInput.value = data.price || '';
        mrpInput.value = data.mrp || '';
        categoryInput.value = data.category || '';
        brandInput.value = data.brand || '';
        descInput.value = data.description || '';
        imgInput.value = data.imageUrl || '';
        shortDescInput.value = data.shortDescription || '';
        modelInput.value = data.modelNo || '';
        warrantyPeriodInput.value = data.warrantyPeriod || '';
        warrantyTypeInput.value = data.warrantyType || '';
        add1Input.value = data.additional1 || '';
        add2Input.value = data.additional2 || '';
        add3Input.value = data.additional3 || '';
        currentSourceUrl = data.sourceUrl || tab.url;
        scrapedRawText = data.rawText || '';

        updateImagePreview(data.imageUrl);
        
        // Enable send button
        sendBtn.disabled = false;
        
        if (scrapedRawText) {
          aiBtn.style.display = 'block';
          showStatus('Extracting full details using AI...', 'info');
          
          // Auto-trigger AI enhancement
          chrome.runtime.sendMessage({ action: 'enhanceProduct', rawText: scrapedRawText }, (response) => {
            if (chrome.runtime.lastError) {
              showStatus(`Product scraped (AI unavailable: ${chrome.runtime.lastError.message})`, 'info');
            } else if (response && response.success && response.data) {
              const d = response.data;
              if (d.title) titleInput.value = d.title;
              if (d.price) priceInput.value = d.price;
              if (d.mrp) mrpInput.value = d.mrp;
              if (d.category) categoryInput.value = d.category;
              if (d.brand) brandInput.value = d.brand;
              if (d.shortDescription) shortDescInput.value = d.shortDescription;
              if (d.seoTitle) seoTitleInput.value = d.seoTitle;
              if (d.seoDescription) seoDescInput.value = d.seoDescription;
              if (d.htmlDescription) descInput.value = sanitizeHtml(d.htmlDescription);
              if (d.modelNo) modelInput.value = d.modelNo;
              if (d.warrantyPeriod) warrantyPeriodInput.value = d.warrantyPeriod;
              if (d.warrantyType) warrantyTypeInput.value = d.warrantyType;
              if (d.additional1) add1Input.value = d.additional1;
              if (d.additional2) add2Input.value = d.additional2;
              if (d.additional3) add3Input.value = d.additional3;
              
              showStatus('✨ Product scraped and fully enhanced with AI!', 'success');
            } else {
              showStatus(`Product scraped (AI enhancement failed: ${response?.error || 'Unknown error'})`, 'info');
            }
          });
        } else {
          showStatus('Product scraped successfully! You can review and edit fields before sending.', 'success');
        }
      } else {
        throw new Error('Scraping returned no data.');
      }
    } catch (error) {
      showStatus(error.message || 'Scraping failed.', 'error');
      sendBtn.disabled = true;
    } finally {
      scrapeBtn.disabled = false;
      scrapeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        Scrape Product
      `;
    }
  });

  // AI Button Click Handler
  aiBtn.addEventListener('click', () => {
    if (!scrapedRawText) return;
    
    clearStatus();
    aiBtn.disabled = true;
    const originalText = aiBtn.innerHTML;
    aiBtn.textContent = 'Enhancing...';

    chrome.runtime.sendMessage({ action: 'enhanceProduct', rawText: scrapedRawText }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus(`Extension communication error: ${chrome.runtime.lastError.message}`, 'error');
      } else if (response && response.success && response.data) {
        const d = response.data;
        // Only overwrite if the AI found something and the user didn't manually change it to something else (simplification: just overwrite)
        if (d.title) titleInput.value = d.title;
        if (d.price) priceInput.value = d.price;
        if (d.mrp) mrpInput.value = d.mrp;
        if (d.category) categoryInput.value = d.category;
        if (d.brand) brandInput.value = d.brand;
        if (d.shortDescription) shortDescInput.value = d.shortDescription;
        if (d.seoTitle) seoTitleInput.value = d.seoTitle;
        if (d.seoDescription) seoDescInput.value = d.seoDescription;
        if (d.htmlDescription) descInput.value = sanitizeHtml(d.htmlDescription);
        if (d.modelNo) modelInput.value = d.modelNo;
        if (d.warrantyPeriod) warrantyPeriodInput.value = d.warrantyPeriod;
        if (d.warrantyType) warrantyTypeInput.value = d.warrantyType;
        if (d.additional1) add1Input.value = d.additional1;
        if (d.additional2) add2Input.value = d.additional2;
        if (d.additional3) add3Input.value = d.additional3;
        
        showStatus('✨ Product details magically enhanced with AI!', 'success');
      } else {
        const errMsg = response && response.error ? response.error : 'Unknown AI error.';
        showStatus(`AI Enhancement failed: ${errMsg}`, 'error');
      }
      
      aiBtn.disabled = false;
      aiBtn.innerHTML = originalText;
    });
  });

  // Send Button Click Handler
  sendBtn.addEventListener('click', () => {
    clearStatus();
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';

    const payload = {
      title: titleInput.value.trim(),
      price: priceInput.value.trim(),
      mrp: mrpInput.value.trim(),
      category: categoryInput.value.trim(),
      brand: brandInput.value.trim(),
      description: sanitizeHtml(descInput.value.trim()),
      imageUrl: normalizeHttpUrl(imgInput.value.trim()),
      sourceUrl: currentSourceUrl,
      shortDescription: shortDescInput.value.trim(),
      seoTitle: seoTitleInput.value.trim(),
      seoDescription: seoDescInput.value.trim(),
      modelNo: modelInput.value.trim(),
      warrantyPeriod: warrantyPeriodInput.value.trim(),
      warrantyType: warrantyTypeInput.value.trim(),
      additional1: add1Input.value.trim(),
      additional2: add2Input.value.trim(),
      additional3: add3Input.value.trim()
    };

    chrome.runtime.sendMessage({ action: 'sendProduct', data: payload }, (response) => {
      // Check for runtime errors
      if (chrome.runtime.lastError) {
        showStatus(`Extension communication error: ${chrome.runtime.lastError.message}`, 'error');
        sendBtn.disabled = false;
        sendBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          Send to Website
        `;
        return;
      }

      if (response && response.success) {
        showStatus('Product data successfully transmitted to external database!', 'success');
      } else {
        const errMsg = response && response.error ? response.error : 'Unknown server or network error.';
        showStatus(`Failed to transmit product: ${errMsg}`, 'error');
        sendBtn.disabled = false;
        sendBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          Send to Website
        `;
      }
    });
  });
});
