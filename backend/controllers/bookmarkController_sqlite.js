/**
 * Bookmark Controller - SQLite Version
 */

const { db } = require('../config/database');

/**
 * Toggle bookmark (add/remove)
 * POST /api/bookmarks/:propertyId
 */
exports.toggleBookmark = (req, res) => {
  try {
    const userId = req.user.userId;
    const { propertyId } = req.params;

    // Check if bookmark exists
    const existing = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND property_id = ?').get(userId, propertyId);

    if (existing) {
      // Remove bookmark
      db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND property_id = ?').run(userId, propertyId);
      
      res.json({
        success: true,
        message: 'Bookmark removed',
        bookmarked: false
      });
    } else {
      // Add bookmark
      db.prepare('INSERT INTO bookmarks (user_id, property_id) VALUES (?, ?)').run(userId, propertyId);
      
      res.json({
        success: true,
        message: 'Bookmark added',
        bookmarked: true
      });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
};

/**
 * Get all bookmarked properties for current user
 * GET /api/bookmarks
 */
exports.getBookmarks = (req, res) => {
  try {
    const userId = req.user.userId;

    const query = `
      SELECT p.*, 
        GROUP_CONCAT(pi.image_url) as images,
        u.display_name as owner_name,
        b.created_at as bookmarked_at
      FROM bookmarks b
      JOIN properties p ON b.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE b.user_id = ?
      GROUP BY p.id
      ORDER BY b.created_at DESC
    `;

    const properties = db.prepare(query).all(userId);

    properties.forEach(prop => {
      prop.amenities = prop.amenities ? JSON.parse(prop.amenities) : [];
      prop.images = prop.images ? prop.images.split(',') : [];
    });

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

/**
 * Check if property is bookmarked
 * GET /api/bookmarks/check/:propertyId
 */
exports.checkBookmark = (req, res) => {
  try {
    const userId = req.user.userId;
    const { propertyId } = req.params;

    const bookmark = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND property_id = ?').get(userId, propertyId);

    res.json({
      success: true,
      bookmarked: !!bookmark
    });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({ error: 'Failed to check bookmark' });
  }
};
