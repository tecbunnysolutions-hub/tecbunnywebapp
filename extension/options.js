document.addEventListener('DOMContentLoaded', () => {
  const sessionEmail = document.getElementById('sessionEmail');
  const sessionState = document.getElementById('sessionState');
  const clearSessionBtn = document.getElementById('clearSessionBtn');
  const status = document.getElementById('status');

  const aiSource = document.getElementById('aiSource');
  const aiProvider = document.getElementById('aiProvider');
  const aiApiKey = document.getElementById('aiApiKey');
  const aiModel = document.getElementById('aiModel');
  const externalOptionsContainer = document.getElementById('externalOptionsContainer');
  const saveAiSettingsBtn = document.getElementById('saveAiSettingsBtn');

  function renderAISettings() {
    chrome.storage.local.get(['aiSource', 'aiProvider', 'aiApiKey', 'aiModel'], (data) => {
      if (aiSource) aiSource.value = data.aiSource || 'website';
      if (aiProvider) aiProvider.value = data.aiProvider || 'gemini';
      if (aiApiKey) aiApiKey.value = data.aiApiKey || '';
      if (aiModel) aiModel.value = data.aiModel || '';
      if (externalOptionsContainer) {
        externalOptionsContainer.style.display = (data.aiSource === 'external') ? 'flex' : 'none';
      }
    });
  }

  if (aiSource) {
    aiSource.addEventListener('change', () => {
      if (externalOptionsContainer) {
        externalOptionsContainer.style.display = (aiSource.value === 'external') ? 'flex' : 'none';
      }
    });
  }

  if (saveAiSettingsBtn) {
    saveAiSettingsBtn.addEventListener('click', () => {
      const sourceVal = aiSource ? aiSource.value : 'website';
      const providerVal = aiProvider ? aiProvider.value : 'gemini';
      const keyVal = aiApiKey ? aiApiKey.value.trim() : '';
      const modelVal = aiModel ? aiModel.value.trim() : '';

      chrome.storage.local.set({
        aiSource: sourceVal,
        aiProvider: providerVal,
        aiApiKey: keyVal,
        aiModel: modelVal
      }, () => {
        status.textContent = 'AI Engine settings saved.';
        renderAISettings();
      });
    });
  }

  function renderSession() {
    chrome.storage.local.get(['superadminUser', 'accessToken', 'superadminPass'], (localData) => {
      chrome.storage.session.get(['accessToken'], (sessionData) => {
        sessionEmail.textContent = localData.superadminUser || 'Not signed in';
        sessionState.textContent = sessionData.accessToken || localData.accessToken ? 'Available for this browser session' : 'Not available';
        if (localData.accessToken || localData.superadminPass) {
          chrome.storage.local.remove(['accessToken', 'superadminPass']);
        }
      });
    });
  }

  clearSessionBtn.addEventListener('click', () => {
    chrome.storage.session.remove(['accessToken'], () => {
      chrome.storage.local.remove(['accessToken', 'superadminPass'], () => {
        status.textContent = 'Session cleared.';
        renderSession();
      });
    });
  });

  renderAISettings();
  renderSession();
});