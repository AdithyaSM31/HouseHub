/**
 * Property Routes
 * Routes for property listing CRUD operations
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateUser, optionalAuth } = require('../middleware/auth');
const { propertyController } = require('../controllers');
const {
  createProperty,
  getAllProperties,
  getFeaturedProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getUserProperties
} = propertyController;

// Get featured properties (public)
router.get('/featured', getFeaturedProperties);

// Get user's own properties (protected)
router.get('/user/my-listings', authenticateUser, getUserProperties);

// Get all properties with search and filters (public)
router.get('/', getAllProperties);

// Get property by ID (public)
router.get('/:id', getPropertyById);

// Create property (protected)
router.post('/', authenticateUser, createProperty);

// Update property (protected)
router.put('/:id', authenticateUser, updateProperty);

// Delete property (protected)
router.delete('/:id', authenticateUser, deleteProperty);

module.exports = router;
