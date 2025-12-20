const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authenticateToken = require('../middleware/auth');

router.get('/my-reports', authenticateToken, usersController.getMyReports);
router.get('/profile', authenticateToken, usersController.getProfile);

module.exports = router;
