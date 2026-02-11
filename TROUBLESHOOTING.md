# 🔧 TamAi v3 - Troubleshooting & FAQ

## 🎯 Pre-Launch Checklist

### ✅ Before Starting Server

- [ ] Node.js 14+ installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] Project folder: `/workspaces/TamAiV3`
- [ ] Dependencies installed (`npm install` done)
- [ ] `.env` file exists with credentials
- [ ] `public/index.html` exists
- [ ] `public/script.js` exists
- [ ] `server.js` exists
- [ ] `uploads/` folder exists

### ✅ Credentials Check

- [ ] **Email User**: tamaidev.id@gmail.com
- [ ] **Email Password**: mkpm lupy dkfa hwjg
- [ ] **OpenRouter API Key**: sk-or-v1-2af1a07...
- [ ] **Google OAuth Client ID**: 164055469439-65jpo9bkenife...
- [ ] All values in `.env` file

### ✅ Network Check

- [ ] Internet connection → Test with `ping google.com`
- [ ] Port 3000 available → Test with `netstat -tuln | grep 3000`
- [ ] Firewall not blocking localhost
- [ ] Gmail SMTP access allowed

---

## 🐛 Common Issues & Solutions

### Issue 1: "npm: command not found"

**Error Message:**
```
command not found: npm
```

**Causes:**
- Node.js not installed
- Node.js not in PATH

**Solutions:**
1. Install Node.js from https://nodejs.org/
2. Restart terminal after installation
3. Verify: `node -v` & `npm -v`

---

### Issue 2: "Module not found: express"

**Error Message:**
```
Error: Cannot find module 'express'
```

**Causes:**
- Dependencies not installed
- node_modules corrupted

**Solutions:**
1. Install dependencies:
   ```bash
   npm install
   ```
2. If still failing, delete & reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Issue 3: ".env file not found"

**Error Message:**
```
Error: .env file is required
```

**Causes:**
- .env file not created
- Wrong location

**Solutions:**
1. Create .env in project root:
   ```bash
   touch /workspaces/TamAiV3/.env
   ```
2. Add content:
   ```
   EMAIL_USER=tamaidev.id@gmail.com
   EMAIL_PASSWORD=mkpm lupy dkfa hwjg
   OPENROUTER_API_KEY=sk-or-v1-...
   PORT=3000
   GOOGLE_CLIENT_ID=164055469439-...
   ```

---

### Issue 4: Port 3000 already in use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causes:**
- Another app using port 3000
- Previous server not closed

**Solutions:**
1. Kill process on port 3000:
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 <PID>
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
2. Use different port:
   ```bash
   PORT=3001 npm start
   ```
3. Wait & try again (port might free up)

---

### Issue 5: "OTP not received"

**Error Message:**
```
No email/OTP in inbox after waiting
```

**Causes:**
- Email address typo
- SMTP credentials wrong
- Email marked as spam
- Gmail security settings

**Solutions:**
1. Check spelling of email address
2. Verify SMTP credentials:
   - Email: tamaidev.id@gmail.com
   - Password: mkpm lupy dkfa hwjg
3. Check spam/promotions folder
4. Gmail settings:
   - My Account → Security
   - Allow "Less secure app access"
   - Allow "App Passwords" if 2FA enabled
5. Test SMTP directly:
   ```bash
   npm install -g nodemailer
   # Create test.js with Nodemailer code
   node test.js
   ```

---

### Issue 6: "API limit exceeded"

**Error Message:**
```
Sistem sedang sibuk, Tuan Tama! (API rate limit tercapai)
```

**Causes:**
- Too many requests to OpenRouter
- Rate limit per minute exceeded
- Free tier limit

**Solutions:**
1. Wait 1-2 minutes before retrying
2. Upgrade OpenRouter account
3. Check OpenRouter dashboard for limits
4. Space out requests (not too rapid)

---

### Issue 7: "Invalid API Key"

**Error Message:**
```
API Key tidak valid
```

**Causes:**
- API key in .env wrong
- API key expired
- API key revoked

**Solutions:**
1. Check .env file for correct key:
   ```
   OPENROUTER_API_KEY=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
   ```
2. Verify key in OpenRouter dashboard
3. Generate new key if needed
4. Restart server after updating

---

### Issue 8: "Login always fails"

**Error Message:**
```
OTP terverifikasi but can't see chat interface
```

**Causes:**
- Cookie/session issue
- localStorage disabled
- Browser cache

**Solutions:**
1. Clear browser cache:
   - Press F12 → Application → Clear site data
2. Try incognito mode
3. Enable localStorage:
   - Check browser settings
4. Try different browser
5. Check browser console for errors (F12)

---

### Issue 9: "Chat messages not streaming"

**Error Message:**
```
Message submitted but no response
```

**Causes:**
- Network issue
- OpenRouter API down
- Session expired

**Solutions:**
1. Check network connection
2. Check browser console errors (F12)
3. Verify API key via OpenRouter dashboard
4. Try simpler message first
5. Logout & login again

---

### Issue 10: "File upload fails"

**Error Message:**
```
File type not supported OR File size exceeds limit
```

**Causes:**
- Wrong file format
- File too large

**Solutions:**
1. Supported formats ONLY:
   - .txt (text/plain)
   - .js (text/javascript)
   - .py (text/x-python)
   - .html (text/html)
   - .pdf (application/pdf)
2. File size < 10MB
3. If still failing:
   - Check file MIME type
   - Rename file with correct extension
   - Try zipping file if too large

---

### Issue 11: "Sidebar hidden on desktop"

**Causes:**
- CSS media query issue
- `.hidden` class applied incorrectly

**Solutions:**
1. Resize browser window (might trigger responsive)
2. Clear browser cache (F12 → Network → Disable cache)
3. Check if ID matches in HTML:
   ```html
   id="sidebar"
   ```

---

### Issue 12: "Google Sign-In not working"

**Error Message:**
```
Google button not showing OR sign-in fails
```

**Causes:**
- Google API not loaded
- Client ID wrong
- CORS issue

**Solutions:**
1. Check if Google API loaded:
   ```javascript
   // In console: console.log(window.google)
   // Should show object, not undefined
   ```
2. Verify Client ID in script.js:
   ```javascript
   client_id: '164055469439-65jpo9bkenifr28df97i6l4g5vlvfiem.apps.googleusercontent.com'
   ```
3. Clear cookies & try again
4. Check browser console for errors

---

## 📊 Performance Issues

### Issue: Slow response time

**Causes:**
- Network latency
- Server processing
- API limit throttling

**Solutions:**
1. Check OpenRouter response time
2. Monitor server logs
3. Test with shorter messages first
4. Check internet speed

---

### Issue: Lag while typing

**Causes:**
- JavaScript execution blocking UI
- Too many messages in history

**Solutions:**
1. Clear old conversations
2. Limit conversation history length
3. Check for browser extensions
4. Test in incognito mode

---

## 🔍 Debugging Guide

### Enable Console Logging

**Server-side:**
```javascript
// In server.js
console.log('Debug:', variableName);
console.error('Error:', error);
```

Run with:
```bash
NODE_ENV=development npm start
```

### Check Server Logs

```bash
# Watch real-time logs
npm start

# Save logs to file
npm start > server.log 2>&1
tail -f server.log
```

### Browser DevTools

**F12 → Console:**
```javascript
// Check state
console.log(JSON.stringify(state, null, 2));

// Check localStorage
console.log(localStorage);

// Monitor API calls
fetch('/api/send-otp', {...})
  .then(r => r.json())
  .then(data => console.log('API Response:', data));
```

**F12 → Network:**
- View all API requests
- Check response headers & body
- See timing information
- Check for failed requests

**F12 → Application:**
- Check localStorage values
- Check cookies
- Check service workers

### Test API Endpoints

```bash
# Test send-otp
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test verify-otp
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

---

## ✅ Verification Steps

### Verify Installation

```bash
cd /workspaces/TamAiV3

# Check Node.js
node --version

# Check npm
npm --version

# Check dependencies
npm list --depth=0

# Verify files
ls -la public/
ls -la server.js
cat .env | head -3
```

### Verify Server Starting

```bash
# Should see:
# ╔═══════════════════════════════╗
# ║   TamAi v3 - Server Running   ║
# ║   http://localhost:3000       ║
# ╚═══════════════════════════════╝

npm start
```

### Verify Frontend Loading

1. Open http://localhost:3000
2. Should see login modal
3. Check browser console (F12) for errors
4. Should see no 404 errors in Network tab

### Verify Email Sending

1. Enter valid email
2. Click "Kirim OTP"
3. Check email inbox (and spam)
4. OTP should arrive within 5 seconds

### Verify Chat

1. Login with OTP
2. Type message
3. Should see "TamAi is thinking..."
4. AI response should stream in real-time

---

## 📱 Mobile Troubleshooting

### Issue: Sidebar not hiding on mobile

**Solutions:**
1. Test on actual mobile device
2. Use Chrome DevTools device emulation (F12 → Toggle device toolbar)
3. Check viewport meta tag:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

### Issue: Touch input not working

**Solutions:**
1. Check z-index layering
2. Ensure buttons have sufficient padding (min 48px)
3. Test in different mobile browser

---

## 🔒 Security Troubleshooting

### Issue: "Akses ditolak" when accessing file

**Causes:**
- Directory traversal attempt
- Invalid filename

**Solutions:**
1. Use genuine filenames from upload response
2. Don't try to manipulate path

---

## 📞 Getting Help

### Information to Collect

When reporting issues:
1. Error message (exact text)
2. Steps to reproduce
3. Node.js version
4. Operating system
5. Browser version
6. `.env` file (credentials hidden)
7. Server logs
8. Browser console errors
9. Network tab screenshots

### Provide Minimal Reproduction

```bash
# Create test file
1. Clear browser cache
2. Restart server
3. Try the action that fails
4. Note exact error message
```

---

## 🚀 Performance Optimization

### For Production:

```javascript
// 1. Add compression
npm install compression
import compression from 'compression';
app.use(compression());

// 2. Add rate limiting
npm install express-rate-limit
const rateLimit = require('express-rate-limit');

// 3. Use database instead of memory
npm install mongoose
// Implement MongoDB integration

// 4. Add caching
npm install redis
// Implement Redis caching

// 5. Deploy with PM2
npm install -g pm2
pm2 start server.js --name "tamai-v3"
```

---

## 📚 Additional Resources

- **Express**: https://expressjs.com/
- **Nodemailer**: https://nodemailer.com/docs/
- **OpenRouter**: https://openrouter.io/docs
- **Marked.js**: https://marked.js.org/
- **Tailwind**: https://tailwindcss.com/

---

**Version**: 3.0.0  
**Last Updated**: February 2026  
**Status**: Troubleshooting Guide Complete ✅
