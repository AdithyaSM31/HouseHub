/**
 * Message Routes
 * Routes for messaging between users
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { messageController } = require('../controllers');
const {
  sendMessage,
  getConversationMessages,
  getConversations,
  getUnreadCount
} = messageController;

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
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('content').notEmpty().withMessage('Message cannot be empty'),
    body('propertyId').optional(),
    validate
  ],
  sendMessage
);

module.exports = router;
