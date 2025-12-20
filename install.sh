#!/bin/bash

echo "========================================"
echo "Campus Lost and Found System"
echo "Automated Installation Script"
echo "========================================"
echo ""

# Check Node.js
echo "[1/7] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from: https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"
echo ""

# Check PostgreSQL
echo "[2/7] Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "WARNING: PostgreSQL not found locally"
    echo "You can use a cloud database (Supabase, Neon, etc.)"
else
    echo "✓ PostgreSQL found: $(psql --version)"
fi
echo ""

# Install root dependencies
echo "[3/7] Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install root dependencies"
    exit 1
fi
echo "✓ Root dependencies installed"
echo ""

# Install backend dependencies
echo "[4/7] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
echo "✓ Backend dependencies installed"
cd ..
echo ""

# Install frontend dependencies
echo "[5/7] Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
echo "✓ Frontend dependencies installed"
cd ..
echo ""

# Check for .env files
echo "[6/7] Checking environment files..."
if [ ! -f "backend/.env" ]; then
    echo "WARNING: backend/.env not found"
    echo "Creating from backend/.env.example"
    cp backend/.env.example backend/.env
fi
if [ ! -f "frontend/.env" ]; then
    echo "WARNING: frontend/.env not found"
    echo "Creating from frontend/.env.example"
    cp frontend/.env.example frontend/.env
fi
echo "✓ Environment files checked"
echo ""

# Setup instructions
echo "[7/7] Setup complete!"
echo ""
echo "========================================"
echo "NEXT STEPS:"
echo "========================================"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit backend/.env with your credentials"
echo "   - Edit frontend/.env with your Firebase config"
echo ""
echo "2. Set up the database:"
echo "   cd backend"
echo "   npm run db:setup"
echo ""
echo "3. Start the application:"
echo "   cd .."
echo "   npm run dev"
echo ""
echo "========================================"
echo "For detailed setup instructions, see:"
echo "- QUICKSTART.md"
echo "- SETUP.md"
echo "========================================"
echo ""
