const bcrypt = require('bcryptjs');
const db = require('../database/db');
const cloudinary = require('../config/cloudinary');
const { extractImageFeatures } = require('../services/imageAnalysis');
const { autoMatch } = require('../services/matchingService');
const fs = require('fs').promises;

// Report a lost item
exports.reportLostItem = async (req, res) => {
  try {
    console.log('=== Report Lost Item Request ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    
    const {
      itemName,
      category,
      description,
      location,
      dateLost,
      timeLost,
      secretDetail,
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!itemName || !category || !description || !location || !dateLost || !secretDetail) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    let imageUrl = null;
    let imageFeatures = null;

    // Handle image upload
    if (req.files && req.files.image) {
      const image = req.files.image;
      
      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: 'lost-and-found/lost',
        resource_type: 'image',
      });

      imageUrl = uploadResult.secure_url;

      // Extract features (with fallback)
      try {
        imageFeatures = await extractImageFeatures(image.tempFilePath);
      } catch (featureError) {
        console.warn('Failed to extract image features, continuing without them:', featureError.message);
        imageFeatures = null; // Will still save the item, just without AI features
      }
      
      // Clean up temp file
      await fs.unlink(image.tempFilePath).catch(err => console.warn('Failed to delete temp file:', err));
    }

    // Insert into database
    const result = await db.query(
      `INSERT INTO lost_items 
       (user_id, item_name, category, description, location, date_lost, time_lost, image_url, image_features, secret_detail)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        itemName,
        category,
        description,
        location,
        dateLost,
        timeLost || null,
        imageUrl,
        imageFeatures ? JSON.stringify(imageFeatures) : null,
        secretDetail,
      ]
    );

    const lostItem = result.rows[0];

    // Trigger auto-matching (non-blocking)
    autoMatch('lost', lostItem.id).catch(err => {
      console.warn('Auto-matching failed, but item was saved successfully:', err.message);
    });

    res.status(201).json({
      message: 'Lost item reported successfully',
      item: {
        id: lostItem.id,
        itemName: lostItem.item_name,
        category: lostItem.category,
        status: lostItem.status,
      },
    });
  } catch (error) {
    console.error('Error reporting lost item:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to report lost item';
    if (error.message.includes('cloudinary')) {
      errorMessage = 'Failed to upload image. Please check Cloudinary configuration.';
    } else if (error.message.includes('database') || error.code === '23505') {
      errorMessage = 'Database error. Please check database connection.';
    } else if (error.message.includes('Firebase') || error.message.includes('token')) {
      errorMessage = 'Authentication error. Please login again.';
    }
    
    res.status(500).json({ 
      message: errorMessage, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all lost items (admin only)
exports.getLostItems = async (req, res) => {
  try {
    // Check if user is admin
    const userId = req.user.id;
    const userResult = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    
    if (!userResult.rows[0] || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const { category, status, search } = req.query;
    
    let query = 'SELECT id, item_name, category, description, location, date_lost, image_url, status, created_at FROM lost_items WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (item_name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    // Map snake_case to camelCase for frontend
    const items = result.rows.map(item => ({
      id: item.id,
      itemName: item.item_name,
      category: item.category,
      description: item.description,
      location: item.location,
      dateLost: item.date_lost,
      imageUrl: item.image_url,
      status: item.status,
      createdAt: item.created_at
    }));

    res.json(items);
  } catch (error) {
    console.error('Error getting lost items:', error);
    res.status(500).json({ message: 'Failed to get lost items' });
  }
};

// Get lost item by ID
exports.getLostItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT id, item_name, category, description, location, date_lost, image_url, status, created_at FROM lost_items WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lost item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting lost item:', error);
    res.status(500).json({ message: 'Failed to get lost item' });
  }
};

// Delete lost item (only by owner)
exports.deleteLostItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM lost_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lost item not found or unauthorized' });
    }

    res.json({ message: 'Lost item deleted successfully' });
  } catch (error) {
    console.error('Error deleting lost item:', error);
    res.status(500).json({ message: 'Failed to delete lost item' });
  }
};
