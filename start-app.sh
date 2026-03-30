#!/bin/bash

# SmartChef AI - Complete Setup & Run Script

echo "🍳 SmartChef AI - Production Setup"
echo "=================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on Mac
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}⚠️  Warning: This script is optimized for macOS${NC}"
fi

# Step 1: Kill existing processes on ports 8000 and 5173
echo -e "\n${YELLOW}Step 1: Checking for port conflicts...${NC}"

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "Killing process on port 8000..."
    lsof -ti:8000 | xargs kill -9
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "Killing process on port 5173..."
    lsof -ti:5173 | xargs kill -9
fi

echo -e "${GREEN}✓ Port check complete${NC}"

# Step 2: Verify Node.js and npm
echo -e "\n${YELLOW}Step 2: Checking Node.js and npm...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

echo "Node.js version: $NODE_VERSION"
echo "npm version: $NPM_VERSION"
echo -e "${GREEN}✓ Node.js and npm verified${NC}"

# Step 3: Install Backend Dependencies
echo -e "\n${YELLOW}Step 3: Installing backend dependencies...${NC}"

cd /Users/vaibhavkesharwani/Desktop/smartchef/server

if [ ! -d "node_modules" ]; then
    echo "Installing backend packages..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install backend dependencies${NC}"
        exit 1
    fi
else
    echo "Backend dependencies already installed"
fi

# Step 4: Install Frontend Dependencies
echo -e "\n${YELLOW}Step 4: Installing frontend dependencies...${NC}"

cd /Users/vaibhavkesharwani/Desktop/smartchef/client/smartchef

if [ ! -d "node_modules" ]; then
    echo "Installing frontend packages..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
        exit 1
    fi
else
    echo "Frontend dependencies already installed"
fi

# Step 5: Verify .env file
echo -e "\n${YELLOW}Step 5: Verifying backend environment variables...${NC}"

ENV_FILE="/Users/vaibhavkesharwani/Desktop/smartchef/server/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗ .env file not found at $ENV_FILE${NC}"
    echo "Creating .env file..."
    cat > "$ENV_FILE" << EOF
MONGO_URL=mongodb+srv://vaibhav:vaibhav123@chef.lgd79o5.mongodb.net/smartchef
PORT=8000
JWT_SECRET=smartchef-super-secret-jwt-key-2026-production
JWT_EXPIRY=30d
CLOUD_NAME=ddto7axtv
CLOUD_API_KEY=537248643332524
CLOUD_API_SECRET=RDEErCcu5YKS_6PjusKDCWHaaQo
OPENROUTER_KEY=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
NODE_ENV=development
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file found${NC}"
fi

# Step 6: Start Servers
echo -e "\n${YELLOW}Step 6: Starting servers...${NC}"
echo -e "${YELLOW}======================================${NC}"

echo -e "\n${GREEN}Starting Backend Server (port 8000)...${NC}"
echo "📂 With files from: /Users/vaibhavkesharwani/Desktop/smartchef/server"
echo ""

cd /Users/vaibhavkesharwani/Desktop/smartchef/server

# Start backend in background
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

echo ""
echo -e "${GREEN}Starting Frontend Server (port 5173)...${NC}"
echo "📂 With files from: /Users/vaibhavkesharwani/Desktop/smartchef/client/smartchef"
echo ""

cd /Users/vaibhavkesharwani/Desktop/smartchef/client/smartchef

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Display instructions
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✓ Both servers are now running!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${YELLOW}Backend Server:${NC}  http://localhost:8000"
echo -e "${YELLOW}Frontend Server:${NC} http://localhost:5173"
echo ""
echo -e "Open your browser and navigate to: ${GREEN}http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}Test Actions:${NC}"
echo "1. Click 'Sign Up' → Enter phone → Send OTP"
echo "2. Check backend terminal for OTP code"
echo "3. Enter OTP and complete signup"
echo "4. Should redirect to Dashboard"
echo ""
echo -e "${YELLOW}To stop servers, press Ctrl+C${NC}"
echo ""

# Keep script running
wait $BACKEND_PID $FRONTEND_PID
