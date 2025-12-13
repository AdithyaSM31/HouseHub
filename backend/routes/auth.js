/**
 * Auth Routes
 * Routes for authentication and user management
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { authController } = require('../controllers');
const {
  register,
  login,
  getProfile,
  updateProfile
} = authController;

// Register new user
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('displayName').notEmpty().withMessage('Display name is required'),
    validate
  ],
  register
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

// Get current user profile (protected)
router.get('/profile', authenticateUser, getProfile);

// Update user profile (protected)
router.put(
  '/profile',
  [
    authenticateUser,
    body('displayName').optional().notEmpty().withMessage('Display name cannot be empty'),
    body('phoneNumber').optional().isString().withMessage('Invalid phone number'),
    validate
  ],
  updateProfile
);

module.exports = router;
