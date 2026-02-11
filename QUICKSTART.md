# 🚀 Quick Start Guide - TamAi v3

## Prerequisites
- Node.js 16+ installed
- Gmail account with app password set up
- OpenRouter API key (free signup)
- Modern browser (Chrome, Firefox, Safari, Edge)

---

## ⚙️ Setup (One-Time)

### 1. Clone & Install
```bash
cd /workspaces/TamAiV3
npm install
```

### 2. Configure .env
```bash
# Copy the example
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Add your credentials:
```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
OPENROUTER_API_KEY=your_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id
PORT=3000
NODE_ENV=development
```

**How to get credentials:**
- **Gmail App Password**: Google Account → Security → App passwords (create for Mail/Windows)
- **OpenRouter API**: openrouter.io → Sign up → API keys
- **Google OAuth**: console.cloud.google.com → Create OAuth 2.0 credentials

### 3. Start Server
```bash
npm start
```

Expected output:
```
╔═══════════════════════════════╗
║   TamAi v3 - Server Running   ║
║   http://localhost:3000       ║
╚═══════════════════════════════╝
```

### 4. Open in Browser
```
http://localhost:3000
```

You should see the TamAi login/register interface.

---

## 👤 Create Your First Account

### Step 1: Register
1. Click the **"Register"** tab on login modal
2. Fill in:
   - **Username**: `demo123` (only alphanumeric, underscore, dash)
   - **Display Name**: `My Name`
   - **Email**: Your actual email (Gmail recommended)
   - **Password**: Something with 8+ chars (e.g., `Password123!`)
   - **Avatar**: Pick any avatar
3. Click **"Buat Akun"** (Create Account)

### Step 2: Verify Email
1. Check your email inbox (also check spam folder)
2. Look for "TamAi v3 - Kode OTP Verifikasi Pendaftaran"
3. Copy the 6-digit code
4. Enter all 6 digits in the OTP input fields (auto-advances)
5. Click **"Verifikasi"** (Verify)

### Step 3: Welcome!
After verification, you'll see:
- ✅ Chat interface loads
- ✅ Your name appears top-right
- ✅ Ready to chat!

---

## 💬 Start Chatting

### Send Your First Message
1. Type a message: `"Hello, what can you do?"`
2. Press **Enter** or click send button
3. Watch AI respond in real-time

### Features to Try

**General Chat**
```
"What is the capital of France?"
"Tell me about machine learning"
"Who won the World Cup in 2022?"
```
→ Uses `google/gemini-2.0-flash-001` (fast chat)

**Code Requests** (auto-detects and switches model)
```
"Write a Python function to calculate factorial"
"Create a React component for a todo app"
"How do I hash a password in JavaScript?"
```
→ Uses `anthropic/claude-3.5-sonnet` (better for coding)

**Upload Files**
1. Click file attachment button 📎
2. Select a file (.txt, .js, .py, .html, .pdf)
3. Send message: `"Analyze this code"` or `"Fix the errors"`
4. AI reads and analyzes your file

**View Conversation History**
- Left sidebar shows all your conversations
- Click any to reload that conversation
- Each conversation auto-saves

---

## 🔐 Login Again Later

### First-Time Login
1. Visit `http://localhost:3000`
2. Click **"Login"** tab
3. Enter your email and password
4. Click **"Masuk"** (Sign In)

### Automatic Login
If you login and don't close the browser:
- Page refresh = Still logged in ✓
- Data persists in browser storage ✓
- Just start chatting ✓

### Logout
1. Click ⚙️ Settings icon
2. Click **"Logout"**
3. Returns to login modal

---

## 📁 Project Structure

```
TamAiV3/
├── server.js                 # Node.js server + API endpoints
├── package.json              # Dependencies
├── .env                       # Your credentials (NOT in git)
├── .env.example               # Template for .env
├── .gitignore                 # Files excluded from git
│
├── public/                    # Frontend served to browser
│   ├── index.html             # Login modal + chat UI
│   ├── script.js              # All JavaScript logic
│   └── style.css              # Tailwind CSS (in HTML)
│
├── uploads/                   # Uploaded files storage
│   └── (generated automatically)
│
└── Docs/                      # Documentation files
    ├── README.md
    ├── SETUP.md
    ├── API.md
    ├── AUTHENTICATION_FLOW.md
    └── ...
```

---

## 🔌 API Endpoints Reference

**Authentication**
```
POST /api/register              Create new account
POST /api/login                 Login with credentials
POST /api/send-otp              Send OTP to email
POST /api/verify-otp            Verify OTP code
```

**Chat**
```
POST /api/send-message          Send message to AI
POST /api/upload                Upload file
```

Full documentation → See `API.md`

---

## 🚨 Common Issues & Fixes

### "OTP not received"
```
✓ Check spam folder
✓ Wait 2-3 minutes (email delay)
✓ Check .env EMAIL_PASSWORD is correct
✓ Check server terminal for errors
✓ Try "Resend OTP" button
```

### "Chat not responding"
```
✓ Check .env OPENROUTER_API_KEY is correct
✓ Check internet connection
✓ Server logs show error?
✓ Try simpler message first
✓ Check OpenRouter account has balance
```

### "Server won't start"
```
✓ npm install (missing dependencies?)
✓ Port 3000 already in use? (lsof -i :3000)
✓ Check syntax errors: npm run dev
```

### "Page shows blank"
```
✓ Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
✓ Open DevTools (F12), check Console tab for errors
✓ Check server running (terminal shows "Server Running"?)
```

---

## 🧪 Testing Commands

### Test API Endpoints (curl)
```bash
# Register
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@gmail.com",
    "password": "Test12345!",
    "displayName": "Test User",
    "profilePhoto": "avatar1.jpg"
  }'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "Test12345!"
  }'

# Send Message
curl -X POST http://localhost:3000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, what is 2+2?",
    "sessionToken": "your_token_here",
    "conversationHistory": []
  }'
```

### View Server Logs
```bash
# Already running in terminal, or start with:
npm start

# Or for development with auto-reload:
npm run dev
```

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
```
Enter          Send message
Ctrl+A         Select all text in input
Cmd+K         Open code block in response
```

### Model Selection
The system automatically picks the best AI model:
- **Coding queries** → Claude 3.5 Sonnet (better for code)
- **General chat** → Gemini 2.0 Flash (faster for chat)

Keywords that trigger coding mode:
```
code, script, function, class, python, javascript, 
html, css, api, database, sql, nodejs, react, etc.
```

### File Types Supported
```
✓ .txt   → Plain text
✓ .js    → JavaScript code
✓ .py    → Python code
✓ .html  → HTML web pages
✓ .pdf   → PDF documents
✗ .doc   → Not supported (use .pdf)
```

### Storage Limits
```
Max file size:  10 MB
Max message:    50 MB
Memory storage: In-memory (resets on server restart)
```

---

## 🎯 Next Steps

### For Development
1. ✅ Set up local environment (done above)
2. ✅ Create test account
3. ✅ Test all features (chat, file upload, settings)
4. 📖 Read `AUTHENTICATION_FLOW.md` for deep dive
5. 🔧 Read `IMPLEMENTATION.md` for technical details
6. 🐛 Read `TROUBLESHOOTING.md` for debugging

### For Production
1. Replace in-memory storage with database (MongoDB/PostgreSQL)
2. Hash passwords with bcrypt
3. Deploy to cloud (Vercel, Heroku, AWS)
4. Set up HTTPS/SSL certificate
5. Configure CORS for your domain
6. Add rate limiting and security headers
7. Set up error monitoring (Sentry, LogRocket)
8. Use environment variables from secrets manager

---

## 📞 Support

**Having trouble?**
1. Check `TROUBLESHOOTING.md`
2. Review server terminal logs
3. Open browser DevTools (F12) → Console tab
4. Check `.env` credentials are correct

**Want to customize?**
- Colors: Edit CSS in `public/index.html`
- UI layout: Edit HTML structure
- API behavior: Edit `server.js` endpoints
- Chat logic: Edit `script.js` functions

---

## 📦 What's Included

✅ Complete user authentication (register/login/OTP)
✅ AI chat with streaming responses
✅ Dual AI models (Claude + Gemini)
✅ File upload and analysis
✅ Conversation history
✅ User profiles
✅ Dark mode UI (GitHub OLED style)
✅ Mobile responsive design
✅ Code syntax highlighting
✅ Copy-to-clipboard buttons
✅ Comprehensive docs

---

## 🎓 Learn More

**Files to read:**
- [SETUP.md](SETUP.md) - Detailed environment setup
- [API.md](API.md) - All API endpoints
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Feature details
- [AUTHENTICATION_FLOW.md](AUTHENTICATION_FLOW.md) - Auth system explained
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Debug problems

**External resources:**
- Node.js: https://nodejs.org
- Express: https://expressjs.com
- OpenRouter: https://openrouter.io
- Gmail SMTP: https://support.google.com/accounts/answer/185833

---

**Ready to go! 🚀**

```
npm start
```

Then visit: `http://localhost:3000`

Enjoy using TamAi v3!
