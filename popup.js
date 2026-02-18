const openSidePanelBtn = document.getElementById('openSidePanel');
const quickChatBtn = document.getElementById('openPopupChat');
const caInput = document.getElementById('caInput');
const joinBtn = document.getElementById('joinBtn');

openSidePanelBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openSidePanel' });
  window.close();
});

// Quick Chat - reads clipboard and auto-joins
quickChatBtn.addEventListener('click', async () => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    const ca = clipboardText.trim();
    
    if (ca && ca.length > 0) {
      // Save CA and set flag to auto-join
      chrome.storage.local.set({ 
        quickChatCA: ca,
        autoJoinRoom: true 
      }, () => {
        // Open side panel
        chrome.runtime.sendMessage({ action: 'openSidePanel' });
        window.close();
      });
    } else {
      // No clipboard content, just open side panel
      chrome.runtime.sendMessage({ action: 'openSidePanel' });
      window.close();
    }
  } catch (err) {
    console.error('Failed to read clipboard:', err);
    // Fallback: just open side panel
    chrome.runtime.sendMessage({ action: 'openSidePanel' });
    window.close();
  }
});

joinBtn.addEventListener('click', () => {
  const ca = caInput.value.trim();
  if (ca) {
    chrome.storage.local.set({ lastCA: ca, popupMode: 'chat' }, () => {
      window.location.href = 'panel.html';
    });
  }
});

caInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') joinBtn.click();
});

const checkConnection = async () => {
  const footer = document.querySelector('.popup-footer');
  const statusText = footer.querySelector('span:last-child');
  try {
    await fetch('https://trench-chat-server-production.up.railway.app', { method: 'HEAD', mode: 'no-cors' });
    footer.classList.remove('disconnected');
    statusText.textContent = 'Connected to server';
  } catch (e) {
    footer.classList.add('disconnected');
    statusText.textContent = 'Server offline';
  }
};

checkConnection();
