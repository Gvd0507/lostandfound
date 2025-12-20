const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');
const authenticateToken = require('../middleware/auth');

router.get('/my-matches', authenticateToken, matchesController.getMyMatches);
router.get('/:matchId', authenticateToken, matchesController.getMatchById);
router.post('/:matchId/verify', authenticateToken, matchesController.verifyMatch);

module.exports = router;
