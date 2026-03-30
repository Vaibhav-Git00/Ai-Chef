#!/bin/bash

# SmartChef Project Startup Script
# This script starts both backend and frontend servers

echo "🍳 SmartChef - Starting Application"
echo "=================================="

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "❌ Error: server/.env not found!"
    echo "📋 Please create server/.env file with required credentials"
    exit 1
fi

if [ ! -f "client/smartchef/.env.local" ]; then
    echo "❌ Error: client/smartchef/.env.local not found!"
    echo "📋 Please create client/smartchef/.env.local file"
    exit 1
fi

echo ""
echo "✅ Environment files found"
echo "🚀 Starting Backend Server..."
cd server
npm install > /dev/null 2>&1
npm start &
BACKEND_PID=$!
echo "✅ Backend PID: $BACKEND_PID"

sleep 3

echo ""
echo "🚀 Starting Frontend Server..."
cd ../client/smartchef
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend PID: $FRONTEND_PID"

echo ""
echo "=================================="
echo "✨ SmartChef is Starting!"
echo ""
echo "📍 Backend:  http://localhost:8000"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "⏳ Waiting for servers to start..."
sleep 2

echo "✅ Both servers are running!"
echo ""
echo "💡 Tips:"
echo "  - Press Ctrl+C to stop the application"
echo "  - Check terminal for any errors"
echo "  - Open http://localhost:5173 in your browser"
echo ""
echo "=================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
