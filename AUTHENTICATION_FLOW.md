# 🔐 Complete Authentication Flow Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Client-Side (Browser)                      │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Login Modal     │         │  Chat Interface  │          │
│  │  - Email | Pass  │◄───────►│  - Chat bubbles  │          │
│  │  - Register Tab  │         │  - File upload   │          │
│  └──────────────────┘         │  - Settings      │          │
│                               └──────────────────┘          │
│           index.html + script.js                             │
└──────────────────────────────────┬──────────────────────────┘
                                   │ API Calls (JSON)
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│               Server-Side (Node.js/Express)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Authentication Endpoints                    │   │
│  │                                                       │   │
│  │  POST /api/register                                  │   │
│  │  POST /api/login                                     │   │
│  │  POST /api/send-otp                                  │   │
│  │  POST /api/verify-otp                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌────────────────────────►────────────────────────────┐   │
│  │                                                      │   │
│  ▼                                                      ▼   │
│ ┌────────────────────┐  nodemailer  ┌─────────────────┐   │
│ │  User/Session      │◄────────────►│ Gmail SMTP      │   │
│ │  Storage (Memory)  │              └─────────────────┘   │
│ │                    │                                      │
│ │ - users Map        │              ┌─────────────────┐   │
│ │ - sessions Map     │              │ OpenRouter API  │   │
│ │ - otpStorage Map   │◄────────────►│ (AI Responses)  │   │
│ └────────────────────┘              └─────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Registration Flow (New User)

### Step 1: Fill Registration Form
```
User action: Click "Register" tab
Fields required:
  - Username: min 3 chars, alphanumeric + underscore/dash
  - Display Name: any name (used in UI)
  - Email: valid email format
  - Password: min 8 chars
  - Avatar: select from predefined avatars
```

### Step 2: Submit Registration
```javascript
Frontend sends:
POST /api/register
{
  "username": "johndoe",
  "displayName": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "profilePhoto": "avatar1.jpg"
}
```

### Step 3: Backend Processing
```javascript
Server validates:
✓ All fields present
✓ Email format valid
✓ Password >= 8 chars
✓ Username not already taken
✓ Email not already registered

Then:
1. Creates user object with:
   - userId (unique ID)
   - username, displayName, email, password
   - profilePhoto, verified: false
   - createdAt timestamp

2. Stores user in sessionStorage['users'] Map:
   users.set(email, userData)

3. Generates 6-digit OTP
4. Stores OTP: otpStorage.set(email, { otp, expiresAt: +10min })
5. Sends OTP via Gmail SMTP to user's email
```

### Step 4: Email OTP Verification
```
User receives email with OTP code
User enters 6 digits in OTP input fields

Frontend sends:
POST /api/verify-otp
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Step 5: Backend OTP Validation
```javascript
Server validates:
✓ OTP exists in storage
✓ OTP not expired (< 10 mins)
✓ OTP matches exactly

Then:
1. Marks user as verified: user.verified = true
2. Generates sessionToken
3. Creates session: sessionStorage[token] = {
     email, userId, username, displayName, profilePhoto,
     createdAt, expiresAt: +24hrs
   }
4. Returns: { sessionToken, userId, username, etc }
```

### Step 6: User Logged In
```
Frontend receives sessionToken
Saves to localStorage:
  - sessionToken
  - userEmail
  - userName
  - displayName
  - profilePhoto
  - userId

Displays chat interface with user profile
```

---

## 🔑 Login Flow (Existing User)

### Step 1: Fill Login Form
```
User action: Click "Login" tab
Fields:
  - Email: registered email
  - Password: account password
```

### Step 2: Submit Login
```javascript
Frontend sends:
POST /api/login
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Step 3: Backend Authentication
```javascript
Server validates:
✓ Email provided
✓ Password provided
✓ User exists in users Map
✓ Password matches stored password
✓ User email verified (verified: true)

Then:
1. Generates sessionToken
2. Creates session with user data
3. Returns user object with all profile info
```

### Step 4: User Logged In
```
Same as registration flow step 6
User data restored and chat interface displayed
```

---

## 💫 Session Persistence & Logout

### Auto-Login on Page Refresh
```javascript
When page loads:
1. Check localStorage for sessionToken
2. If sessionToken exists:
   - Restore all user data from localStorage
   - Show chat interface (skip login modal)
3. If no sessionToken:
   - Show login/register modal
```

### Logout
```
User clicks logout in settings
Frontend:
1. Removes from localStorage:
   - sessionToken
   - userEmail
   - userName
   - displayName
   - profilePhoto
   - userId

2. Clears state.sessionToken

3. Shows login modal again
```

---

## 🗑️ In-Memory Storage Explanation

**Why In-Memory (Not Database)?**
- ✅ Fast development and testing
- ✅ No database setup required
- ✅ Perfect for prototype/MVP
- ❌ Data lost on server restart
- ❌ Not suitable for production

**Production Upgrade Path:**
```javascript
// Current (Memory)
const users = new Map();

// Production (Database)
users = await database.collection('users').find({})
```

**Storage Maps:**
```javascript
// Users registered
sessionStorage['users'] = {
  'john@example.com': { userId, username, email, ... },
  'jane@example.com': { userId, username, email, ... }
}

// Active sessions
sessionStorage['token123'] = { email, userId, expiresAt, ... }
sessionStorage['token456'] = { email, userId, expiresAt, ... }

// Pending OTP verification
otpStorage = {
  'john@example.com': { otp: '123456', expiresAt: timestamp },
  'jane@example.com': { otp: '789012', expiresAt: timestamp }
}
```

---

## 📊 Request/Response Examples

### Register Success
```json
REQUEST:
POST /api/register
{
  "username": "testuser",
  "email": "test@gmail.com",
  "password": "TestPass123!",
  "displayName": "Test User",
  "profilePhoto": "avatar1.jpg"
}

RESPONSE (200):
{
  "success": true,
  "message": "Pendaftaran berhasil...",
  "userId": "user_1704067200000",
  "email": "test@gmail.com"
}

NEXT: User receives OTP via email
```

### Register Failure
```json
RESPONSE (400):
{
  "success": false,
  "error": "Email sudah terdaftar"
}

OR

{
  "success": false,
  "error": "Username sudah terdaftar"
}
```

### Verify OTP Success
```json
REQUEST:
POST /api/verify-otp
{
  "email": "test@gmail.com",
  "otp": "123456"
}

RESPONSE (200):
{
  "success": true,
  "message": "OTP terverifikasi",
  "sessionToken": "abc123def456...",
  "email": "test@gmail.com",
  "userId": "user_1704067200000",
  "username": "testuser",
  "displayName": "Test User",
  "profilePhoto": "avatar1.jpg"
}

NEXT: Frontend saves sessionToken and shows chat interface
```

### Login Success
```json
REQUEST:
POST /api/login
{
  "email": "test@gmail.com",
  "password": "TestPass123!"
}

RESPONSE (200):
{
  "success": true,
  "message": "Login berhasil",
  "sessionToken": "xyz789...",
  "user": {
    "userId": "user_1704067200000",
    "email": "test@gmail.com",
    "username": "testuser",
    "displayName": "Test User",
    "profilePhoto": "avatar1.jpg"
  }
}
```

### Login Failure - Email Not Found
```json
RESPONSE (401):
{
  "success": false,
  "error": "Email atau password salah"
}
```

### Login Failure - Email Not Verified
```json
RESPONSE (403):
{
  "success": false,
  "error": "Email belum diverifikasi. Silakan periksa email Anda untuk kode OTP"
}
```

---

## 🔒 Security Considerations

### Current Implementation (Development)
⚠️ Passwords stored in plain text (for demo only)
⚠️ Sessions stored in memory (lost on server restart)
⚠️ CORS allows localhost only
⚠️ No rate limiting on OTP attempts

### Production Recommendations
```
1. Hash passwords: bcrypt.hash(password, 10)
2. Use database: MongoDB, PostgreSQL, etc
3. Add rate limiting: express-rate-limit
4. Use HTTPS: enable TLS/SSL
5. JWT tokens: jsonwebtoken library
6. Password reset: secure token + email
7. 2FA: TOTP or SMS codes
8. Encrypt sensitive data: crypto module
```

---

## 🧪 Quick Testing Checklist

```
🔄 Registration Flow
  □ Register with valid data → Receives OTP email
  □ Enter correct OTP → Session created, chat appears
  □ Try invalid password (< 8 chars) → Error shown
  □ Try duplicate username → Error shown
  □ Try invalid email format → Error shown
  □ Try duplicate email → Error shown

🔑 Login Flow
  □ Login with registered account → Chat interface shows
  □ Login with wrong password → Error shown
  □ Login with non-existent email → Error shown
  □ Login with unverified email → Error shown

💾 Session Management
  □ Login successfully → user info shows in header
  □ Refresh page → Still logged in (localStorage restored)
  □ Click logout → Login modal appears
  □ New session start → Chat history not visible

📧 Email OTP
  □ OTP arrives within 2 minutes
  □ OTP valid for 10 minutes
  □ Expired OTP shows error
  □ Wrong OTP shows error
  □ Resend OTP works multiple times
```

---

## 📞 Troubleshooting

### "Email atau password salah" - But credentials are correct
**Cause**: Email not verified
**Solution**: Check email for OTP from registration, or request password reset

### "OTP tidak sesuai" - But OTP code looks correct
**Cause**: Spaces or leading zeros
**Solution**: Enter exactly as shown in email, no spaces

### "OTP telah expired" - Even within 10 minutes
**Cause**: Server restarted (in-memory storage)
**Solution**: For development, request new OTP

### Can't receive OTP email
**Cause**: Gmail SMTP issue
**Check**:
1. Is .env EMAIL_PASSWORD correct? (Gmail app password, not main password)
2. Server logs show error?
3. Is email address typed correctly?

### "Username sudah terdaftar" - But username is new
**Cause**: In-memory storage in previous session
**Solution**: Use different username or wait for documentation update

---

## 📚 Related Files

- **Frontend**: `/public/index.html`, `/public/script.js`
- **Backend**: `/server.js`
- **Config**: `.env`
- **Documentation**: `/API.md`, `/IMPLEMENTATION.md`

---

**Last Updated**: 2024
**Status**: Complete
**Mode**: Development (In-memory storage)
