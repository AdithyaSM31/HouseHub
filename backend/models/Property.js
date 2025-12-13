/**
 * Property Model
 * Mongoose schema for property listings
 */

const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  property_type: {
    type: String,
    required: true,
    enum: ['apartment', 'house', 'pg', 'hostel', 'room', 'villa']
  },
  listing_type: {
    type: String,
    required: true,
    enum: ['rent', 'pg']
  },
  price: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  bedrooms: {
    type: Number,
    default: null
  },
  bathrooms: {
    type: Number,
    default: null
  },
  area_sqft: {
    type: Number,
    default: null
  },
  furnishing_status: {
    type: String,
    enum: ['furnished', 'semi-furnished', 'unfurnished'],
    default: null
  },
  amenities: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  is_active: {
    type: Boolean,
    default: true
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  views_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Property', propertySchema);
