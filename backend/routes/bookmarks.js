/**
 * Bookmark Routes
 * Routes for bookmark/save property functionality
 */

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  toggleBookmark,
  getBookmarks,
  checkBookmark
} = require('../controllers/bookmarkController');

// Get user's bookmarked properties (protected)
router.get('/', authenticateUser, getBookmarks);

// Toggle bookmark on a property (protected)
router.post('/:propertyId', authenticateUser, toggleBookmark);

// Check if property is bookmarked (protected)
router.get('/check/:propertyId', authenticateUser, checkBookmark);

module.exports = router;
