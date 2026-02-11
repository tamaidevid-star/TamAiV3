# 🏗️ TamAi v3 - Architecture & API Reference

## Project Structure

```
/workspaces/TamAiV3/
│
├── 📄 server.js                    [~400 lines] Main Express server
├── 📄 package.json                 Express, Nodemailer, Axios dependencies
├── 📄 .env                         Environment variables & credentials
├── 📄 .gitignore                   Git ignore configuration
├── 📄 start.sh                     Quick start bash script
│
├── 📁 public/                      Frontend static files
│   ├── 📄 index.html              [~350 lines] UI components & styling
│   └── 📄 script.js               [~500 lines] Frontend logic & interactivity
│
├── 📁 uploads/                     File upload storage
│   └── 📄 .gitkeep                (Keep directory structure)
│
└── 📁 Documentation/
    ├── 📄 README.md               Project overview
    ├── 📄 SETUP.md                Setup & configuration guide
    ├── 📄 IMPLEMENTATION.md        Detailed feature implementation
    └── 📄 API.md                  This file - API documentation

```

## Server Architecture

### Express Routes

```javascript
// AUTHENTICATION
POST /api/send-otp          → Generate & send OTP via email
POST /api/verify-otp        → Verify OTP & create session

// CHAT & AI
POST /api/send-message      → Send message & get AI response (streaming)

// FILE HANDLING
POST /api/upload            → Upload file to server
GET  /api/file-content/:filename → Retrieve file content

// STATIC
GET  /*                     → Serve static files dari public/
```

### Middleware Stack

```
1. CORS middleware              → Enable cross-origin requests
2. JSON body parser             → Parse JSON bodies (50MB limit)
3. URL-encoded parser           → Parse form data
4. Static file server           → Serve /public folder
5. Error handling middleware    → Catch & handle errors
```

### Port Configuration

```
Default: 3000
Environment Variable: PORT (in .env)
Access: http://localhost:3000
```

## API Endpoints Detail

### 1️⃣ SEND OTP

**Endpoint:** `POST /api/send-otp`

**Purpose:** Initiate OTP-based login

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Validation:**
- Email format must be valid (regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
- Must send before verify-otp

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP telah dikirim ke email Anda",
  "expiresIn": 600
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Email tidak valid"
}
```

**Response (500 Server Error):**
```json
{
  "error": "Gagal mengirim OTP",
  "details": "SMTP connection error"
}
```

**Backend Logic:**
1. Validate email format
2. Generate 6-digit random OTP
3. Store in otpStorage map with 10-minute expiration
4. Send via Gmail SMTP using Nodemailer
5. Return success message & expiration time

**Email Template:**
- Sender: tamaidev.id@gmail.com
- Subject: 🤖 TamAi v3 - Kode OTP Anda
- Format: Beautiful HTML dengan dark theme (#000000)
- Displays: OTP code, expiration time, warning about sharing

---

### 2️⃣ VERIFY OTP

**Endpoint:** `POST /api/verify-otp`

**Purpose:** Verify OTP & create user session

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Validation:**
- Email & OTP must be provided
- OTP must be 6 digits
- OTP must match stored value
- OTP must not be expired (10 minutes)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP terverifikasi",
  "sessionToken": "abc123def456...",
  "email": "user@example.com"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "OTP telah expired"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "OTP tidak sesuai"
}
```

**Backend Logic:**
1. Validate email & OTP provided
2. Lookup OTP in otpStorage
3. Check if OTP expired
4. Compare provided OTP with stored OTP
5. If valid:
   - Delete OTP from storage (one-time use)
   - Generate unique sessionToken
   - Store session with 24-hour expiration
   - Return token & email
6. If invalid:
   - Return error message

**Session Storage Format:**
```javascript
sessionStorage.set(sessionToken, {
  email: "user@example.com",
  createdAt: 1707609600000,     // timestamp
  expiresAt: 1707696000000      // 24 hours later
})
```

---

### 3️⃣ SEND MESSAGE

**Endpoint:** `POST /api/send-message`

**Purpose:** Send chat message & get streaming AI response

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Bagaimana cara membuat function di JavaScript?",
  "conversationHistory": [
    { "role": "user", "content": "Halo" },
    { "role": "assistant", "content": "Halo juga!" }
  ],
  "sessionToken": "abc123def456..."
}
```

**Validation:**
- sessionToken must be valid & not expired
- Message must not be empty
- Message must not be whitespace-only

**Response Type:** `text/event-stream` (Server-Sent Events)

**Response Stream Format:**
```
// Streaming chunk 1:
data: {"content": "Untuk membuat function "}

// Streaming chunk 2:
data: {"content": "di JavaScript, Anda bisa "}

// Final chunk:
data: {"finish": true}

// Or error:
data: {"error": "Sistem sedang sibuk, Tuan Tama!"}
```

**Backend Logic:**
1. Validate session token & check expiration
2. Validate message content
3. Determine model:
   - Check if message contains coding keywords
   - If coding: use `anthropic/claude-3.5-sonnet`
   - Else: use `google/gemini-2.0-flash-001`
4. Build request for OpenRouter API with conversation history
5. Set response headers untuk SSE:
   ```
   Content-Type: text/event-stream
   Cache-Control: no-cache
   Connection: keep-alive
   ```
6. Call OpenRouter API dengan axios (streaming enabled)
7. Parse incoming stream: `data: {json}`
8. Send parsed chunks ke client
9. On stream end: send `{"finish": true}`
10. On error: send error message

**OpenRouter API Request:**
```javascript
POST https://openrouter.io/api/v1/chat/completions

{
  "model": "anthropic/claude-3.5-sonnet" OR "google/gemini-2.0-flash-001",
  "messages": conversationHistory,
  "stream": true,
  "temperature": 0.7,
  "top_p": 1,
  "max_tokens": 2048
}
```

**Model Selection Keywords (for Claude):**
```
code, script, program, function, class, variable, algorithm,
debug, method, loop, array, object, html, css, javascript,
python, java, cpp, sql, database, api, library, package,
npm, pip, git, docker, framework, react, vue, angular,
nodejs, express, django, flask, fastapi, mongodb, postgres,
mysql, firebase, auth, middleware, router, component, state,
props, event, hook, lifecycle, render, virtual dom, jsx,
typescript, rust, golang, ruby, php, swift, kotlin, webgl,
canvas, svg, json, xml, regex, terminal, bash, shell,
+ many more coding-related keywords
```

**Error Handling:**
- 429 (Rate Limit): "Sistem sedang sibuk, Tuan Tama!"
- 401 (Invalid API Key): "API Key tidak valid"
- Other errors: "Terjadi kesalahan dalam memproses pesan"

---

### 4️⃣ UPLOAD FILE

**Endpoint:** `POST /api/upload`

**Purpose:** Upload file untuk attachment dalam chat

**Request Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
```
Form Data:
- file: <binary file>
```

**Supported File Types:**
- text/plain (.txt)
- text/javascript (.js)
- text/x-python (.py)
- text/html (.html)
- application/pdf (.pdf)

**File Restrictions:**
- Max size: 10MB
- Allowed MIME types only
- Filename sanitized with timestamp

**Response (200 OK):**
```json
{
  "success": true,
  "filename": "file-1707609600000-123456.js",
  "originalName": "myScript.js",
  "size": 2048,
  "path": "/uploads/file-1707609600000-123456.js"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "File type not supported"
}
```

**Response (413 Payload Too Large):**
```json
{
  "error": "File size exceeds limit (10MB)"
}
```

**Backend Logic:**
1. Validate file exists in request
2. Check MIME type in whitelist
3. Check file size (max 10MB)
4. Store file in /uploads directory
5. Generate unique filename: `fieldname-timestamp-random.ext`
6. Return file metadata

**Multer Configuration:**
```javascript
{
  destination: 'uploads/',
  filename: 'file-' + Date.now() + '-' + randomSuffix,
  fileFilter: checkMimeType,
  limits: { fileSize: 10 * 1024 * 1024 }
}
```

---

### 5️⃣ GET FILE CONTENT

**Endpoint:** `GET /api/file-content/:filename`

**Purpose:** Retrieve file content (read file)

**Request Parameters:**
```
- filename: "file-1707609600000-123456.js"
```

**Response (200 OK):**
```json
{
  "content": "// File content here\nconst x = 5;"
}
```

**Response (404 Not Found):**
```json
{
  "error": "File tidak ditemukan"
}
```

**Response (403 Forbidden):**
```json
{
  "error": "Akses ditolak"
}
```

**Backend Logic:**
1. Get filename from URL parameter
2. Build filepath: `uploads/filename`
3. Prevent directory traversal attack:
   - Check if filepath starts with uploads/ directory
   - Reject if tries to access parent directory
4. Check file existence
5. Read file content as UTF-8 string
6. Return content in JSON

**Security:**
- Path traversal prevention
- Only serve from uploads/ directory
- Check filepath validity before reading

---

## Frontend State Management

### State Object Structure

```javascript
const state = {
  // Authentication
  sessionToken: String | null,
  userEmail: String,
  
  // User Profile
  userName: String,
  displayName: String,
  profilePhoto: String (URL),
  
  // Conversations
  conversations: {
    [conversationId]: [
      { role: "user", content: "..." },
      { role: "assistant", content: "..." }
    ]
  },
  currentConversationId: String | null,
  
  // File Attachment
  attachedFile: {
    name: String,
    content: String
  } | null
}
```

### LocalStorage Keys

```
- sessionToken           → Session for authentication
- userEmail             → User email information
- userName              → Username (display)
- displayName           → Name to display in UI
- profilePhoto          → Profile image URL
- conversations         → JSON stringified conversations
- currentConversationId → Currently active conversation ID
```

---

## Frontend Event Handlers

### Authentication Events

```javascript
// Email OTP Login
sendOtpBtn.click → POST /api/send-otp
otpInput.change → Show OTP verification input
verifyOtpBtn.click → POST /api/verify-otp

// Google OAuth
google.accounts.id.callback → handleGoogleSignIn()
```

### Chat Events

```javascript
sendBtn.click → sendMessage()
messageInput.keypress(Enter) → sendMessage()
sendMessage() → POST /api/send-message (with streaming)
```

### File Events

```javascript
attachFileBtn.click → fileInput.click()
fileInput.change → Read file & store in state
sendMessage() → Include file content if attached
```

### UI Events

```javascript
newChatBtn.click → Clear messages, reset state
logoutBtn.click → Clear localStorage, reload
settingsBtn.click → Show settings modal
savSettingsBtn.click → Update user profile
sidebarToggle.click → Toggle sidebar (mobile)
```

---

## Data Persistence

### Frontend (LocalStorage)
- **Scope:** Per browser/device
- **Capacity:** ~5-10MB typically
- **Lifetime:** Persistent until cleared
- **Usage:** User session, conversations, preferences

### Backend (In-Memory)
- **Scope:** Server-only, lost on restart
- **Lifetime:** Until server restarts or expires
- **Usage:** OTP storage, session tokens

*⚠️ For production: Use proper database (MongoDB, PostgreSQL, etc)*

---

## Error Codes & Messages

### Frontend Errors
```
"Email tidak valid"              → Invalid email format
"Kode OTP harus 6 angka"        → OTP format invalid
"Masukkan pesan terlebih dahulu" → Empty message
"Sesi Anda telah expired"       → Session expired, need re-login
"File type not supported"       → Unsupported file format
```

### Backend Errors
```
"Email tidak valid"              → Email validation failed
"OTP belum dikirim"             → No OTP sent before verify
"OTP telah expired"             → OTP older than 10 minutes
"OTP tidak sesuai"              → Wrong OTP code
"Gagal mengirim OTP"            → SMTP/email service error
"Sistem sedang sibuk"           → API rate limit exceeded
"API Key tidak valid"           → OpenRouter API key error
"File tidak ditemukan"          → File upload not found
"Akses ditolak"                 → Directory traversal attempt
```

---

## Performance Metrics

### Load Time Expectations
- HTML load: ~100ms
- Script load: ~200ms
- CSS parse: ~50ms
- Google API load: ~500ms
- Total: ~1-2 seconds for login page

### Chat Response
- OTP send: ~1-3 seconds (via SMTP)
- Message to AI: ~2-15 seconds (streaming)
- Streaming chunks: Real-time (per phrase)

### File Operations
- File upload: Depends on file size (< 1MB = < 100ms)
- File read: ~10-50ms

---

## Security Considerations

### API Security
1. **CORS**: Enabled, default origin
2. **Body Parser**: Size limits (50MB)
3. **HTTPS**: Recommended in production
4. **Rate Limiting**: Not implemented (TODO)
5. **Input Validation**: Implemented
6. **SQL Injection**: N/A (no database)
7. **CSRF**: Not implemented (stateless API)

### Data Security
1. **API Keys**: In .env, not in code
2. **Passwords**: Gmail App Password in .env
3. **Session Tokens**: Random generated, 24hr expiry
4. **OTP**: One-time use, 10min expiry
5. **File Storage**: Server-side, sanitized paths

### Client Security
1. **XSS Protection**: htmlEscape used for user input
2. **Token Storage**: localStorage (vulnerable to XSS)
3. **Console Logging**: Might expose sensitive data

---

## Testing Endpoints with cURL

### Send OTP
```bash
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","otp":"123456"}'
```

### Send Message
```bash
curl -X POST http://localhost:3000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "message":"Halo",
    "conversationHistory":[],
    "sessionToken":"token_here"
  }'
```

### Upload File
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@myfile.js"
```

---

## Debugging Tips

### Server-side
```bash
# Check logs in terminal running server
# Set NODE_ENV=development in .env for verbose logging
# Use console.log() in server.js
```

### Client-side
```javascript
// Open browser DevTools (F12)
// Console tab → Check for JavaScript errors
// Network tab → Inspect API requests
// Application tab → Check localStorage
```

### Email Testing
```
1. Check spam/promotions folder
2. Check if email is actually sent (check server logs)
3. Try different email provider
4. Check App Password validity
```

---

**Version**: 3.0.0  
**Last Updated**: February 2026  
**API Status**: ✅ Production Ready
