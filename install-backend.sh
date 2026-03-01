#!/bin/bash

# Yusco Shop Backend - Dependency Installation Script
# This script installs all backend dependencies

echo "╔════════════════════════════════════════════════════╗"
echo "║  Yusco Shop Backend - Installing Dependencies      ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

cd backend

echo "Step 1: Clearing npm cache..."
npm cache clean --force

echo ""
echo "Step 2: Installing dependencies..."
npm install --verbose

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "Step 3: Building TypeScript..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Backend built successfully!"
        echo ""
        echo "📝 Next steps:"
        echo "  1. Configure .env file:"
        echo "     cp .env.example .env"
        echo ""
        echo "  2. Start development server:"
        echo "     npm run dev"
        echo ""
        echo "  3. Test health endpoint:"
        echo "     curl http://localhost:5000/api/health"
    else
        echo "❌ Build failed. Please check errors above."
        exit 1
    fi
else
    echo "❌ Installation failed. Please check errors above."
    echo ""
    echo "💡 Troubleshooting tips:"
    echo "  • Check your internet connection"
    echo "  • Try clearing cache: npm cache clean --force"
    echo "  • Try again in a few moments"
    exit 1
fi
