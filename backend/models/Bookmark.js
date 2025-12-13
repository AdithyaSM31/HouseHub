/**
 * Bookmark Model
 * Mongoose schema for saved properties
 */

const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound unique index to prevent duplicate bookmarks
bookmarkSchema.index({ user_id: 1, property_id: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
