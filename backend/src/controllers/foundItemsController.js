const db = require('../database/db');
const cloudinary = require('../config/cloudinary');
const { extractImageFeatures } = require('../services/imageAnalysis');
const { autoMatch } = require('../services/matchingService');
const fs = require('fs').promises;

// Report a found item
exports.reportFoundItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      description,
      location,
      dateFound,
      timeFound,
      secretDetail,
      whereToFind,
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!itemName || !category || !description || !location || !dateFound || !secretDetail || !whereToFind) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Image is required for found items
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'Image is required for found items' });
    }

    const image = req.files.image;
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: 'lost-and-found/found',
      resource_type: 'image',
    });

    const imageUrl = uploadResult.secure_url;

    // Extract features (with fallback)
    let imageFeatures = null;
    try {
      imageFeatures = await extractImageFeatures(image.tempFilePath);
    } catch (featureError) {
      console.warn('Failed to extract image features, continuing without them:', featureError.message);
      imageFeatures = null; // Will still save the item, just without AI features
    }
    
    // Clean up temp file
    await fs.unlink(image.tempFilePath).catch(err => console.warn('Failed to delete temp file:', err));

    // Insert into database
    const result = await db.query(
      `INSERT INTO found_items 
       (user_id, item_name, category, description, location, date_found, image_url, image_features, secret_detail, where_to_find)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        itemName,
        category,
        description,
        location,
        dateFound,
        imageUrl,
        imageFeatures ? JSON.stringify(imageFeatures) : null,
        secretDetail,
        whereToFind,
      ]
    );

    const foundItem = result.rows[0];

    // Trigger auto-matching (non-blocking)
    autoMatch('found', foundItem.id).catch(err => {
      console.warn('Auto-matching failed, but item was saved successfully:', err.message);
    });

    res.status(201).json({
      message: 'Found item reported successfully',
      item: {
        id: foundItem.id,
        itemName: foundItem.item_name,
        category: foundItem.category,
        status: foundItem.status,
      },
    });
  } catch (error) {
    console.error('Error reporting found item:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to report found item';
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

// Get all found items
exports.getFoundItems = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    let query = 'SELECT id, item_name, category, description, location, date_found, image_url, status, where_to_find, created_at FROM found_items WHERE 1=1';
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
      dateFound: item.date_found,
      imageUrl: item.image_url,
      status: item.status,
      whereToFind: item.where_to_find,
      createdAt: item.created_at
    }));

    res.json(items);
  } catch (error) {
    console.error('Error getting found items:', error);
    res.status(500).json({ message: 'Failed to get found items' });
  }
};

// Get found item by ID
exports.getFoundItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT id, item_name, category, description, location, date_found, image_url, status, where_to_find, created_at FROM found_items WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting found item:', error);
    res.status(500).json({ message: 'Failed to get found item' });
  }
};

// Delete found item (only by owner)
exports.deleteFoundItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM found_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Found item not found or unauthorized' });
    }

    res.json({ message: 'Found item deleted successfully' });
  } catch (error) {
    console.error('Error deleting found item:', error);
    res.status(500).json({ message: 'Failed to delete found item' });
  }
};
