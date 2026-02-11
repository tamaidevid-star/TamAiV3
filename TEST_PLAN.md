# 🧪 Test Plan - TamAi v3 Authentication & Chat System

## Test Environment
- **Server**: Node.js 16+, Express.js running on port 3000
- **Frontend**: Modern browser (Chrome, Firefox, Safari)
- **Email Service**: Gmail SMTP (tamaidev.id@gmail.com)
- **AI API**: OpenRouter (google/gemini-2.0-flash-001, anthropic/claude-3.5-sonnet)

---

## 🔐 Authentication Tests

### Test 1: User Registration Flow
**Objective**: Verify new user can register with valid data

**Steps**:
1. Open `http://localhost:3000/` in browser
2. Click "Register" tab
3. Fill form:
   - Username: `testuser123`
   - Display Name: `Test User`
   - Email: `test123@gmail.com`
   - Password: `TestPass123!`
   - Avatar: Select any avatar
4. Click "Create Account"
5. Verify: OTP input appears for email verification

**Expected Result**: ✅
- Form validation passes
- POST /register endpoint accepts data
- User created in memory with userId
- OTP email sent to provided email address
- OTP input modal appears automatically

**Actual Result**: [PENDING]

---

### Test 2: OTP Email Verification
**Objective**: Verify OTP code from email can complete registration

**Steps**:
1. Check email inbox for OTP (6-digit code)
2. Enter 6 digits in OTP input fields
3. Click "Verify OTP"
4. Verify: Chat interface appears

**Expected Result**: ✅
- OTP code received in email within 2 minutes
- All 6 digits auto-advance between inputs
- Session token created
- User redirected to chat interface
- Profile shows correct username and display name

**Actual Result**: [PENDING]

---

### Test 3: User Login with Registered Account
**Objective**: Verify existing user can login

**Steps**:
1. Open `http://localhost:3000/` (should show login if not authenticated)
2. Click "Login" tab
3. Fill form:
   - Email: `testuser123@gmail.com`
   - Password: `TestPass123!`
4. Click "Sign In"

**Expected Result**: ✅
- POST /login endpoint verifies credentials
- Session token created and saved to localStorage
- User profile loaded from registered data
- Chat interface displays with correct user info
- Previous conversations load in sidebar (if any)

**Actual Result**: [PENDING]

---

### Test 4: Invalid Login Attempts
**Objective**: Verify proper error handling for invalid credentials

**Steps**:
1. Open `http://localhost:3000/`
2. Try Login with:
   - Scenario A: Wrong password
   - Scenario B: Non-existent email
   - Scenario C: Missing fields

**Expected Result**: ✅
- Error messages display: "Invalid credentials", "User not found"
- No session token created
- User stays in auth modal
- Chat interface doesn't load

**Actual Result**: [PENDING]

---

### Test 5: Google OAuth Integration (Optional)
**Objective**: Verify Google Sign-In button functionality

**Steps**:
1. Open `http://localhost:3000/`
2. Click "Continue with Google" button
3. Complete Google sign-in flow
4. Verify: Profile data imported from Google account

**Expected Result**: ✅
- Google sign-in modal appears
- After sign-in, profile auto-populates
- User session created
- Chat interface loads

**Actual Result**: [PENDING]

---

### Test 6: Session Persistence
**Objective**: Verify user stays logged in after page refresh

**Steps**:
1. Complete login successfully
2. See chat interface appear
3. Refresh page (F5 or Ctrl+R)
4. Verify: Still logged in, chat history preserved

**Expected Result**: ✅
- localStorage contains sessionToken
- User data automatically restored from localStorage
- No need to login again
- Previous conversations still visible

**Actual Result**: [PENDING]

---

### Test 7: Logout Functionality
**Objective**: Verify user can logout

**Steps**:
1. Login successfully
2. Open settings panel
3. Click "Logout" button
4. Verify: Login modal reappears

**Expected Result**: ✅
- Session token cleared from localStorage
- All user data cleared
- Auth modal appears
- Previous conversations not visible to new session

**Actual Result**: [PENDING]

---

## 💬 Chat Functionality Tests

### Test 8: Send Text Message
**Objective**: Verify basic chat message sending

**Steps**:
1. Login successfully
2. Type message: "Hello, how are you?"
3. Click send or press Enter
4. Verify: Message appears in chat, AI response streams

**Expected Result**: ✅
- Message appears in user bubble (with username/avatar)
- AI response streams character-by-character
- Message saved to conversation history
- Sender info (username) displays correctly

**Actual Result**: [PENDING]

---

### Test 9: Code Detection & Model Selection
**Objective**: Verify auto-switching to coding model for code requests

**Steps**:
1. Send message: "Write a Python function to calculate factorial"
2. Verify: Uses `anthropic/claude-3.5-sonnet` model

**Steps**:
1. Send message: "What is the capital of France?"
2. Verify: Uses `google/gemini-2.0-flash-001` model

**Expected Result**: ✅
- Code-related keywords trigger Claude model
- General chat uses Gemini model
- Response quality matches model capability
- No errors in API streaming

**Actual Result**: [PENDING]

---

### Test 10: File Upload
**Objective**: Verify file attachment in chat

**Steps**:
1. Click file upload button
2. Select file: `test.txt` with content
3. Message appears with file reference
4. Send message with file
5. AI processes file content

**Expected Result**: ✅
- File accepted (.txt, .js, .py, .html, .pdf)
- File preview shown
- File content sent with message
- AI can reference file content in response
- Max 10MB limit enforced

**Actual Result**: [PENDING]

---

### Test 11: Message History in Sidebar
**Objective**: Verify conversation history displays correctly

**Steps**:
1. Send 3-5 messages in different topics
2. Check left sidebar
3. Click on previous conversation
4. Verify: Correct messages load

**Expected Result**: ✅
- Each conversation shows in sidebar with timestamp
- Conversation titles are meaningful
- Clicking loads full conversation
- Message order is correct (oldest to newest)

**Actual Result**: [PENDING]

---

### Test 12: Markdown & Code Highlighting
**Objective**: Verify code blocks display with syntax highlighting

**Steps**:
1. Send: "Show me a JavaScript function"
2. Verify: Response contains code block
3. Check: Syntax highlighting applied
4. Click "Copy" button on code block
5. Verify: Code copied to clipboard

**Expected Result**: ✅
- Code blocks render with proper formatting
- Syntax highlighting works (colors, indentation)
- Copy button available on code blocks
- Code copies exactly to clipboard
- Language tag displays (js, python, etc.)

**Actual Result**: [PENDING]

---

## 🎨 UI/UX Tests

### Test 13: Responsive Design - Mobile
**Objective**: Verify interface works on mobile devices

**Steps**:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on iPhone 12 resolution (390x844)
4. Test on iPad resolution (768x1024)

**Expected Result**: ✅
- Auth modal readable and responsive
- Chat interface adjusts to smaller screen
- No horizontal scrolling
- Touch-friendly button sizes
- Sidebar collapses on mobile

**Actual Result**: [PENDING]

---

### Test 14: Dark Mode Display
**Objective**: Verify dark mode styling applies correctly

**Steps**:
1. Login successfully
2. Verify background colors:
   - Main background: #000000 (pure black)
   - Card background: #18181B (dark gray)
   - Text: #E4E4E7 (light gray)
3. Check contrast ratios for readability
4. Verify hover states visible

**Expected Result**: ✅
- Dark mode matches GitHub OLED style
- Text readable on dark backgrounds (WCAG AA compliance)
- All elements visible with proper contrast
- Professional appearance

**Actual Result**: [PENDING]

---

### Test 15: User Profile Display
**Objective**: Verify user info displays correctly throughout interface

**Steps**:
1. Login with test user
2. Check header (top-right):
   - Username shows: `testuser (@username)`
   - Avatar displays
3. Send message, verify user bubble shows:
   - Display name
   - Avatar/profile photo
4. Open settings, verify profile data:
   - Username can be viewed
   - Display name can be viewed
   - Avatar displays

**Expected Result**: ✅
- User info consistent across interface
- Avatar displays correctly
- Username format: `Display Name (@username)`
- Profile photo updates when changed

**Actual Result**: [PENDING]

---

## 🔧 Backend API Tests

### Test 16: POST /register Endpoint
**Objective**: Verify registration API works correctly

**Curl Test**:
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test123@gmail.com", 
    "displayName": "Test User",
    "password": "TestPass123!",
    "profilePhoto": "avatar1.jpg"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Registration successful, check email for OTP",
  "userId": "USER_ID_HERE"
}
```

**Actual Result**: [PENDING]

---

### Test 17: POST /verify-otp Endpoint
**Objective**: Verify OTP verification works

**Curl Test**:
```bash
curl -X POST http://localhost:3000/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test123@gmail.com",
    "otp": "123456"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "sessionToken": "TOKEN_HERE"
}
```

**Actual Result**: [PENDING]

---

### Test 18: POST /login Endpoint
**Objective**: Verify login API returns correct data

**Curl Test**:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test123@gmail.com",
    "password": "TestPass123!"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "sessionToken": "TOKEN_HERE",
  "user": {
    "email": "test123@gmail.com",
    "username": "testuser123",
    "displayName": "Test User",
    "profilePhoto": "avatar1.jpg"
  }
}
```

**Actual Result**: [PENDING]

---

### Test 19: POST /chat Endpoint
**Objective**: Verify streaming chat API works

**Curl Test**:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is 2+2?",
    "currentModel": "google/gemini-2.0-flash-001"
  }'
```

**Expected Response**:
- Streaming text response (Server-Sent Events or chunked)
- Valid JSON in each chunk
- Complete response delivered

**Actual Result**: [PENDING]

---

### Test 20: POST /upload Endpoint
**Objective**: Verify file upload works

**Curl Test**:
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@test.txt" \
  -F "message=Here is my file"
```

**Expected Response**:
```json
{
  "success": true,
  "filename": "test.txt",
  "size": 1024,
  "path": "/uploads/test.txt"
}
```

**Actual Result**: [PENDING]

---

## ✅ Final Verification Checklist

- [ ] All 20 tests passed
- [ ] No console errors in browser DevTools
- [ ] No server errors in terminal
- [ ] Email OTP delivery working (Gmail)
- [ ] Chat streaming working with both models
- [ ] File uploads functioning
- [ ] Session persistence working
- [ ] Mobile responsive (✓ width: 320-1920px)
- [ ] Dark mode applied correctly
- [ ] User profile displaying correctly
- [ ] No security vulnerabilities exposed
- [ ] Code follows best practices

---

## 🐛 Bug Report Template

If any test fails, use this template:

**Test #**: [Number]
**Title**: [Test name]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]
**Error Message**: [Any console/server errors]
**Screenshot**: [If applicable]

---

## 📝 Notes

- All tests should be performed in order
- Keep browser DevTools open (F12) to monitor for errors
- Keep terminal open to see server logs
- Save any error messages for debugging
- Test on multiple browsers if possible
- Test on different networks (WiFi, mobile data) if applicable

---

**Last Updated**: [Today]
**Status**: Ready to test
**Tester Name**: [Your name]
