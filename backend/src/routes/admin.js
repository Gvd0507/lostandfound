const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const db = require('../database/db');

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    const result = await db.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

router.get('/cases', authenticateToken, isAdmin, adminController.getAdminCases);
router.post('/cases/:caseId/resolve', authenticateToken, isAdmin, adminController.resolveAdminCase);

module.exports = router;
