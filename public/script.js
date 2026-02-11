// 🔐 STATE MANAGEMENT
const state = {
  sessionToken: localStorage.getItem('sessionToken'),
  userEmail: localStorage.getItem('userEmail'),
  userName: localStorage.getItem('userName') || 'Tuan Tama',
  displayName: localStorage.getItem('displayName') || 'Tuan Tama',
  profilePhoto: localStorage.getItem('profilePhoto') || 'https://ui-avatars.com/api/?name=Tuan+Tama&background=000&color=00aa00',
  conversations: JSON.parse(localStorage.getItem('conversations')) || {},
  currentConversationId: localStorage.getItem('currentConversationId') || null,
  attachedFile: null
};

// 🔗 DOM ELEMENTS
const loginModal = document.getElementById('loginModal');
const chatInterface = document.getElementById('chatInterface');
const emailInput = document.getElementById('emailInput');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const otpSection = document.getElementById('otpSection');
const otpInput = document.getElementById('otpInput');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const attachFileBtn = document.getElementById('attachFileBtn');
const fileInput = document.getElementById('fileInput');
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

// 🎯 INITIALIZE APP
function initializeApp() {
  if (state.sessionToken && state.userEmail) {
    showChatInterface();
    renderConversationHistory();
    loadLatestConversation();
  }
}

// 🔐 GOOGLE OAUTH SETUP
function setupGoogleOAuth() {
  window.google.accounts.id.initialize({
    client_id: '164055469439-65jpo9bkenifr28df97i6l4g5vlvfiem.apps.googleusercontent.com',
    callback: handleGoogleSignIn
  });

  window.google.accounts.id.renderButton(
    document.getElementById('googleSignInContainer'),
    {
      theme: 'dark',
      size: 'large',
      width: '100%'
    }
  );
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

// 📧 SEND OTP
sendOtpBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Masukkan email yang valid');
    return;
  }

  sendOtpBtn.disabled = true;
  sendOtpBtn.textContent = '⏳ Mengirim...';

  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      state.userEmail = email;
      otpSection.classList.remove('hidden');
      sendOtpBtn.textContent = 'Kirim OTP';
      alert('✅ OTP telah dikirim ke email Anda!');
      otpInput.focus();
    } else {
      alert('❌ ' + data.error);
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    alert('Gagal mengirim OTP');
  } finally {
    sendOtpBtn.disabled = false;
  }
});

// ✅ VERIFY OTP
verifyOtpBtn.addEventListener('click', async () => {
  const otp = otpInput.value.trim();

  if (otp.length !== 6 || !/^\d+$/.test(otp)) {
    alert('Kode OTP harus 6 angka');
    return;
  }

  verifyOtpBtn.disabled = true;
  verifyOtpBtn.textContent = '⏳ Verifikasi...';

  try {
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: state.userEmail,
        otp: otp
      })
    });

    const data = await response.json();

    if (response.ok) {
      state.sessionToken = data.sessionToken;
      state.userName = state.userEmail.split('@')[0];
      state.displayName = state.userName;
      
      createSession();
      showChatInterface();
      alert('✅ Login berhasil!');
    } else {
      alert('❌ ' + data.error);
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    alert('Gagal memverifikasi OTP');
  } finally {
    verifyOtpBtn.disabled = false;
  }
});

// 💾 CREATE SESSION (Save to localStorage)
function createSession() {
  localStorage.setItem('sessionToken', state.sessionToken);
  localStorage.setItem('userEmail', state.userEmail);
  localStorage.setItem('userName', state.userName);
  localStorage.setItem('displayName', state.displayName);
  localStorage.setItem('profilePhoto', state.profilePhoto);
  updateUI();
}

// 🖼️ UPDATE UI WITH USER DATA
function updateUI() {
  headerUserName.textContent = `${state.displayName} (${state.userEmail})`;
  document.getElementById('usernameInput').value = state.userName;
  document.getElementById('displayNameInput').value = state.displayName;
  document.getElementById('profilePhotoInput').value = state.profilePhoto;
}

// 🎨 SHOW CHAT INTERFACE
function showChatInterface() {
  loginModal.classList.add('hidden');
  chatInterface.classList.remove('hidden');
  updateUI();
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
  settingsModal.classList.add('show');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

savSettingsBtn.addEventListener('click', () => {
  state.userName = document.getElementById('usernameInput').value || state.userName;
  state.displayName = document.getElementById('displayNameInput').value || state.displayName;
  state.profilePhoto = document.getElementById('profilePhotoInput').value || state.profilePhoto;

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

function saveConversations() {
  localStorage.setItem('conversations', JSON.stringify(state.conversations));
  localStorage.setItem('currentConversationId', state.currentConversationId);
}

function renderConversationHistory() {
  const conversations = Object.entries(state.conversations);
  
  if (conversations.length === 0) {
    historyContainer.innerHTML = '<p class="text-xs text-gray-600">Belum ada riwayat chat</p>';
    return;
  }

  historyContainer.innerHTML = conversations.map(([id, messages]) => {
    const firstMessage = messages[0]?.content?.substring(0, 30) + '...' || 'Chat tanpa judul';
    const isActive = state.currentConversationId === id;
    return `
      <button 
        onclick="loadConversation('${id}')" 
        class="w-full text-left px-3 py-2 text-sm rounded ${
          isActive ? 'bg-green-900 text-green-300' : 'bg-gray-900 hover:bg-gray-800'
        } truncate"
        title="${firstMessage}">
        💬 ${firstMessage}
      </button>
    `;
  }).join('');
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
