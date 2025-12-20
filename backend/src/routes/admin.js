const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');

router.get('/cases', authenticateToken, adminController.getAdminCases);
router.post('/cases/:caseId/resolve', authenticateToken, adminController.resolveAdminCase);

module.exports = router;
