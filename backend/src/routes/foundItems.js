const express = require('express');
const router = express.Router();
const foundItemsController = require('../controllers/foundItemsController');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, foundItemsController.reportFoundItem);
router.get('/', authenticateToken, foundItemsController.getFoundItems);
router.get('/:id', authenticateToken, foundItemsController.getFoundItemById);
router.delete('/:id', authenticateToken, foundItemsController.deleteFoundItem);

module.exports = router;
