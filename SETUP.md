# Campus Lost and Found System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn
- Git

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" and follow the wizard
3. Once created, click on "Authentication" in the left sidebar
4. Enable "Google" sign-in method
5. Add authorized domains: `student.gitam.edu` and `gitam.in`

### 1.2 Get Firebase Configuration

1. Click on the gear icon → Project Settings
2. Scroll down to "Your apps" section
3. Click on the web icon (</>) to add a web app
4. Copy the Firebase configuration object

### 1.3 Generate Service Account Key

1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely (you'll need this for the backend)

## Step 2: Cloudinary Setup (Free Tier)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. After login, go to Dashboard
3. Copy these credentials:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: PostgreSQL Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL
2. Create a new database:

```bash
psql -U postgres
CREATE DATABASE lostandfound;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lostandfound TO your_username;
\q
```

### Option B: Free Cloud PostgreSQL (Recommended)

Use one of these free services:
- **Supabase**: https://supabase.com/ (500MB free)
- **ElephantSQL**: https://www.elephantsql.com/ (20MB free)
- **Neon**: https://neon.tech/ (3GB free)

After creating, copy the connection string (DATABASE_URL).

## Step 4: Backend Configuration

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Edit `.env` and fill in your credentials:

```env
PORT=5000
NODE_ENV=development

# Database (use your connection string)
DATABASE_URL=postgresql://username:password@host:5432/lostandfound

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT Secret (generate a random string)
JWT_SECRET=generate_a_random_secret_here

# Security
ALLOWED_DOMAINS=student.gitam.edu,gitam.in

# AI Thresholds (optional, defaults provided)
IMAGE_SIMILARITY_THRESHOLD=0.75
TEXT_SIMILARITY_THRESHOLD=0.60
MATCH_SCORE_THRESHOLD=0.70
```

4. Install dependencies:

```bash
npm install
```

5. Set up the database:

```bash
npm run db:setup
```

This will create all necessary tables and indexes.

## Step 5: Frontend Configuration

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Edit `.env` with your Firebase credentials:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. Install dependencies:

```bash
npm install
```

## Step 6: Running the Application

### Development Mode

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will start on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The frontend will open automatically on http://localhost:3000

### Using Root Package (Alternative)

From the project root:

```bash
npm run install-all
npm run dev
```

This will install all dependencies and run both servers.

## Step 7: Testing the Application

1. Open http://localhost:3000
2. Click "Sign in with Google"
3. Use a GITAM email address (@student.gitam.edu or @gitam.in)
4. Try reporting a lost or found item
5. Upload an image and fill in the details

## Troubleshooting

### Common Issues

**1. "Cannot connect to database"**
- Check your DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Verify the database exists

**2. "Firebase authentication failed"**
- Verify all Firebase credentials in `.env`
- Check that Google sign-in is enabled in Firebase Console
- Ensure authorized domains are configured

**3. "Failed to load AI model"**
- This is normal on first startup (model downloads automatically)
- Ensure you have good internet connection
- Model will be cached after first load

**4. "Image upload failed"**
- Verify Cloudinary credentials
- Check file size (max 5MB)
- Ensure file type is supported (JPEG, PNG, WebP)

**5. Port already in use**
- Change PORT in backend/.env
- Update REACT_APP_API_URL in frontend/.env

### Getting Help

If you encounter issues:

1. Check the console logs in both terminals
2. Verify all environment variables are set correctly
3. Ensure all services (Firebase, Cloudinary, PostgreSQL) are accessible

## Next Steps

- Configure Firebase email verification (optional)
- Set up automated tests
- Deploy to production (see DEPLOYMENT.md)
- Configure admin users for admin panel
