# 🤖 TamAi v3 - Full-Stack AI Chat Application

Aplikasi Full-Stack AI dengan integrasi OpenRouter, Google OAuth, dan Email OTP Authentication.

## ✨ Features

- 🔐 **Dual Authentication**: Google OAuth + Email OTP
- 🤖 **Dual AI Models**: Gemini 2.0 (chat cepat) & Claude 3.5 (coding)
- 💬 **Real-time Streaming**: Response streaming dari OpenRouter API
- 📎 **File Attachment**: Support .txt, .js, .py, .html, .pdf
- 📋 **Chat History**: Persistent conversation history
- ⚙️ **User Settings**: Custom username, display name, profile photo
- 🌙 **Dark Mode UI**: GitHub OLED Style Interface
- 📱 **Fully Responsive**: Mobile-first design

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Email**: Nodemailer (Gmail SMTP)
- **AI**: OpenRouter API
- **Auth**: Google OAuth 2.0 + Custom OTP
- **Storage**: LocalStorage (frontend), In-memory (backend)

## 📦 Installation

### Prerequisites
- Node.js 14+ dan npm
- Gmail account dengan App Password

### Setup Steps

1. **Clone dan masuk folder**
   ```bash
   cd /workspaces/TamAiV3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure .env** (file sudah ada, update kredensial jika perlu)
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   OPENROUTER_API_KEY=your-api-key
   PORT=3000
   ```

4. **Start server**
   ```bash
   npm start
   ```
   atau untuk development dengan nodemon:
   ```bash
   npm run dev
   ```

5. **Akses aplikasi**
   Open http://localhost:3000 di browser

## 🔑 API Endpoints

### Authentication
- `POST /api/send-otp` - Kirim OTP ke email
- `POST /api/verify-otp` - Verifikasi OTP

### Chat
- `POST /api/send-message` - Send message (Server-Sent Events/Streaming)

### Files
- `POST /api/upload` - Upload file
- `GET /api/file-content/:filename` - Get file content

## 📁 File Structure

```
TamAiV3/
├── server.js              # Express server
├── package.json           # Dependencies
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── public/
│   ├── index.html        # Main HTML
│   └── script.js         # Frontend logic
└── uploads/              # File uploads directory
```

## 🔐 Security Features

- API keys dalam environment variables
- Input validation & sanitization
- File type & size restrictions
- Session token-based authentication
- CORS protection

## 🎨 UI/UX Features

- Dark mode (#000000 background)
- Markdown rendering dengan syntax highlighting
- Auto-copy button untuk code blocks
- Responsive chat bubbles
- Loading indicator dengan "TamAi is thinking..." message
- Mobile sidebar toggle

## 🚀 Deployment

### Heroku
```bash
npm install -g heroku
heroku create your-app-name
git push heroku main
```

### Railway / Render
- Push code ke GitHub
- Connect repository ke Railway/Render
- Set environment variables
- Deploy

## 🐛 Troubleshooting

### OTP tidak terkirim
- Pastikan Gmail App Password benar
- Cek email spam folder
- Pastikan "Less secure app access" enabled di akun Google

### API limit tercapai
- Aplikasi akan menampilkan pesan "Sistem sedang sibuk, Tuan Tama!"
- Tunggu beberapa menit sebelum mencoba lagi

### File upload error
- Hanya support: .txt, .js, .py, .html, .pdf
- Max file size: 10MB

## 📝 License

MIT License

## 👨‍💻 Author

TamAi Team 
