// 🔐 STATE MANAGEMENT
const state = {
  sessionToken: localStorage.getItem('sessionToken'),
  userEmail: localStorage.getItem('userEmail'),
  userName: localStorage.getItem('userName') || 'Tuan Tama',
  displayName: localStorage.getItem('displayName') || 'Tuan Tama',
  profilePhoto: localStorage.getItem('profilePhoto') || '👨‍💻',
  userId: localStorage.getItem('userId'),
  conversations: JSON.parse(localStorage.getItem('conversations')) || {},
  currentConversationId: localStorage.getItem('currentConversationId') || null,
  attachedFile: null,
  authMode: 'login', // login, register, otp
  registerEmail: null,
  registerUsername: null,
  responseMode: 'chat', // chat, thinking, complex, coding
  conversationTitles: JSON.parse(localStorage.getItem('conversationTitles')) || {}
};

// 🔗 DOM ELEMENTS
const authModal = document.getElementById('authModal');
const chatInterface = document.getElementById('chatInterface');

// Auth Forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const otpForm = document.getElementById('otpForm');

// Login Elements
const loginEmailInput = document.getElementById('loginEmailInput');
const loginPasswordInput = document.getElementById('loginPasswordInput');
const loginBtn = document.getElementById('loginBtn');
const switchToRegisterBtn = document.getElementById('switchToRegisterBtn');

// Register Elements
const registerUsername = document.getElementById('registerUsername');
const registerDisplayName = document.getElementById('registerDisplayName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerBtn = document.getElementById('registerBtn');
const registerAvatar = document.getElementById('registerAvatar');
const registerPhotoFile = document.getElementById('registerPhotoFile');
const switchToLoginBtn = document.getElementById('switchToLoginBtn');
const avatarButtons = document.querySelectorAll('.avatar-btn');

// OTP Elements
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const resendOtpBtn = document.getElementById('resendOtpBtn');
const otpCode = document.getElementById('otpCode');
const otpInputs = document.querySelectorAll('.otp-input');

// Chat Elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const attachFileBtn = document.getElementById('attachFileBtn');
const fileInput = document.getElementById('fileInput');
const modeBtn = document.getElementById('modeBtn');
const modeModal = document.getElementById('modeModal');
const newChatBtn = document.getElementById('newChatBtn');
const logoutBtn = document.getElementById('logoutBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const savSettingsBtn = document.getElementById('savSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const headerUserName = document.getElementById('headerUserName');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const historyContainer = document.getElementById('historyContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const attachedFileName = document.getElementById('attachedFileName');
const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
const profilePhotoFile = document.getElementById('profilePhotoFile');
const profilePhotoInput = document.getElementById('profilePhotoInput');
const modeThinkingBtn = document.getElementById('mode-thinking');
const modeComplexBtn = document.getElementById('mode-complex');
const modeCodingBtn = document.getElementById('mode-coding');
const modeChatBtn = document.getElementById('mode-chat');

// 🎯 INITIALIZE APP
function initializeApp() {
  if (state.sessionToken && state.userEmail) {
    showChatInterface();
    renderConversationHistory();
    loadLatestConversation();
  } else {
    showAuthModal();
  }
}

// 🔀 AUTH TAB SWITCHING
switchToRegisterBtn.addEventListener('click', () => {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  state.authMode = 'register';
});

switchToLoginBtn.addEventListener('click', () => {
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  state.authMode = 'login';
});

// 🎨 AVATAR SELECTION
avatarButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    avatarButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    registerAvatar.value = btn.dataset.avatar;
  });
});

// Set default avatar
avatarButtons[0].classList.add('selected');

// 📸 PHOTO FILE UPLOAD
registerPhotoFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      registerAvatar.value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// 🔐 GOOGLE OAUTH SETUP
function setupGoogleOAuth() {
  window.google.accounts.id.initialize({
    client_id: '164055469439-65jpo9bkenifr28df97i6l4g5vlvfiem.apps.googleusercontent.com',
    callback: handleGoogleSignIn
  });

  // Add click handler to custom Google button
  document.getElementById('googleSignInBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInBtn'),
          {
            theme: 'dark',
            size: 'large',
            width: '100%'
          }
        );
      }
    });
  });
}

// 📧 GOOGLE SIGN-IN HANDLER
async function handleGoogleSignIn(response) {
  try {
    const token = response.credential;
    const decodedToken = parseJwt(token);
    
    state.userEmail = decodedToken.email;
    state.userName = decodedToken.name;
    state.displayName = decodedToken.name;
    state.profilePhoto = decodedToken.picture;
    
    createSession();
    showChatInterface();
  } catch (error) {
    console.error('Google Sign-In error:', error);
    alert('Gagal login dengan Google');
  }
}

// 📧 LOGIN
loginBtn.addEventListener('click', async () => {
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('❌ Email tidak valid');
    return;
  }

  if (!password || password.length < 8) {
    alert('❌ Password minimal 8 karakter');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = '⏳ Masuk...';

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      state.sessionToken = data.sessionToken;
      state.userEmail = data.user.email;
      state.userName = data.user.username;
      state.displayName = data.user.displayName;
      state.profilePhoto = data.user.profilePhoto;
      state.userId = data.user.userId;
      
      createSession();
      showChatInterface();
      alert('✅ Login berhasil!');
    } else {
      alert('❌ ' + data.error);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('❌ Gagal login');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Masuk';
  }
});

// 📝 REGISTER
registerBtn.addEventListener('click', async () => {
  const username = registerUsername.value.trim().toLowerCase();
  const displayName = registerDisplayName.value.trim() || username;
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();
  const avatar = registerAvatar.value;

  if (!username || !/^[a-zA-Z0-9_-]+$/.test(username)) {
    alert('❌ Username hanya alphanumeric, underscore, dan dash');
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('❌ Email tidak valid');
    return;
  }

  if (!password || password.length < 8) {
    alert('❌ Password minimal 8 karakter');
    return;
  }

  registerBtn.disabled = true;
  registerBtn.textContent = '⏳ Membuat akun...';

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        displayName,
        email,
        password,
        profilePhoto: avatar
      })
    });

    const data = await response.json();

    if (response.ok) {
      state.registerEmail = email;
      state.registerUsername = username;
      state.displayName = displayName;
      state.profilePhoto = avatar;
      
      loginForm.classList.add('hidden');
      registerForm.classList.add('hidden');
      otpForm.classList.remove('hidden');
      
      alert('✅ Akun dibuat! Kode OTP terkirim ke email Anda');
      otpInputs[0].focus();
    } else {
      alert('❌ ' + data.error);
    }
  } catch (error) {
    console.error('Register error:', error);
    alert('❌ Gagal membuat akun');
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = 'Buat Akun';
  }
});

// 🔢 OTP INPUT HANDLING
otpInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    if (e.target.value.length === 1) {
      if (index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    }
    updateOtpCode();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      otpInputs[index - 1].focus();
    }
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    paste.split('').forEach((char, i) => {
      if (i < otpInputs.length) {
        otpInputs[i].value = char;
      }
    });
    updateOtpCode();
  });
});

function updateOtpCode() {
  const code = Array.from(otpInputs).map(input => input.value).join('');
  otpCode.value = code;
}

// ✅ VERIFY OTP (Register)
verifyOtpBtn.addEventListener('click', async () => {
  const otp = otpCode.value.trim();

  if (otp.length !== 6 || !/^\d+$/.test(otp)) {
    alert('❌ Kode OTP harus 6 angka');
    return;
  }

  verifyOtpBtn.disabled = true;
  verifyOtpBtn.textContent = '⏳ Verifikasi...';

  try {
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: state.registerEmail,
        username: state.registerUsername,
        otp: otp
      })
    });

    const data = await response.json();

    if (response.ok) {
      state.sessionToken = data.sessionToken;
      state.userEmail = data.email;
      state.userName = data.username || state.registerUsername;
      state.displayName = data.displayName || state.displayName;
      state.profilePhoto = data.profilePhoto || state.profilePhoto;
      state.userId = data.userId;
      
      createSession();
      showChatInterface();
      alert('✅ Email terverifikasi! Selamat datang!');
    } else {
      alert('❌ ' + data.error);
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    alert('❌ Gagal memverifikasi OTP');
  } finally {
    verifyOtpBtn.disabled = false;
    verifyOtpBtn.textContent = 'Verifikasi';
  }
});

// 🔄 RESEND OTP
resendOtpBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.registerEmail })
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ OTP terkirim kembali!');
      otpInputs.forEach(input => input.value = '');
      otpInputs[0].focus();
    } else {
      alert('❌ ' + data.error);
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    alert('❌ Gagal mengirim ulang OTP');
  }
});

// 💾 CREATE SESSION (Save to localStorage)
function createSession() {
  localStorage.setItem('sessionToken', state.sessionToken);
  localStorage.setItem('userEmail', state.userEmail);
  localStorage.setItem('userName', state.userName);
  localStorage.setItem('displayName', state.displayName);
  localStorage.setItem('profilePhoto', state.profilePhoto);
  localStorage.setItem('userId', state.userId);
  updateUI();
}

// 🖼️ UPDATE UI WITH USER DATA
function updateUI() {
  headerUserName.textContent = `${state.displayName} (@${state.userName})`;
  document.getElementById('usernameInput').value = state.userName;
  document.getElementById('displayNameInput').value = state.displayName;
  document.getElementById('profilePhotoInput').value = state.profilePhoto;
}

// 🎨 SHOW CHAT INTERFACE
function showChatInterface() {
  authModal.classList.add('hidden');
  chatInterface.classList.remove('hidden');
  updateUI();
}

// 🔐 SHOW AUTH MODAL
function showAuthModal() {
  authModal.classList.remove('hidden');
  chatInterface.classList.add('hidden');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  otpForm.classList.add('hidden');
}

// 🚪 LOGOUT
logoutBtn.addEventListener('click', () => {
  if (confirm('Apakah Anda yakin ingin logout?')) {
    localStorage.clear();
    state.sessionToken = null;
    state.userEmail = null;
    state.conversations = {};
    location.reload();
  }
});

// 💬 SEND MESSAGE
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  let message = messageInput.value.trim();
  
  // Include file content if attached
  if (state.attachedFile) {
    message = `[FILE: ${state.attachedFile.name}]\n${state.attachedFile.content}\n\n---\n${message}`;
  }

  if (!message) {
    alert('Masukkan pesan terlebih dahulu');
    return;
  }

  if (!state.sessionToken) {
    alert('Sesi Anda telah expired, silahkan login kembali');
    location.reload();
    return;
  }

  // Create conversation if needed
  if (!state.currentConversationId) {
    state.currentConversationId = 'chat_' + Date.now();
    state.conversations[state.currentConversationId] = [];
  }

  // Add user message
  const userMessage = { role: 'user', content: message };
  state.conversations[state.currentConversationId].push(userMessage);
  
  displayMessage('user', message);
  messageInput.value = '';
  state.attachedFile = null;
  fileNameDisplay.classList.add('hidden');

  // Show thinking indicator
  loadingOverlay.classList.remove('hidden');

  try {
    const response = await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        conversationHistory: state.conversations[state.currentConversationId].slice(0, -1),
        sessionToken: state.sessionToken
      })
    });

    loadingOverlay.classList.add('hidden');

    if (!response.ok) {
      const error = await response.json();
      displayMessage('ai', `❌ Error: ${error.error}`);
      return;
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessage = '';
    let messageElement = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          if (data.error) {
            displayMessage('ai', `❌ ${data.error}`);
            break;
          }

          if (data.content) {
            aiMessage += data.content;
            
            if (!messageElement) {
              messageElement = createMessageElement('ai', '');
              messagesContainer.appendChild(messageElement);
            }

            const contentElement = messageElement.querySelector('.message-content');
            contentElement.innerHTML = marked.parse(aiMessage);
            addCopyButtons(contentElement);
            scrollToBottom();
          }
        }
      }
    }

    // Save AI message to conversation
    if (aiMessage) {
      state.conversations[state.currentConversationId].push({
        role: 'assistant',
        content: aiMessage
      });
      saveConversations();
      renderConversationHistory();
    }

  } catch (error) {
    console.error('Error sending message:', error);
    loadingOverlay.classList.add('hidden');
    displayMessage('ai', `❌ Terjadi kesalahan: ${error.message}`);
  }
}

// 💬 DISPLAY MESSAGE
function displayMessage(role, content) {
  const messageElement = createMessageElement(role, content);
  messagesContainer.appendChild(messageElement);
  scrollToBottom();
}

// 🎨 CREATE MESSAGE ELEMENT
function createMessageElement(role, content) {
  const div = document.createElement('div');
  div.className = 'flex gap-2';

  if (role === 'user') {
    div.className += ' justify-end';
    div.innerHTML = `
      <div class="chat-bubble user-bubble">
        <div class="message-content">${escapeHtml(content)}</div>
      </div>
    `;
  } else {
    div.className += ' justify-start';
    div.innerHTML = `
      <div class="chat-bubble ai-bubble">
        <div class="message-content">${content}</div>
      </div>
    `;
  }

  return div;
}

// 📌 ADD COPY BUTTONS TO CODE BLOCKS
function addCopyButtons(element) {
  const codeBlocks = element.querySelectorAll('pre code, code');
  
  codeBlocks.forEach((block) => {
    if (block.parentElement.tagName === 'PRE') {
      const pre = block.parentElement;
      if (!pre.querySelector('.copy-btn')) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = '📋 Copy';
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(block.textContent);
          copyBtn.textContent = '✅ Copied!';
          setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
        };
        pre.style.position = 'relative';
        pre.appendChild(copyBtn);
      }
    }
  });
}

// 📎 ATTACH FILE
attachFileBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const reader = new FileReader();
    reader.onload = (event) => {
      state.attachedFile = {
        name: file.name,
        content: event.target.result
      };
      attachedFileName.textContent = file.name;
      fileNameDisplay.classList.remove('hidden');
    };
    reader.readAsText(file);
  } catch (error) {
    console.error('Error reading file:', error);
    alert('Gagal membaca file');
  }
});

// ⚙️ SETTINGS
settingsBtn.addEventListener('click', () => {
  // Populate current values
  document.getElementById('usernameInput').value = state.userName;
  document.getElementById('displayNameInput').value = state.displayName;
  document.getElementById('profilePhotoPreview').textContent = state.profilePhoto;
  settingsModal.classList.add('show');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

// 🎨 EMOJI SELECTION FOR PROFILE
document.querySelectorAll('.emoji-select').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const emoji = btn.dataset.emoji;
    document.getElementById('profilePhotoPreview').textContent = emoji;
    document.getElementById('profilePhotoInput').value = emoji;
    document.querySelectorAll('.emoji-select').forEach(b => b.style.borderColor = '');
    btn.style.borderColor = '#00f3ff';
  });
});

// 📷 PHOTO UPLOAD HANDLER
uploadPhotoBtn.addEventListener('click', async () => {
  const file = profilePhotoFile.files[0];
  if (!file) {
    alert('Pilih file terlebih dahulu');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('File terlalu besar (max 5MB)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('profilePhotoPrefix').value = e.target.result;
    document.getElementById('profilePhotoPreview').style.backgroundImage = `url(${e.target.result})`;
    document.getElementById('profilePhotoPreview').textContent = '';
  };
  reader.readAsDataURL(file);
});

savSettingsBtn.addEventListener('click', () => {
  state.displayName = document.getElementById('displayNameInput').value || state.displayName;
  state.profilePhoto = document.getElementById('profilePhotoInput').value || state.profilePhoto;

  // Sync preview
  const photoPreview = document.getElementById('profilePhotoPreview');
  if (state.profilePhoto.startsWith('data:')) {
    photoPreview.style.backgroundImage = `url(${state.profilePhoto})`;
    photoPreview.textContent = '';
  } else {
    photoPreview.style.backgroundImage = '';
    photoPreview.textContent = state.profilePhoto;
  }

  createSession();
  alert('✅ Pengaturan tersimpan!');
  settingsModal.classList.remove('show');
});

// 📋 CONVERSATION HISTORY
newChatBtn.addEventListener('click', () => {
  state.currentConversationId = null;
  messagesContainer.innerHTML = `
    <div class="text-center text-gray-500">
      <p class="text-2xl mb-2">👋</p>
      <p>Halo, Tuan Tama! Siap untuk berdiskusi?</p>
      <p class="text-xs text-gray-600 mt-2">Saya menggunakan Gemini 2.0 untuk chat cepat dan Claude 3.5 untuk coding</p>
    </div>
  `;
});

// 🎯 MODE SWITCHER
modeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  modeModal.classList.add('show');
});

// Close mode modal when clicking outside
modeModal.addEventListener('click', (e) => {
  if (e.target === modeModal) {
    modeModal.classList.remove('show');
  }
});

// Mode selector buttons
const modeButtons = {
  'thinking': modeThinkingBtn,
  'complex': modeComplexBtn,
  'coding': modeCodingBtn,
  'chat': modeChatBtn
};

Object.entries(modeButtons).forEach(([mode, btn]) => {
  if (btn) {
    btn.addEventListener('click', () => {
      state.responseMode = mode;
      
      // Update button styling
      Object.values(modeButtons).forEach(b => b?.classList.remove('border-cyan-400'));
      Object.values(modeButtons).forEach(b => b?.classList.add('border-gray-700'));
      btn.classList.remove('border-gray-700');
      btn.classList.add('border-cyan-400');
      
      // Update mode button text
      const modeEmojis = {
        'thinking': '💭 Thinking',
        'complex': '🔍 Complex',
        'coding': '💻 Coding',
        'chat': '💬 Chat'
      };
      modeBtn.textContent = modeEmojis[mode];
      
      modeModal.classList.remove('show');
    });
  }
});

function saveConversations() {
  localStorage.setItem('conversations', JSON.stringify(state.conversations));
  localStorage.setItem('conversationTitles', JSON.stringify(state.conversationTitles));
  localStorage.setItem('currentConversationId', state.currentConversationId);
}

// 🏷️ AUTO-GENERATE CONVERSATION TITLE
function generateConversationTitle(conversationId) {
  const messages = state.conversations[conversationId] || [];
  if (messages.length === 0) return 'Chat tanpa judul';

  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'Chat tanpa judul';

  // Extract first 3-4 words from the first message
  const words = firstUserMessage.content.trim().split(/\s+/).slice(0, 4);
  let title = words.join(' ');

  // Clean up if it's too long
  if (title.length > 40) {
    title = title.substring(0, 40) + '...';
  }

  // Remove file markers if present
  title = title.replace(/\[FILE:.*?\]/, '').trim();

  return title || 'Chat tanpa judul';
}

function renderConversationHistory() {
  const conversations = Object.entries(state.conversations);
  
  if (conversations.length === 0) {
    historyContainer.innerHTML = '<p class="text-xs text-gray-600">Belum ada riwayat chat</p>';
    return;
  }

  historyContainer.innerHTML = conversations.map(([id, messages]) => {
    // Use auto-generated or stored title
    let title = state.conversationTitles[id];
    if (!title) {
      title = generateConversationTitle(id);
      state.conversationTitles[id] = title;
    }

    const isActive = state.currentConversationId === id;
    return `
      <button 
        onclick="loadConversation('${id}')" 
        class="history-item ${isActive ? 'active' : ''}"
        title="${title}"
      >
        <span class="history-title">💬 ${title}</span>
        <span class="history-time">→</span>
      </button>
    `;
  }).join('');

  saveConversations();
}

function loadConversation(conversationId) {
  state.currentConversationId = conversationId;
  saveConversations();
  messagesContainer.innerHTML = '';

  const messages = state.conversations[conversationId] || [];
  messages.forEach((msg) => {
    displayMessage(msg.role, msg.content);
  });

  renderConversationHistory();
}

function loadLatestConversation() {
  const conversations = Object.keys(state.conversations);
  if (conversations.length > 0) {
    state.currentConversationId = conversations[conversations.length - 1];
    loadConversation(state.currentConversationId);
  }
}

// 📱 SIDEBAR TOGGLE (MOBILE)
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Scroll to bottom of messages
function scrollToBottom() {
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 0);
}

// UTILITY: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// UTILITY: Parse JWT
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
  return JSON.parse(jsonPayload);
}

// 🚀 INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
  setupGoogleOAuth();
  initializeApp();
});
