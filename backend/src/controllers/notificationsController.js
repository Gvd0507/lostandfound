const db = require('../database/db');

// Get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly } = req.query;

    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [userId];

    if (unreadOnly === 'true') {
      query += ' AND is_read = false';
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const result = await db.query(query, params);

    const notifications = result.rows.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      matchId: notification.match_id,
      isRead: notification.is_read,
      createdAt: notification.created_at
    }));

    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Failed to get notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
};

// Helper function to create notification
exports.createNotification = async (userId, type, title, message, matchId = null) => {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message, match_id) VALUES ($1, $2, $3, $4, $5)',
      [userId, type, title, message, matchId]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = exports;
