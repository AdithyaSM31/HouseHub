/**
 * User Model
 * Mongoose schema for user accounts
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  display_name: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    default: null
  },
  profile_image_url: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('User', userSchema);
