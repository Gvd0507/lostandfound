# Campus Lost and Found System

An AI-powered automated lost and found matching system for GITAM University campus.

## Features

- 🔐 Google Authentication (restricted to @student.gitam.edu and @gitam.in domains)
- 📸 Image upload for lost/found items
- 🤖 AI-powered image and text matching
- 🔒 Secret question verification for security
- 👤 Anonymous reporting (no user identity disclosed)
- 🎯 Smart matching algorithm
- ⚠️ Admin escalation for edge cases

## Tech Stack

### Frontend
- React.js
- Material-UI
- Firebase Authentication
- Axios for API calls
- TensorFlow.js for client-side image analysis

### Backend
- Node.js
- Express.js
- PostgreSQL database
- Cloudinary (free tier) for image storage
- TensorFlow.js for image similarity
- Natural language processing for text matching

### Database
- PostgreSQL for structured data
- Firebase Authentication for user management

## Project Structure

```
lost-and-found/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API and auth services
│   │   ├── utils/        # Utility functions
│   │   └── pages/        # Page components
│   └── public/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Auth & validation
│   │   ├── services/     # AI matching service
│   │   └── config/       # Configuration
│   └── tests/
└── database/             # Database schemas
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v13+)
- npm or yarn

### Environment Variables

Create `.env` files in both frontend and backend directories.

#### Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

#### Backend `.env`:
```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/lostandfound
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FIREBASE_ADMIN_SDK_KEY=path/to/serviceAccountKey.json
JWT_SECRET=your_jwt_secret
ALLOWED_DOMAINS=student.gitam.edu,gitam.in
```

### Installation

1. **Clone and Install Dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Database Setup**
```bash
cd backend
npm run db:setup
```

3. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## Matching Algorithm

The system uses a hybrid matching approach:

1. **Image Similarity**: MobileNet + Cosine Similarity (threshold: 0.75)
2. **Text Matching**: TF-IDF + Levenshtein distance for descriptions
3. **Temporal/Spatial Matching**: Location and time correlation
4. **Weighted Scoring**: Combined score > 0.70 triggers a match

## Security Features

- Email domain validation
- Secret question/answer verification
- Anonymous user profiles
- Secure image storage
- Rate limiting on API endpoints

## License

MIT License
