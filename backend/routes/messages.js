/**
 * Message Routes
 * Routes for messaging between users
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const {
  sendMessage,
  getConversationMessages,
  getConversations,
  getUnreadCount
} = require('../controllers/messageController');

// Get all conversations (protected)
router.get('/conversations', authenticateUser, getConversations);

// Get unread message count (protected)
router.get('/unread', authenticateUser, getUnreadCount);

// Get conversation with specific user (protected)
router.get('/conversation/:userId', authenticateUser, getConversationMessages);

// Send message (protected)
router.post(
  '/',
  [
    authenticateUser,
    body('receiverId').isInt().withMessage('Valid receiver ID is required'),
    body('message').notEmpty().withMessage('Message cannot be empty'),
    body('propertyId').optional().isInt().withMessage('Property ID must be a number'),
    validate
  ],
  sendMessage
);

module.exports = router;
