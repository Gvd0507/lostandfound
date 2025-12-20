const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, notificationsController.getNotifications);
router.get('/unread-count', authenticateToken, notificationsController.getUnreadCount);
router.put('/:id/read', authenticateToken, notificationsController.markAsRead);
router.put('/mark-all-read', authenticateToken, notificationsController.markAllAsRead);

module.exports = router;
