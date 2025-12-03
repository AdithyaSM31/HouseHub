/**
 * Bookmark Controller
 * Handles bookmark/save property functionality
 */

const { pool } = require('../config/database');

/**
 * Toggle bookmark on a property
 * POST /api/bookmarks/toggle/:propertyId
 */
const toggleBookmark = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;

    // Check if property exists
    const [properties] = await pool.query(
      'SELECT id FROM properties WHERE id = ?',
      [propertyId]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if already bookmarked
    const [bookmarks] = await pool.query(
      'SELECT id FROM bookmarks WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );

    if (bookmarks.length > 0) {
      // Remove bookmark
      await pool.query(
        'DELETE FROM bookmarks WHERE user_id = ? AND property_id = ?',
        [userId, propertyId]
      );

      return res.status(200).json({
        success: true,
        message: 'Bookmark removed',
        isBookmarked: false
      });
    } else {
      // Add bookmark
      await pool.query(
        'INSERT INTO bookmarks (user_id, property_id) VALUES (?, ?)',
        [userId, propertyId]
      );

      return res.status(200).json({
        success: true,
        message: 'Property bookmarked',
        isBookmarked: true
      });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle bookmark',
      error: error.message
    });
  }
};

/**
 * Get user's bookmarked properties
 * GET /api/bookmarks
 */
const getBookmarkedProperties = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const userId = req.user.id;

    // Get total count
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM bookmarks WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;

    // Get bookmarked properties
    const offset = (page - 1) * limit;
    const [properties] = await pool.query(
      `SELECT p.*, 
        b.created_at as bookmarked_at,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM property_images WHERE property_id = p.id) as image_count,
        u.display_name as owner_name,
        u.profile_image_url as owner_image
       FROM bookmarks b
       JOIN properties p ON b.property_id = p.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Parse amenities
    properties.forEach(property => {
      property.amenities = property.amenities ? JSON.parse(property.amenities) : [];
      property.isBookmarked = true;
    });

    res.status(200).json({
      success: true,
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bookmarked properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookmarked properties',
      error: error.message
    });
  }
};

/**
 * Check if property is bookmarked
 * GET /api/bookmarks/check/:propertyId
 */
const checkBookmark = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;

    const [bookmarks] = await pool.query(
      'SELECT id FROM bookmarks WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );

    res.status(200).json({
      success: true,
      isBookmarked: bookmarks.length > 0
    });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check bookmark',
      error: error.message
    });
  }
};

module.exports = {
  toggleBookmark,
  getBookmarkedProperties,
  checkBookmark
};
