const express = require('express');
const router = express.Router();
const lostItemsController = require('../controllers/lostItemsController');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, lostItemsController.reportLostItem);
router.get('/', authenticateToken, lostItemsController.getLostItems);
router.get('/:id', authenticateToken, lostItemsController.getLostItemById);
router.delete('/:id', authenticateToken, lostItemsController.deleteLostItem);

module.exports = router;
