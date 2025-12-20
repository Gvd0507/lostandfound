const admin = require('../config/firebase');
const config = require('../config');
const db = require('../database/db');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Validate email domain
    const email = decodedToken.email;
    const domain = email.split('@')[1];
    
    if (!config.security.allowedDomains.includes(domain)) {
      return res.status(403).json({ 
        message: 'Access denied. Only GITAM university emails are allowed.' 
      });
    }

    // Get or create user in database
    let user = await db.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [decodedToken.uid]
    );

    if (user.rows.length === 0) {
      // Create new user
      const result = await db.query(
        'INSERT INTO users (email, firebase_uid, display_name) VALUES ($1, $2, $3) RETURNING *',
        [email, decodedToken.uid, decodedToken.name || email.split('@')[0]]
      );
      user = result;
    }

    req.user = {
      id: user.rows[0].id,
      email: user.rows[0].email,
      firebaseUid: user.rows[0].firebase_uid,
      displayName: user.rows[0].display_name,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
