const db = require('../database/db');

// Get user's reports
exports.getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get lost items
    const lostResult = await db.query(
      `SELECT id, item_name, category, description, location, date_lost, image_url, status, created_at
       FROM lost_items
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Get found items
    const foundResult = await db.query(
      `SELECT id, item_name, category, description, location, date_found, image_url, status, created_at
       FROM found_items
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      lost: lostResult.rows,
      found: foundResult.rows,
    });
  } catch (error) {
    console.error('Error getting user reports:', error);
    res.status(500).json({ message: 'Failed to get reports' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT id, email, display_name, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};
