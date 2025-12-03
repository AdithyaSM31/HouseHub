/**
 * Message Controller
 * Handles messaging between users
 */

const { pool } = require('../config/database');

/**
 * Send a message
 * POST /api/messages
 */
const sendMessage = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { receiverId, propertyId, message } = req.body;
    const senderId = req.user.id;

    // Check if receiver exists
    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [receiverId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Insert message
    const [result] = await connection.query(
      `INSERT INTO messages (sender_id, receiver_id, property_id, message)
       VALUES (?, ?, ?, ?)`,
      [senderId, receiverId, propertyId || null, message]
    );

    const messageId = result.insertId;

    // Create or update conversation
    const user1Id = Math.min(senderId, receiverId);
    const user2Id = Math.max(senderId, receiverId);

    await connection.query(
      `INSERT INTO conversations (user1_id, user2_id, property_id, last_message_id)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE last_message_id = ?, updated_at = CURRENT_TIMESTAMP`,
      [user1Id, user2Id, propertyId || null, messageId, messageId]
    );

    await connection.commit();

    // Get the created message
    const [messages] = await connection.query(
      `SELECT m.*, 
        s.display_name as sender_name,
        s.profile_image_url as sender_image,
        r.display_name as receiver_name,
        r.profile_image_url as receiver_image
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE m.id = ?`,
      [messageId]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: messages[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Get conversation between two users
 * GET /api/messages/conversation/:userId
 */
const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total 
       FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)`,
      [currentUserId, otherUserId, otherUserId, currentUserId]
    );
    const total = countResult[0].total;

    // Get messages
    const offset = (page - 1) * limit;
    const [messages] = await pool.query(
      `SELECT m.*, 
        s.display_name as sender_name,
        s.profile_image_url as sender_image,
        r.display_name as receiver_name,
        r.profile_image_url as receiver_image
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [currentUserId, otherUserId, otherUserId, currentUserId, parseInt(limit), parseInt(offset)]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE messages 
       SET is_read = TRUE 
       WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE`,
      [currentUserId, otherUserId]
    );

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: error.message
    });
  }
};

/**
 * Get all conversations for current user
 * GET /api/messages/conversations
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [conversations] = await pool.query(
      `SELECT 
        c.*,
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id 
          ELSE c.user1_id 
        END as other_user_id,
        CASE 
          WHEN c.user1_id = ? THEN u2.display_name 
          ELSE u1.display_name 
        END as other_user_name,
        CASE 
          WHEN c.user1_id = ? THEN u2.profile_image_url 
          ELSE u1.profile_image_url 
        END as other_user_image,
        m.message as last_message,
        m.sender_id as last_message_sender_id,
        m.created_at as last_message_time,
        p.title as property_title,
        (SELECT COUNT(*) 
         FROM messages 
         WHERE receiver_id = ? 
           AND sender_id = CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END
           AND is_read = FALSE
        ) as unread_count
       FROM conversations c
       JOIN users u1 ON c.user1_id = u1.id
       JOIN users u2 ON c.user2_id = u2.id
       LEFT JOIN messages m ON c.last_message_id = m.id
       LEFT JOIN properties p ON c.property_id = p.id
       WHERE c.user1_id = ? OR c.user2_id = ?
       ORDER BY c.updated_at DESC`,
      [userId, userId, userId, userId, userId, userId, userId]
    );

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
};

/**
 * Get unread message count
 * GET /api/messages/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
      [userId]
    );

    res.status(200).json({
      success: true,
      count: result[0].count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

/**
 * Mark conversation as read
 * PUT /api/messages/mark-read/:userId
 */
const markAsRead = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.id;

    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE receiver_id = ? AND sender_id = ?',
      [currentUserId, otherUserId]
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  markAsRead
};
