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
          <p>Halo, Tuan Tama!</p>
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

    otpStorage.delete(email);
    const sessionToken = generateSessionToken();
    sessionStorage.set(sessionToken, {
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 jam
    });

    res.json({
      success: true,
      message: 'OTP terverifikasi',
      sessionToken,
      email
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Gagal memverifikasi OTP' });
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
        res.write(`data: ${JSON.stringify({ error: 'Sistem sedang sibuk, Tuan Tama!' })}\n\n`);
        res.end();
      });
    } catch (apiError) {
      console.error('OpenRouter API error:', apiError);
      
      if (apiError.response?.status === 429) {
        res.write(`data: ${JSON.stringify({ error: 'Sistem sedang sibuk, Tuan Tama! (API rate limit tercapai)' })}\n\n`);
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
