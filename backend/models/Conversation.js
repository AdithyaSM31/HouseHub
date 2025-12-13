/**
 * Conversation Model
 * Mongoose schema for message conversations
 */

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  user1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  last_message_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for efficient conversation lookups
conversationSchema.index({ user1_id: 1, user2_id: 1 });
conversationSchema.index({ user2_id: 1, user1_id: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
