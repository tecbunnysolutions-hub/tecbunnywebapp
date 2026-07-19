document.addEventListener('DOMContentLoaded', () => {
  const sessionEmail = document.getElementById('sessionEmail');
  const sessionState = document.getElementById('sessionState');
  const clearSessionBtn = document.getElementById('clearSessionBtn');
  const status = document.getElementById('status');

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

  renderSession();
});