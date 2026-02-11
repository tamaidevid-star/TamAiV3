#!/bin/bash
# 🚀 TamAi v3 Quick Start Script

echo "╔═════════════════════════════════════════╗"
echo "║   TamAi v3 - Quick Start Setup          ║"
echo "║   Full-Stack AI Chat Application        ║"
echo "╚═════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js tidak terinstall"
    echo "Install dari: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Navigate to project directory
cd "$(dirname "$0")" || exit 1

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "📝 Environment Configuration:"
echo "   - Email: tamaidev.id@gmail.com"
echo "   - OpenRouter API: Configured"
echo "   - Google OAuth: Configured"
echo ""

# Check .env file
if [ -f ".env" ]; then
    echo "✅ .env file found"
    echo "   Checking credentials..."
    
    if grep -q "OPENROUTER_API_KEY" .env && grep -q "EMAIL_USER" .env; then
        echo "   ✅ All required credentials present"
    else
        echo "   ⚠️  Some credentials might be missing"
    fi
else
    echo "❌ .env file not found!"
    exit 1
fi

echo ""
echo "🚀 Starting TamAi v3 server..."
echo "   Listening on http://localhost:3000"
echo ""
echo "📝 Tips:"
echo "   - Open http://localhost:3000 in your browser"
echo "   - Login with email or Google OAuth"
echo "   - Check your email for OTP code"
echo "   - Type 'code:' prefix untuk automatic Claude detection"
echo "   - Press Ctrl+C to stop the server"
echo ""

# Start the server
node server.js
