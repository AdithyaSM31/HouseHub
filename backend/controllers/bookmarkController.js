/**
 * Bookmark Controller (MongoDB)
 * Handles bookmark toggle and retrieval
 */

const { Bookmark, Property } = require('../models');

/**
 * Toggle bookmark for a property
 * POST /api/bookmarks/:propertyId
 */
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.userId;
    const propertyId = req.params.propertyId;

    // Check if bookmark exists
    const existingBookmark = await Bookmark.findOne({
      user_id: userId,
      property_id: propertyId
    });

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      return res.json({
        success: true,
        bookmarked: false,
        message: 'Bookmark removed'
      });
    } else {
      // Add bookmark
      await Bookmark.create({
        user_id: userId,
        property_id: propertyId
      });
      return res.json({
        success: true,
        bookmarked: true,
        message: 'Property bookmarked'
      });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
};

/**
 * Get user's bookmarked properties
 * GET /api/bookmarks
 */
exports.getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookmarks = await Bookmark.find({ user_id: userId })
      .populate({
        path: 'property_id',
        populate: {
          path: 'user_id',
          select: 'display_name phone_number email'
        }
      })
      .sort({ created_at: -1 })
      .lean();

    // Format properties
    const properties = bookmarks
      .filter(b => b.property_id) // Filter out null properties
      .map(bookmark => {
        const prop = bookmark.property_id;
        return {
          ...prop,
          id: prop._id,
          owner_id: prop.user_id._id,
          owner_name: prop.user_id.display_name,
          owner_phone: prop.user_id.phone_number,
          owner_email: prop.user_id.email,
          amenities: prop.amenities ? JSON.parse(prop.amenities) : [],
          bookmarked_at: bookmark.created_at
        };
      });

    res.json({
      success: true,
      count: properties.length,
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
exports.checkBookmark = async (req, res) => {
  try {
    const userId = req.user.userId;
    const propertyId = req.params.propertyId;

    const bookmark = await Bookmark.findOne({
      user_id: userId,
      property_id: propertyId
    });

    res.json({
      success: true,
      bookmarked: !!bookmark
    });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({ error: 'Failed to check bookmark' });
  }
};
