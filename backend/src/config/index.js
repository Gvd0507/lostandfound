require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'lostandfound',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  },
  
  security: {
    allowedDomains: process.env.ALLOWED_DOMAINS?.split(',') || ['student.gitam.edu', 'gitam.in'],
  },
  
  ai: {
    imageSimilarityThreshold: parseFloat(process.env.IMAGE_SIMILARITY_THRESHOLD) || 0.75,
    textSimilarityThreshold: parseFloat(process.env.TEXT_SIMILARITY_THRESHOLD) || 0.60,
    matchScoreThreshold: parseFloat(process.env.MATCH_SCORE_THRESHOLD) || 0.70,
  },
};
