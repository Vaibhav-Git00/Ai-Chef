#!/bin/bash

echo "🍳 SmartChef AI - Production Upgrade Setup Script"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed${NC}"

# Backend Setup
echo ""
echo "🔧 Setting up Backend..."
cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found in server directory${NC}"
    echo "   Create .env with the following variables:"
    echo "   - MONGO_URL"
    echo "   - JWT_SECRET"
    echo "   - PORT"
    echo "   - CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET"
    echo "   - OPENROUTER_KEY"
    echo "   - Optional: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE"
else
    echo -e "${GREEN}✓ .env file found${NC}"
fi

cd ..

# Frontend Setup
echo ""
echo "🎨 Setting up Frontend..."
cd client/smartchef

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

# Check .env.local file
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local file not found in client/smartchef directory${NC}"
    echo "   Create .env.local with:"
    echo "   VITE_OPENROUTER_KEY=your_openrouter_key"
else
    echo -e "${GREEN}✓ .env.local file found${NC}"
fi

cd ../..

# Summary
echo ""
echo "=================================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "📝 Next steps:"
echo ""
echo "1️⃣  Create .env files (if not already done)"
echo "   Backend:  server/.env"
echo "   Frontend: client/smartchef/.env.local"
echo ""
echo "2️⃣  Start Backend:"
echo "   cd server && npm start"
echo ""
echo "3️⃣  Start Frontend (in another terminal):"
echo "   cd client/smartchef && npm run dev"
echo ""
echo "4️⃣  Backend will run on: http://localhost:8000"
echo "5️⃣  Frontend will run on: http://localhost:5173"
echo ""
echo "📚 For detailed documentation, see PRODUCTION_UPGRADE_GUIDE.md"
echo ""
echo "Happy Cooking! 🍳"
