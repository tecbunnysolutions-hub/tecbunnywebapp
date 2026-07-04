document.addEventListener('DOMContentLoaded', () => {
  // Screens
  const settingsScreen = document.getElementById('settingsScreen');
  const scraperScreen = document.getElementById('scraperScreen');

  // Triggers/Buttons
  const settingsBtn = document.getElementById('settingsBtn');
  const backBtn = document.getElementById('backBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const scrapeBtn = document.getElementById('scrapeBtn');
  const sendBtn = document.getElementById('sendBtn');

  // Input Fields
  const superadminUser = document.getElementById('superadminUser');
  const superadminPass = document.getElementById('superadminPass');
  const titleInput = document.getElementById('productTitle');
  const priceInput = document.getElementById('productPrice');
  const mrpInput = document.getElementById('productMrp');
  const categoryInput = document.getElementById('productCategory');
  const brandInput = document.getElementById('productBrand');
  const descInput = document.getElementById('productDescription');
  const imgInput = document.getElementById('productImage');
  const shortDescInput = document.getElementById('productShortDesc');
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

  // Helpers
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
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
      imgThumbnail.src = url;
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
    chrome.storage.local.get(['superadminUser', 'superadminPass'], (data) => {
      if (!data.superadminUser || !data.superadminPass) {
        // First-time or reset credentials setup
        superadminUser.value = '';
        superadminPass.value = '';
        backBtn.style.display = 'none'; // Force save
        scraperScreen.classList.remove('active');
        settingsScreen.classList.add('active');
      } else {
        // Normal scrape screen
        superadminUser.value = data.superadminUser;
        superadminPass.value = data.superadminPass;
        backBtn.style.display = 'block';
        settingsScreen.classList.remove('active');
        scraperScreen.classList.add('active');
      }
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
  saveSettingsBtn.addEventListener('click', () => {
    clearSettingsStatus();
    const user = superadminUser.value.trim();
    const pass = superadminPass.value.trim();

    if (!user || !pass) {
      showSettingsStatus('Please fill in both username and password fields.', 'error');
      return;
    }

    chrome.storage.local.set({ superadminUser: user, superadminPass: pass }, () => {
      showSettingsStatus('Credentials saved successfully!', 'success');
      setTimeout(() => {
        settingsScreen.classList.remove('active');
        scraperScreen.classList.add('active');
      }, 500);
    });
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

        updateImagePreview(data.imageUrl);
        
        // Enable send button
        sendBtn.disabled = false;
        showStatus('Product scraped successfully! You can review and edit fields before sending.', 'success');
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
      description: descInput.value.trim(),
      imageUrl: imgInput.value.trim(),
      sourceUrl: currentSourceUrl,
      shortDescription: shortDescInput.value.trim(),
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
