const openSidePanelBtn = document.getElementById('openSidePanel');
const openPopupChatBtn = document.getElementById('openPopupChat');
const caInput = document.getElementById('caInput');
const joinBtn = document.getElementById('joinBtn');

openSidePanelBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openSidePanel' });
  window.close();
});

openPopupChatBtn.addEventListener('click', () => {
  chrome.storage.local.set({ popupMode: 'chat' }, () => {
    window.location.href = 'panel.html';
  });
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