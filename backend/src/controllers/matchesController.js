const bcrypt = require('bcryptjs');
const db = require('../database/db');

// Get matches for current user
exports.getMyMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT 
        m.*,
        li.item_name as lost_item_name,
        li.category as lost_category,
        li.image_url as lost_image_url,
        li.user_id as lost_user_id,
        li.secret_question,
        fi.item_name as found_item_name,
        fi.category as found_category,
        fi.image_url as found_image_url,
        fi.user_id as found_user_id,
        fi.secret_detail,
        fi.where_to_find
      FROM matches m
      JOIN lost_items li ON m.lost_item_id = li.id
      JOIN found_items fi ON m.found_item_id = fi.id
      WHERE li.user_id = $1 OR fi.user_id = $1
      ORDER BY m.created_at DESC`,
      [userId]
    );

    const matches = result.rows.map(match => {
      const isLostReporter = match.lost_user_id === userId;
      
      return {
        id: match.id,
        matchScore: parseFloat(match.match_score),
        status: match.status,
        matchedAt: match.created_at,
        yourItem: isLostReporter ? {
          type: 'lost',
          itemName: match.lost_item_name,
          category: match.lost_category,
          imageUrl: match.lost_image_url,
        } : {
          type: 'found',
          itemName: match.found_item_name,
          category: match.found_category,
          imageUrl: match.found_image_url,
        },
        matchedItem: isLostReporter ? {
          type: 'found',
          itemName: match.found_item_name,
          category: match.found_category,
          imageUrl: match.found_image_url,
        } : {
          type: 'lost',
          itemName: match.lost_item_name,
          category: match.lost_category,
          imageUrl: match.lost_image_url,
        },
        requiresVerification: match.status === 'matched',
        secretQuestion: isLostReporter ? match.secret_question : null,
        secretDetail: isLostReporter ? null : match.secret_detail,
        whereToFind: isLostReporter ? match.where_to_find : null,
      };
    });

    res.json(matches);
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ message: 'Failed to get matches' });
  }
};

// Verify ownership by answering secret question
exports.verifyMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;

    if (!answer) {
      return res.status(400).json({ message: 'Answer is required' });
    }

    // Get match details
    const matchResult = await db.query(
      `SELECT m.*, li.secret_answer_hash, li.user_id as lost_user_id, fi.user_id as found_user_id, fi.secret_detail
       FROM matches m
       JOIN lost_items li ON m.lost_item_id = li.id
       JOIN found_items fi ON m.found_item_id = fi.id
       WHERE m.id = $1`,
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const match = matchResult.rows[0];

    // Check if user is involved in this match
    if (match.lost_user_id !== userId && match.found_user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if max attempts already exceeded
    if (match.verification_attempts >= 3) {
      return res.status(400).json({ 
        message: 'Maximum verification attempts (3) exceeded. This case has been escalated to admin review.',
        attemptsRemaining: 0
      });
    }

    // Check if already in admin review
    if (match.status === 'admin_review') {
      return res.status(400).json({ 
        message: 'This match is under admin review due to multiple failed attempts.'
      });
    }

    // Verify the answer
    const isCorrect = await bcrypt.compare(
      answer.toLowerCase().trim(),
      match.secret_answer_hash
    );

    // Increment verification attempts
    await db.query(
      'UPDATE matches SET verification_attempts = verification_attempts + 1 WHERE id = $1',
      [matchId]
    );

    if (isCorrect) {
      // Mark as verified
      await db.query(
        'UPDATE matches SET status = $1, verified_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['verified', matchId]
      );
      
      // Update item statuses
      await db.query(
        'UPDATE lost_items SET status = $1 WHERE id = $2',
        ['closed', match.lost_item_id]
      );
      await db.query(
        'UPDATE found_items SET status = $1 WHERE id = $2',
        ['closed', match.found_item_id]
      );

      res.json({ 
        message: 'Ownership verified! Both parties will be notified.',
        verified: true 
      });
    } else {
      const attemptsUsed = match.verification_attempts + 1;
      const attemptsRemaining = 3 - attemptsUsed;

      // If this was the 3rd failed attempt, escalate to admin
      if (attemptsUsed >= 3) {
        await db.query(
          `INSERT INTO admin_cases (match_id, reason, status)
           VALUES ($1, $2, $3)`,
          [matchId, 'Maximum verification attempts (3) exceeded', 'pending']
        );
        await db.query(
          'UPDATE matches SET status = $1 WHERE id = $2',
          ['admin_review', matchId]
        );
        
        return res.status(400).json({ 
          message: 'Maximum verification attempts (3) exceeded. This case has been escalated to admin review.',
          verified: false,
          attemptsRemaining: 0
        });
      }

      res.status(400).json({ 
        message: `Incorrect answer. You have ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`,
        verified: false,
        attemptsRemaining
      });
    }
  } catch (error) {
    console.error('Error verifying match:', error);
    res.status(500).json({ message: 'Failed to verify match' });
  }
};

// Get match by ID
exports.getMatchById = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT 
        m.*,
        li.item_name as lost_item_name,
        li.description as lost_description,
        li.user_id as lost_user_id,
        fi.item_name as found_item_name,
        fi.description as found_description,
        fi.user_id as found_user_id
      FROM matches m
      JOIN lost_items li ON m.lost_item_id = li.id
      JOIN found_items fi ON m.found_item_id = fi.id
      WHERE m.id = $1 AND (li.user_id = $2 OR fi.user_id = $2)`,
      [matchId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting match:', error);
    res.status(500).json({ message: 'Failed to get match' });
  }
};
