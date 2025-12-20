const db = require('../database/db');

// Get all admin cases
exports.getAdminCases = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        ac.*,
        m.match_score,
        li.item_name as lost_item_name,
        li.image_url as lost_image_url,
        fi.item_name as found_item_name,
        fi.image_url as found_image_url
      FROM admin_cases ac
      JOIN matches m ON ac.match_id = m.id
      JOIN lost_items li ON m.lost_item_id = li.id
      JOIN found_items fi ON m.found_item_id = fi.id
      WHERE ac.status = 'pending'
      ORDER BY ac.created_at ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting admin cases:', error);
    res.status(500).json({ message: 'Failed to get admin cases' });
  }
};

// Resolve an admin case
exports.resolveAdminCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { resolution, matchVerified } = req.body;

    if (!resolution) {
      return res.status(400).json({ message: 'Resolution is required' });
    }

    // Get the case
    const caseResult = await db.query(
      'SELECT * FROM admin_cases WHERE id = $1',
      [caseId]
    );

    if (caseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const adminCase = caseResult.rows[0];

    // Update case
    await db.query(
      `UPDATE admin_cases 
       SET resolution = $1, status = $2, resolved_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [resolution, 'resolved', caseId]
    );

    // Update match status based on admin decision
    const newStatus = matchVerified ? 'verified' : 'rejected';
    await db.query(
      'UPDATE matches SET status = $1 WHERE id = $2',
      [newStatus, adminCase.match_id]
    );

    if (matchVerified) {
      // Get match details to update items
      const matchResult = await db.query(
        'SELECT lost_item_id, found_item_id FROM matches WHERE id = $1',
        [adminCase.match_id]
      );
      
      const match = matchResult.rows[0];
      
      await db.query(
        'UPDATE lost_items SET status = $1 WHERE id = $2',
        ['closed', match.lost_item_id]
      );
      await db.query(
        'UPDATE found_items SET status = $1 WHERE id = $2',
        ['closed', match.found_item_id]
      );
    }

    res.json({ message: 'Case resolved successfully' });
  } catch (error) {
    console.error('Error resolving admin case:', error);
    res.status(500).json({ message: 'Failed to resolve case' });
  }
};
