@echo off
echo ========================================
echo Campus Lost and Found System
echo Automated Installation Script
echo ========================================
echo.

:: Check Node.js
echo [1/7] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found
echo.

:: Check PostgreSQL
echo [2/7] Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL not found locally
    echo You can use a cloud database (Supabase, Neon, etc.)
) else (
    echo ✓ PostgreSQL found
)
echo.

:: Install root dependencies
echo [3/7] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)
echo ✓ Root dependencies installed
echo.

:: Install backend dependencies
echo [4/7] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed
cd ..
echo.

:: Install frontend dependencies
echo [5/7] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
cd ..
echo.

:: Check for .env files
echo [6/7] Checking environment files...
if not exist "backend\.env" (
    echo WARNING: backend/.env not found
    echo Please create it from backend/.env.example
    copy backend\.env.example backend\.env
    echo Created backend/.env from example
)
if not exist "frontend\.env" (
    echo WARNING: frontend/.env not found
    echo Please create it from frontend/.env.example
    copy frontend\.env.example frontend\.env
    echo Created frontend/.env from example
)
echo ✓ Environment files checked
echo.

:: Setup instructions
echo [7/7] Setup complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Configure environment variables:
echo    - Edit backend/.env with your credentials
echo    - Edit frontend/.env with your Firebase config
echo.
echo 2. Set up the database:
echo    cd backend
echo    npm run db:setup
echo.
echo 3. Start the application:
echo    cd ..
echo    npm run dev
echo.
echo ========================================
echo For detailed setup instructions, see:
echo - QUICKSTART.md
echo - SETUP.md
echo ========================================
echo.
pause
