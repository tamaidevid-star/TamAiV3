import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';

dotenv.config();

// Warn if critical env vars missing
if (!process.env.OPENROUTER_API_KEY) {
  console.warn('⚠️ OPENROUTER_API_KEY is not set in .env');
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set in .env');
}

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🔧 MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 📁 MULTER CONFIG (File Upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const allowedMimes = [
  'text/plain',
  'text/javascript',
  'text/x-python',
  'text/html',
  'application/pdf'
];

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// 📧 NODEMAILER CONFIG
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'tamaidev.id@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'mkpm lupy dkfa hwjg'
  }
});

// 💾 OTP STORAGE (In-memory, dalam praktik gunakan database)
const otpStorage = new Map();
const sessionStorage = new Map();

// 🔐 UTILITY FUNCTIONS
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateSessionToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 📨 ENDPOINT: SEND OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email tidak valid' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 menit

    otpStorage.set(email, { otp, expiresAt });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tamaidev.id@gmail.com',
      to: email,
      subject: '🤖 TamAi v3 - Kode OTP Anda',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #000000; padding: 20px; border-radius: 10px; color: #ffffff;">
          <h2 style="color: #00ff00;">TamAi v3 🚀</h2>
          <p>Halo, Tuan!</p>
          <p>Kode OTP Anda adalah:</p>
          <h1 style="color: #00ff00; font-size: 36px; letter-spacing: 2px; margin: 20px 0;">${otp}</h1>
          <p>Kode ini berlaku selama 10 menit. Jangan bagikan dengan siapa pun.</p>
          <hr style="border: 1px solid #333;">
          <p style="font-size: 12px; color: #888;">Jika Anda tidak meminta kode ini, abaikan email ini.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'OTP telah dikirim ke email Anda',
      expiresIn: 600 // 10 menit dalam detik
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      error: 'Gagal mengirim OTP',
      details: error.message
    });
  }
});

// ✅ ENDPOINT: VERIFY OTP
app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email dan OTP harus diisi' });
    }

    const storedData = otpStorage.get(email);

    if (!storedData) {
      return res.status(400).json({ error: 'OTP belum dikirim atau sudah expired' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStorage.delete(email);
      return res.status(400).json({ error: 'OTP telah expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'OTP tidak sesuai' });
    }

    // Hapus OTP dari storage
    otpStorage.delete(email);

    // Ambil user data jika sudah terdaftar (dari registrasi)
    let userData = null;
    if (sessionStorage.has('users')) {
      const users = sessionStorage.get('users');
      const user = users.get(email);
      if (user) {
        user.verified = true;
        users.set(email, user);
        userData = user;
      }
    }

    // Buat session token
    const sessionToken = generateSessionToken();
    const sessionData = {
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 jam
    };

    // Tambahkan user data ke session jika ada
    if (userData) {
      sessionData.userId = userData.userId;
      sessionData.username = userData.username;
      sessionData.displayName = userData.displayName;
      sessionData.profilePhoto = userData.profilePhoto;
    }

    sessionStorage.set(sessionToken, sessionData);

    res.json({
      success: true,
      message: 'OTP terverifikasi',
      sessionToken,
      email,
      userId: userData?.userId,
      username: userData?.username,
      displayName: userData?.displayName,
      profilePhoto: userData?.profilePhoto
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Gagal memverifikasi OTP' });
  }
});

// 👤 ENDPOINT: REGISTER USER
app.post('/api/register', (req, res) => {
  try {
    const { username, email, password, displayName, profilePhoto } = req.body;

    // Validasi input
    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ 
        success: false,
        error: 'Semua field harus diisi' 
      });
    }

    // Validasi format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Format email tidak valid' 
      });
    }

    // Validasi password minimal 8 karakter
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        error: 'Password minimal 8 karakter' 
      });
    }

    // Simpan data user sementara di sessionStorage
    // Dalam praktik, gunakan database seperti MongoDB atau PostgreSQL
    const userId = 'user_' + Date.now();
    
    // Simpan ke sessionStorage dengan email sebagai key
    if (!sessionStorage.has('users')) {
      sessionStorage.set('users', new Map());
    }
    const users = sessionStorage.get('users');
    
    // Cek apakah username sudah terdaftar
    for (let [key, value] of users) {
      if (value.username === username) {
        return res.status(400).json({ 
          success: false,
          error: 'Username sudah terdaftar' 
        });
      }
    }

    // Cek apakah email sudah terdaftar
    if (users.has(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Email sudah terdaftar' 
      });
    }

    // Simpan user data
    users.set(email, {
      userId,
      username,
      email,
      password, // Dalam praktik, hash password dengan bcrypt
      displayName,
      profilePhoto: profilePhoto || 'default-avatar.jpg',
      createdAt: Date.now(),
      verified: false // Akan true setelah OTP verifikasi
    });

    // Kirim OTP untuk verifikasi email
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 menit
    otpStorage.set(email, { otp, expiresAt });

    // Kirim email OTP
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tamaidev.id@gmail.com',
      to: email,
      subject: '🤖 TamAi v3 - Kode OTP Verifikasi Pendaftaran',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #000000; padding: 20px; border-radius: 10px; color: #ffffff;">
          <h2 style="color: #00ff00;">TamAi v3 🚀</h2>
          <p>Halo, Tuan!</p>
          <p>Terima kasih telah mendaftar. Kode OTP Anda untuk verifikasi email adalah:</p>
          <h1 style="color: #00ff00; font-size: 36px; letter-spacing: 2px; margin: 20px 0;">${otp}</h1>
          <p>Kode ini berlaku selama 10 menit. Jangan bagikan dengan siapa pun.</p>
          <p>Jika Anda tidak mendaftar akun ini, abaikan email ini.</p>
          <hr style="border: 1px solid #333;">
          <p style="font-size: 12px; color: #888;">TamAi v3 © 2024</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending registration OTP:', error);
        return res.status(500).json({ 
          success: false,
          error: 'Gagal mengirim OTP ke email' 
        });
      }

      res.json({
        success: true,
        message: 'Pendaftaran berhasil. Silakan verifikasi email Anda dengan kode OTP yang telah dikirim',
        userId,
        email
      });
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ 
      success: false,
      error: 'Terjadi kesalahan saat pendaftaran' 
    });
  }
});

// 🔑 ENDPOINT: LOGIN USER
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email dan password harus diisi' 
      });
    }

    // Ambil user dari storage
    if (!sessionStorage.has('users')) {
      return res.status(401).json({ 
        success: false,
        error: 'User tidak ditemukan' 
      });
    }

    const users = sessionStorage.get('users');
    const user = users.get(email);

    // Validasi user exists
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Email atau password salah' 
      });
    }

    // Validasi password
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false,
        error: 'Email atau password salah' 
      });
    }

    // Validasi email sudah verified
    if (!user.verified) {
      return res.status(403).json({ 
        success: false,
        error: 'Email belum diverifikasi. Silakan periksa email Anda untuk kode OTP' 
      });
    }

    // Buat session token
    const sessionToken = generateSessionToken();
    sessionStorage.set(sessionToken, {
      userId: user.userId,
      email,
      username: user.username,
      displayName: user.displayName,
      profilePhoto: user.profilePhoto,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 jam
    });

    res.json({
      success: true,
      message: 'Login berhasil',
      sessionToken,
      user: {
        userId: user.userId,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ 
      success: false,
      error: 'Terjadi kesalahan saat login' 
    });
  }
});

// 🤖 ENDPOINT: SEND MESSAGE (Chat dengan AI)
app.post('/api/send-message', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { message, conversationHistory, sessionToken } = req.body;

    // Validasi session
    if (!sessionToken || !sessionStorage.has(sessionToken)) {
      return res.status(401).json({ error: 'Sesi tidak valid atau sudah expired' });
    }

    const session = sessionStorage.get(sessionToken);
    if (Date.now() > session.expiresAt) {
      sessionStorage.delete(sessionToken);
      return res.status(401).json({ error: 'Sesi telah expired' });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
    }

    // Tentukan model berdasarkan konten pesan
    const isCodingRelated = /^(code|script|program|function|class|variable|algorithm|debug|function|method|loop|array|object|html|css|javascript|python|java|cpp|sql|database|api|library|package|npm|pip|git|docker|framework|react|vue|angular|nodejs|express|django|flask|fastapi|database|mongodb|postgres|mysql|firebase|auth|middleware|router|component|state|props|event|hook|lifecycle|render|virtual dom|jsx|typescript|rust|golang|ruby|php|swift|kotlin|webgl|canvas|svg|json|xml|regex|terminal|bash|shell|git|github|gitlab|bitbucket|devops|ci|cd|kubernetes|terraform|ansible|jenkins|github actions|build|deploy|release|version|semantic versioning|npm|yarn|webpack|babel|eslint|prettier|jest|unittest|pytest|mocha|chai|typescript|type safety|generics|interfaces|abstract|inheritance|polymorphism|design patterns|solid principles|clean code|refactor|optimization|performance|security|encryption|hashing|jwt|oauth|rest|graphql|websocket|socket\.io|real-time|streaming|async|await|promises|callbacks|error handling|try catch|logging|debugging|testing|mocking|fixture|stub|integration test|unit test|end to end test)/i.test(message);

    const selectedModel = isCodingRelated 
      ? 'anthropic/claude-3.5-sonnet'
      : 'google/gemini-2.0-flash-001';

    // Siapkan conversation history
    const messages = [
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    // Set header untuk streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const response = await axios.post(
        'https://openrouter.io/api/v1/chat/completions',
        {
          model: selectedModel,
          messages: messages,
          stream: true,
          temperature: 0.7,
          top_p: 1,
          max_tokens: 2048
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000'
          },
          responseType: 'stream'
        }
      );

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              res.write(`data: ${JSON.stringify({ finish: true })}\n\n`);
            } else if (data) {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      });

      response.data.on('end', () => {
        res.end();
      });

      response.data.on('error', (error) => {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Sistem sedang sibuk, Tuan!' })}\n\n`);
        res.end();
      });
    } catch (apiError) {
      console.error('OpenRouter API error:', apiError);
      
      if (apiError.response?.status === 429) {
        res.write(`data: ${JSON.stringify({ error: 'Sistem sedang sibuk, Tuan! (API rate limit tercapai)' })}\n\n`);
      } else if (apiError.response?.status === 401) {
        res.write(`data: ${JSON.stringify({ error: 'API Key tidak valid' })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ error: 'Terjadi kesalahan dalam memproses pesan' })}\n\n`);
      }
      res.end();
    }
  } catch (error) {
    console.error('Error in send-message:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// 📤 ENDPOINT: UPLOAD FILE
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Gagal upload file' });
  }
});

// 📖 ENDPOINT: READ FILE CONTENT
app.get('/api/file-content/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);

    // Security: prevent directory traversal
    if (!filepath.startsWith(path.join(__dirname, 'uploads'))) {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File tidak ditemukan' });
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Gagal membaca file' });
  }
});

// -------------------------
// Google OAuth (simple server-side flow)
// -------------------------
app.get('/api/auth/google', (req, res) => {
  const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const scope = 'openid email profile';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT_ID)}&response_type=code&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&access_type=offline&prompt=consent`;
  return res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code');

    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // Exchange code for tokens
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    const tokenResp = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const idToken = tokenResp.data.id_token;
    // Decode JWT payload
    const parts = idToken.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));

    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Find or create user
    if (!sessionStorage.has('users')) sessionStorage.set('users', new Map());
    const users = sessionStorage.get('users');

    let user = users.get(email);
    if (!user) {
      const userId = 'user_' + Date.now();
      user = {
        userId,
        username: email.split('@')[0],
        email,
        password: '',
        displayName: name || email.split('@')[0],
        profilePhoto: picture || 'default-avatar.jpg',
        createdAt: Date.now(),
        verified: true
      };
      users.set(email, user);
    }

    // Create session token
    const sessionToken = generateSessionToken();
    sessionStorage.set(sessionToken, {
      userId: user.userId,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      profilePhoto: user.profilePhoto,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    // Redirect to app with token
    const redirectToClient = `${process.env.APP_URL || 'http://localhost:3000'}?sessionToken=${sessionToken}`;
    return res.redirect(redirectToClient);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.status(500).send('Google OAuth error');
  }
});

// ⚠️ ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Terjadi kesalahan server',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════╗
║   TamAi v3 - Server Running   ║
║   http://localhost:${PORT}      ║
╚═══════════════════════════════╝
  `);
});
