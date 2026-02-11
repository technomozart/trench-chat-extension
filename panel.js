// ===== CONFIG =====
const API_URL = "https://trench-chat-server-production.up.railway.app";
const REACTIONS = ["🔥", "💎", "🚀", "😂", "👀", "💀"];

// ===== STATE =====
let currentUser = null;
let authToken = null;
let currentRoom = null;
let savedChats = [];
let socket = null;
let openPicker = null;

// ===== DOM ELEMENTS =====
// Auth
const authScreen = document.getElementById("authScreen");
const mainApp = document.getElementById("mainApp");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const regUsername = document.getElementById("regUsername");
const regPassword = document.getElementById("regPassword");
const regReferralCode = document.getElementById("regReferralCode");
const registerBtn = document.getElementById("registerBtn");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");
const authError = document.getElementById("authError");

// Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

// Chat
const headerTitle = document.getElementById("headerTitle");
const roomStatus = document.getElementById("roomStatus");
const avatarPreview = document.getElementById("avatarPreview");
const savedChatsDiv = document.getElementById("savedChats");
const chatsList = document.getElementById("chatsList");
const chatCount = document.getElementById("chatCount");
const joinSection = document.getElementById("joinSection");
const caInput = document.getElementById("caInput");
const joinBtn = document.getElementById("joinBtn");
const chat = document.getElementById("chat");
const messages = document.getElementById("messages");
const inputArea = document.getElementById("inputArea");
const adSpace = document.getElementById("adSpace");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const switchChatBtn = document.getElementById("switchChatBtn");
const renameChatBtn = document.getElementById("renameChatBtn");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalClose = document.getElementById("modalClose");

// Discover
const searchInput = document.getElementById("searchInput");
const discoverList = document.getElementById("discoverList");

// Referrals
const referralLink = document.getElementById("referralLink");
const copyRefLink = document.getElementById("copyRefLink");
const verifiedCount = document.getElementById("verifiedCount");
const pendingCount = document.getElementById("pendingCount");
const leaderboard = document.getElementById("leaderboard");
const referralList = document.getElementById("referralList");

// Profile
const profileAvatar = document.getElementById("profileAvatar");
const profileUsername = document.getElementById("profileUsername");
const verifiedBadge = document.getElementById("verifiedBadge");
const bioInput = document.getElementById("bioInput");
const walletInput = document.getElementById("walletInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const msgCount = document.getElementById("msgCount");
const refCount = document.getElementById("refCount");
const logoutBtn = document.getElementById("logoutBtn");
const changeAvatarBtn = document.getElementById("changeAvatarBtn");
const avatarInput = document.getElementById("avatarInput");

// Streak & Points
const streakCount = document.getElementById("streakCount");
const checkinBtn = document.getElementById("checkinBtn");
const nextStreakPoints = document.getElementById("nextStreakPoints");
const streakFill = document.getElementById("streakFill");
const currentDay = document.getElementById("currentDay");
const streakInfo = document.getElementById("streakInfo");
const totalPoints = document.getElementById("totalPoints");
const dailyPoints = document.getElementById("dailyPoints");

// Profile Modal
const profileModal = document.getElementById("profileModal");
const profileModalClose = document.getElementById("profileModalClose");

// ===== INITIALIZE =====
async function init() {
  chrome.storage.local.get(["authToken", "savedChats"], async (res) => {
    if (res.savedChats) savedChats = res.savedChats;
    
    if (res.authToken) {
      authToken = res.authToken;
      const user = await fetchCurrentUser();
      if (user) {
        currentUser = user;
        showMainApp();
        connectSocket();
        return;
      }
    }
    showAuthScreen();
  });
  
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get("ref");
  if (refCode) {
    regReferralCode.value = refCode;
    showRegister.click();
  }
}

// ===== AUTH FUNCTIONS =====
function showAuthScreen() {
  authScreen.classList.remove("hidden");
  mainApp.classList.add("hidden");
}

function showMainApp() {
  authScreen.classList.add("hidden");
  mainApp.classList.remove("hidden");
  updateProfileUI();
  loadSavedChats();
  loadDiscover();
  loadReferrals();
  loadStreak();
  loadPoints();
}

function showError(msg) {
  authError.textContent = msg;
  authError.classList.remove("hidden");
  setTimeout(() => authError.classList.add("hidden"), 5000);
}

async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error("Fetch user error:", err);
    return null;
  }
}

// Login
loginBtn.onclick = async () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  
  if (!username || !password) {
    showError("Please enter username and password");
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      showError(data.error || "Login failed");
      return;
    }
    
    authToken = data.token;
    currentUser = data.user;
    chrome.storage.local.set({ authToken });
    
    showMainApp();
    connectSocket();
  } catch (err) {
    console.error("Login error:", err);
    showError("Connection failed");
  }
};

// Register
registerBtn.onclick = async () => {
  const username = regUsername.value.trim();
  const password = regPassword.value;
  const referralCode = regReferralCode.value.trim();
  
  if (!username || !password) {
    showError("Please enter username and password");
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, referralCode })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      showError(data.error || "Registration failed");
      return;
    }
    
    authToken = data.token;
    currentUser = data.user;
    chrome.storage.local.set({ authToken });
    
    showMainApp();
    connectSocket();
  } catch (err) {
    console.error("Register error:", err);
    showError("Connection failed");
  }
};

// Toggle forms
showRegister.onclick = (e) => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
};

showLogin.onclick = (e) => {
  e.preventDefault();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
};

// Enter key
loginPassword.addEventListener("keydown", (e) => { if (e.key === "Enter") loginBtn.click(); });
regPassword.addEventListener("keydown", (e) => { if (e.key === "Enter") registerBtn.click(); });

// Logout
logoutBtn.onclick = () => {
  authToken = null;
  currentUser = null;
  chrome.storage.local.remove("authToken");
  if (socket) socket.disconnect();
  showAuthScreen();
};

// ===== SOCKET CONNECTION =====
function connectSocket() {
  socket = io(API_URL);
  
  socket.on("connect", () => {
    console.log("Connected to server!");
    socket.emit("authenticate", authToken);
  });
  
  socket.on("chat_history", (msgs) => {
    messages.innerHTML = "";
    msgs.forEach(m => renderMessage(m, m.user === currentUser.username));
  });
  
  socket.on("receive_message", (msg) => {
    renderMessage(msg, msg.user === currentUser.username);
  });
  
  socket.on("reaction_update", (data) => {
    updateMessageReactions(data.msgId, data.reactions);
  });
}

// ===== TABS =====
tabBtns.forEach(btn => {
  btn.onclick = () => {
    const tab = btn.dataset.tab;
    
    tabBtns.forEach(b => b.classList.remove("active"));
    tabPanels.forEach(p => p.classList.remove("active"));
    
    btn.classList.add("active");
    document.getElementById(`${tab}Tab`).classList.add("active");
    
    if (tab === "chat" && currentRoom) {
      inputArea.classList.remove("hidden");
    } else {
      inputArea.classList.add("hidden");
    }
    
    if (tab === "discover") loadDiscover();
    if (tab === "referrals") loadReferrals();
    if (tab === "profile") { loadStreak(); loadPoints(); }
  };
});

// ===== CHAT FUNCTIONS =====
function loadSavedChats() {
  chatsList.innerHTML = "";
  chatCount.textContent = savedChats.length;
  
  if (savedChats.length === 0) {
    chatsList.innerHTML = '<div class="empty-state">No saved chats yet</div>';
    return;
  }
  
  savedChats.forEach(c => {
    const item = document.createElement("div");
    item.className = "chat-item";
    item.innerHTML = `
      <div class="chat-item-icon">${c.name.slice(0,2).toUpperCase()}</div>
      <div class="chat-item-info">
        <div class="chat-item-name">${c.name}</div>
        <div class="chat-item-ca">${c.ca.slice(0,8)}...${c.ca.slice(-6)}</div>
      </div>
      <button class="chat-item-remove">✕</button>
    `;
    
    item.onclick = (e) => {
      if (!e.target.closest(".chat-item-remove")) joinRoom(c.ca);
    };
    
    item.querySelector(".chat-item-remove").onclick = (e) => {
      e.stopPropagation();
      savedChats = savedChats.filter(x => x.ca !== c.ca);
      chrome.storage.local.set({ savedChats });
      loadSavedChats();
    };
    
    chatsList.appendChild(item);
  });
}

function joinRoom(ca) {
  console.log("joinRoom called with CA:", ca);
  
  if (!socket || !socket.connected) {
    console.error("Socket not connected!");
    alert("Connection error. Please refresh the page.");
    return;
  }
  
  currentRoom = ca;
  messages.innerHTML = "";
  
  console.log("Emitting join_room event...");
  socket.emit("join_room", ca);
  chrome.storage.local.set({ lastCA: ca });
  
  if (!savedChats.find(c => c.ca === ca)) {
    savedChats.push({ ca, name: ca.slice(0,6) + "..." });
    chrome.storage.local.set({ savedChats });
  }
  
  headerTitle.textContent = getChatName(ca);
  roomStatus.textContent = ca.slice(0,8) + "..." + ca.slice(-6);
  
  console.log("Hiding join section, showing chat...");
  savedChatsDiv.classList.add("hidden");
  joinSection.classList.add("hidden");
  chat.classList.remove("hidden");
  inputArea.classList.remove("hidden");
  switchChatBtn.classList.remove("hidden");
  renameChatBtn.classList.remove("hidden");
  
  console.log("Room joined successfully:", ca);
  msgInput.focus();
}

function getChatName(ca) {
  const c = savedChats.find(x => x.ca === ca);
  return c ? c.name : ca.slice(0,6) + "...";
}

// Join button with better handling
function handleJoinRoom() {
  const ca = caInput.value.trim();
  if (ca && ca.length > 0) {
    console.log("Joining room:", ca);
    joinRoom(ca);
    caInput.value = "";
  } else {
    console.warn("No CA entered");
  }
}

joinBtn.onclick = handleJoinRoom;

// Handle Enter key
caInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleJoinRoom();
  }
});

// Handle paste event - auto-join after paste
caInput.addEventListener("paste", (e) => {
  setTimeout(() => {
    const ca = caInput.value.trim();
    if (ca && ca.length > 0) {
      console.log("Auto-joining after paste:", ca);
      handleJoinRoom();
    }
  }, 100);
});

switchChatBtn.onclick = () => {
  currentRoom = null;
  headerTitle.textContent = "Trench Chat";
  roomStatus.textContent = "Select a chat room";
  
  savedChatsDiv.classList.remove("hidden");
  joinSection.classList.remove("hidden");
  chat.classList.add("hidden");
  inputArea.classList.add("hidden");
  switchChatBtn.classList.add("hidden");
  renameChatBtn.classList.add("hidden");
  
  loadSavedChats();
};

renameChatBtn.onclick = () => {
  const c = savedChats.find(x => x.ca === currentRoom);
  if (!c) return;
  const name = prompt("Rename chat:", c.name);
  if (name && name.trim()) {
    c.name = name.trim();
    chrome.storage.local.set({ savedChats });
    headerTitle.textContent = c.name;
  }
};

// Send message
function sendMessage() {
  if (!msgInput.value.trim() || !currentRoom) return;
  
  socket.emit("send_message", {
    room: currentRoom,
    message: { user: currentUser.username, text: msgInput.value.trim() }
  });
  
  msgInput.value = "";
}

msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); sendMessage(); }
});

sendBtn.onclick = sendMessage;

// Emoji picker
emojiBtn.onclick = (e) => {
  e.stopPropagation();
  emojiPicker.classList.toggle("hidden");
};

document.querySelectorAll(".emoji").forEach(emoji => {
  emoji.onclick = () => {
    msgInput.value += emoji.textContent;
    emojiPicker.classList.add("hidden");
    msgInput.focus();
  };
});

// Image upload
imageBtn.onclick = () => imageInput.click();

imageInput.onchange = () => {
  const file = imageInput.files[0];
  if (!file || !currentRoom) return;
  
  const reader = new FileReader();
  reader.onload = () => {
    socket.emit("send_message", {
      room: currentRoom,
      message: { user: currentUser.username, image: reader.result }
    });
  };
  reader.readAsDataURL(file);
  imageInput.value = "";
};

// Image modal
window.openImageModal = (src) => {
  modalImage.src = src;
  imageModal.classList.remove("hidden");
};

modalClose.onclick = () => imageModal.classList.add("hidden");
document.querySelector("#imageModal .modal-backdrop").onclick = () => imageModal.classList.add("hidden");

// Close pickers
document.addEventListener("click", (e) => {
  if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
    emojiPicker.classList.add("hidden");
  }
  if (openPicker && !openPicker.contains(e.target) && !e.target.closest(".react-btn")) {
    openPicker.classList.remove("show");
    openPicker = null;
  }
});

// ===== RENDER MESSAGE =====
function renderMessage(msg, self = false) {
  const div = document.createElement("div");
  div.className = "message" + (self ? " self" : "");
  div.dataset.msgId = msg.id;
  
  const initial = msg.user ? msg.user.charAt(0).toUpperCase() : "?";
  
  let content = "";
  if (msg.image) content += `<img class="msg-image" src="${msg.image}" onclick="openImageModal(this.src)" />`;
  if (msg.text) content += `<div class="msg-text">${escapeHtml(msg.text)}</div>`;
  
  let reactionsHTML = "";
  if (msg.reactions && Object.keys(msg.reactions).length > 0) {
    reactionsHTML = '<div class="msg-reactions">';
    for (const [emoji, users] of Object.entries(msg.reactions)) {
      const active = users.includes(currentUser.username) ? "active" : "";
      reactionsHTML += `<span class="reaction ${active}" data-emoji="${emoji}">${emoji} <span class="reaction-count">${users.length}</span></span>`;
    }
    reactionsHTML += '</div>';
  }
  
  const pickerHTML = `<div class="reaction-picker">${REACTIONS.map(r => `<span class="reaction-option" data-emoji="${r}">${r}</span>`).join("")}</div>`;
  
  div.innerHTML = `
    <div class="msg-avatar" onclick="showUserProfile('${msg.user}')">${initial}</div>
    <div class="msg-content-wrapper">
      <div class="msg-content">
        <div class="msg-user" onclick="showUserProfile('${msg.user}')">${escapeHtml(msg.user)}</div>
        ${content}
        ${msg.time ? `<div class="msg-time">${formatTime(msg.time)}</div>` : ""}
      </div>
      ${reactionsHTML}
      ${pickerHTML}
    </div>
    <button class="react-btn">😊</button>
  `;
  
  const reactBtn = div.querySelector(".react-btn");
  const picker = div.querySelector(".reaction-picker");
  
  reactBtn.onclick = (e) => {
    e.stopPropagation();
    if (openPicker && openPicker !== picker) openPicker.classList.remove("show");
    picker.classList.toggle("show");
    openPicker = picker.classList.contains("show") ? picker : null;
  };
  
  div.querySelectorAll(".reaction-option").forEach(opt => {
    opt.onclick = (e) => {
      e.stopPropagation();
      socket.emit("add_reaction", { room: currentRoom, msgId: msg.id, emoji: opt.dataset.emoji, user: currentUser.username });
      picker.classList.remove("show");
      openPicker = null;
    };
  });
  
  div.querySelectorAll(".reaction").forEach(r => {
    r.onclick = (e) => {
      e.stopPropagation();
      socket.emit("add_reaction", { room: currentRoom, msgId: msg.id, emoji: r.dataset.emoji, user: currentUser.username });
    };
  });
  
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function updateMessageReactions(msgId, reactions) {
  const msgEl = document.querySelector(`.message[data-msg-id="${msgId}"]`);
  if (!msgEl) return;
  
  let reactionsDiv = msgEl.querySelector(".msg-reactions");
  if (!reactionsDiv) {
    reactionsDiv = document.createElement("div");
    reactionsDiv.className = "msg-reactions";
    const wrapper = msgEl.querySelector(".msg-content-wrapper");
    const picker = wrapper.querySelector(".reaction-picker");
    wrapper.insertBefore(reactionsDiv, picker);
  }
  
  reactionsDiv.innerHTML = "";
  for (const [emoji, users] of Object.entries(reactions)) {
    if (users.length === 0) continue;
    const active = users.includes(currentUser.username) ? "active" : "";
    const span = document.createElement("span");
    span.className = `reaction ${active}`;
    span.dataset.emoji = emoji;
    span.innerHTML = `${emoji} <span class="reaction-count">${users.length}</span>`;
    span.onclick = (e) => {
      e.stopPropagation();
      socket.emit("add_reaction", { room: currentRoom, msgId, emoji, user: currentUser.username });
    };
    reactionsDiv.appendChild(span);
  }
}

// ===== DISCOVER =====
async function loadDiscover() {
  try {
    const res = await fetch(`${API_URL}/api/discover/rooms`);
    const data = await res.json();
    renderDiscoverList(data.rooms);
  } catch (err) {
    console.error("Load discover error:", err);
    discoverList.innerHTML = '<div class="empty-state">Failed to load rooms</div>';
  }
}

function renderDiscoverList(rooms) {
  if (!rooms || rooms.length === 0) {
    discoverList.innerHTML = '<div class="empty-state">No active rooms yet</div>';
    return;
  }
  
  discoverList.innerHTML = rooms.map(r => `
    <div class="discover-item" data-ca="${r.ca}">
      <div class="discover-item-icon">💬</div>
      <div class="discover-item-info">
        <div class="discover-item-name">${r.name || r.ca.slice(0,8) + "..."}</div>
        <div class="discover-item-ca">${r.ca.slice(0,12)}...${r.ca.slice(-6)}</div>
      </div>
      <div class="discover-item-stats"><strong>${r.message_count || 0}</strong> msgs</div>
    </div>
  `).join("");
  
  discoverList.querySelectorAll(".discover-item").forEach(item => {
    item.onclick = () => {
      document.querySelector('[data-tab="chat"]').click();
      joinRoom(item.dataset.ca);
    };
  });
}

searchInput.addEventListener("input", async () => {
  const q = searchInput.value.trim();
  if (!q) { loadDiscover(); return; }
  
  try {
    const res = await fetch(`${API_URL}/api/discover/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    renderDiscoverList(data.rooms);
  } catch (err) {
    console.error("Search error:", err);
  }
});

// ===== REFERRALS =====
async function loadReferrals() {
  try {
    const res = await fetch(`${API_URL}/api/referrals`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const data = await res.json();
    
    referralLink.value = `trench.chat/ref/${data.referralCode}`;
    verifiedCount.textContent = data.stats.verified;
    pendingCount.textContent = data.stats.pending;
    
    if (data.referrals.length === 0) {
      referralList.innerHTML = '<div class="empty-state">No referrals yet</div>';
    } else {
      referralList.innerHTML = data.referrals.map(r => `
        <div class="referral-item">
          <div class="referral-item-avatar">${r.username.charAt(0).toUpperCase()}</div>
          <span class="referral-item-name">${r.username}</span>
          <span class="referral-item-status ${r.status}">${r.status}</span>
        </div>
      `).join("");
    }
    
    const lbRes = await fetch(`${API_URL}/api/referrals/leaderboard`);
    const lbData = await lbRes.json();
    
    if (lbData.leaderboard.length === 0) {
      leaderboard.innerHTML = '<div class="empty-state">No referrers yet</div>';
    } else {
      leaderboard.innerHTML = lbData.leaderboard.slice(0, 10).map((u, i) => {
        const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
        return `
          <div class="leaderboard-item">
            <span class="leaderboard-rank ${rankClass}">#${i + 1}</span>
            <div class="leaderboard-avatar">${u.username.charAt(0).toUpperCase()}</div>
            <span class="leaderboard-name">${u.username}</span>
            <span class="leaderboard-count">${u.referral_count}</span>
          </div>
        `;
      }).join("");
    }
  } catch (err) {
    console.error("Load referrals error:", err);
  }
}

copyRefLink.onclick = () => {
  referralLink.select();
  document.execCommand("copy");
  copyRefLink.textContent = "✅ Copied!";
  setTimeout(() => copyRefLink.textContent = "📋 Copy", 2000);
};

// ===== STREAK =====
async function loadStreak() {
  try {
    const res = await fetch(`${API_URL}/api/streak`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const data = await res.json();
    
    streakCount.textContent = data.currentStreak;
    currentDay.textContent = data.currentStreak;
    nextStreakPoints.textContent = data.nextPoints;
    
    const progress = (data.currentStreak / 30) * 100;
    streakFill.style.width = `${progress}%`;
    
    if (data.canCheckin) {
      checkinBtn.disabled = false;
      checkinBtn.innerHTML = `Check In (+${data.nextPoints} pts)`;
      streakInfo.textContent = "Check in daily to earn bonus points!";
    } else {
      checkinBtn.disabled = true;
      checkinBtn.textContent = "✅ Checked In Today";
      const nextCheckin = new Date(data.nextCheckin);
      const now = new Date();
      const hours = Math.floor((nextCheckin - now) / 3600000);
      const mins = Math.floor(((nextCheckin - now) % 3600000) / 60000);
      streakInfo.textContent = `Next check-in in ${hours}h ${mins}m`;
    }
  } catch (err) {
    console.error("Load streak error:", err);
  }
}

checkinBtn.onclick = async () => {
  if (checkinBtn.disabled) return;
  
  try {
    checkinBtn.disabled = true;
    checkinBtn.textContent = "Checking in...";
    
    const res = await fetch(`${API_URL}/api/checkin`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    
    const data = await res.json();
    
    if (res.ok) {
      checkinBtn.innerHTML = `🎉 +${data.pointsEarned} pts!`;
      streakCount.textContent = data.streak;
      currentDay.textContent = data.streak;
      
      const progress = (data.streak / 30) * 100;
      streakFill.style.width = `${progress}%`;
      
      if (data.streak === 30) {
        streakInfo.textContent = "🏆 30-day streak complete! Resets tomorrow.";
      } else {
        streakInfo.textContent = `Day ${data.streak} complete! Keep it going!`;
      }
      
      loadPoints();
      setTimeout(() => { checkinBtn.textContent = "✅ Checked In Today"; }, 2000);
    } else {
      checkinBtn.textContent = data.error || "Already checked in";
      setTimeout(() => loadStreak(), 2000);
    }
  } catch (err) {
    console.error("Checkin error:", err);
    checkinBtn.textContent = "Error - try again";
    setTimeout(() => loadStreak(), 2000);
  }
};

// ===== POINTS =====
async function loadPoints() {
  try {
    const res = await fetch(`${API_URL}/api/points`, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    const data = await res.json();
    
    totalPoints.textContent = data.totalPoints.toLocaleString();
    dailyPoints.textContent = data.dailyPoints;
  } catch (err) {
    console.error("Load points error:", err);
  }
}

// ===== PROFILE =====
function updateProfileUI() {
  if (!currentUser) return;
  
  profileUsername.textContent = currentUser.username;
  avatarPreview.src = currentUser.avatar_url || "";
  profileAvatar.src = currentUser.avatar_url || "";
  bioInput.value = currentUser.bio || "";
  walletInput.value = currentUser.sol_wallet || "";
  msgCount.textContent = currentUser.message_count || 0;
  
  if (currentUser.is_verified) {
    verifiedBadge.classList.remove("hidden");
  } else {
    verifiedBadge.classList.add("hidden");
  }
}

saveProfileBtn.onclick = async () => {
  try {
    const res = await fetch(`${API_URL}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({ bio: bioInput.value, sol_wallet: walletInput.value })
    });
    
    const data = await res.json();
    if (res.ok) {
      currentUser = { ...currentUser, ...data.user };
      saveProfileBtn.textContent = "✅ Saved!";
      setTimeout(() => saveProfileBtn.textContent = "Save Profile", 2000);
    }
  } catch (err) {
    console.error("Save profile error:", err);
  }
};

changeAvatarBtn.onclick = () => avatarInput.click();

avatarInput.onchange = async () => {
  const file = avatarInput.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
        body: JSON.stringify({ avatar_url: reader.result })
      });
      
      const data = await res.json();
      if (res.ok) {
        currentUser.avatar_url = data.user.avatar_url;
        profileAvatar.src = data.user.avatar_url;
        avatarPreview.src = data.user.avatar_url;
      }
    } catch (err) {
      console.error("Upload avatar error:", err);
    }
  };
  reader.readAsDataURL(file);
};

// Show user profile modal
window.showUserProfile = async (username) => {
  try {
    const res = await fetch(`${API_URL}/api/profile/${username}`);
    const data = await res.json();
    
    if (res.ok) {
      document.getElementById("modalProfileAvatar").src = data.user.avatar_url || "";
      document.getElementById("modalProfileUsername").textContent = data.user.username;
      document.getElementById("modalProfileBio").textContent = data.user.bio || "No bio yet";
      document.getElementById("modalMsgCount").textContent = data.user.message_count || 0;
      document.getElementById("modalRefCount").textContent = data.user.referral_count || 0;
      
      const badge = document.getElementById("modalVerifiedBadge");
      if (data.user.is_verified) badge.classList.remove("hidden");
      else badge.classList.add("hidden");
      
      profileModal.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Load profile error:", err);
  }
};

profileModalClose.onclick = () => profileModal.classList.add("hidden");
document.querySelector("#profileModal .modal-backdrop").onclick = () => profileModal.classList.add("hidden");

// ===== HELPERS =====
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ===== START =====
init();