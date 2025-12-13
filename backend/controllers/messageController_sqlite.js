/**
 * Message Controller - SQLite Version
 */

const { db } = require('../config/database');

/**
 * Send message
 * POST /api/messages
 */
exports.sendMessage = (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, propertyId, content, message } = req.body;
    
    console.log('📨 Send message request:', {
      senderId,
      receiverId,
      receiverIdType: typeof receiverId,
      content,
      message,
      propertyId,
      body: req.body
    });
    
    const messageContent = content || message; // Accept both field names
    
    // Parse receiverId to integer
    const receiverIdInt = parseInt(receiverId);
    const propertyIdInt = propertyId ? parseInt(propertyId) : null;

    if (!messageContent || !messageContent.trim()) {
      console.log('❌ Validation failed: Empty message content');
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (!receiverIdInt || isNaN(receiverIdInt)) {
      console.log('❌ Validation failed: Invalid receiver ID:', receiverId);
      return res.status(400).json({ error: 'Valid receiver ID is required' });
    }
    
    console.log('✅ Validation passed. Looking for conversation...');

    // Check or create conversation - find by users, not property
    let conversation = db.prepare(`
      SELECT id FROM conversations 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `).get(senderId, receiverIdInt, receiverIdInt, senderId);

    console.log('🔍 Conversation lookup result:', conversation);

    if (!conversation) {
      console.log('📝 Creating new conversation...');
      const stmt = db.prepare('INSERT INTO conversations (property_id, user1_id, user2_id) VALUES (?, ?, ?)');
      const result = stmt.run(propertyIdInt, senderId, receiverIdInt);
      conversation = { id: result.lastInsertRowid };
      console.log('✅ New conversation created with ID:', conversation.id);
    } else {
      console.log('✅ Found existing conversation with ID:', conversation.id);
    }

    // Insert message
    console.log('💬 Inserting message into database...');
    const stmt = db.prepare('INSERT INTO messages (conversation_id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)');
    const result = stmt.run(conversation.id, senderId, receiverIdInt, messageContent);
    console.log('✅ Message inserted with ID:', result.lastInsertRowid);

    // Update conversation timestamp
    db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conversation.id);
    console.log('✅ Conversation timestamp updated');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
};

/**
 * Get all conversations for current user
 * GET /api/messages/conversations
 */
exports.getConversations = (req, res) => {
  try {
    const userId = req.user.userId;

    const query = `
      SELECT 
        c.*,
        CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END as other_user_id,
        CASE WHEN c.user1_id = ? THEN u2.display_name ELSE u1.display_name END as other_user_name,
        CASE WHEN c.user1_id = ? THEN u2.profile_image_url ELSE u1.profile_image_url END as other_user_image,
        p.title as property_title,
        (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND receiver_id = ? AND is_read = 0) as unread_count
      FROM conversations c
      LEFT JOIN users u1 ON c.user1_id = u1.id
      LEFT JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN properties p ON c.property_id = p.id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.last_message_at DESC
    `;

    const conversations = db.prepare(query).all(userId, userId, userId, userId, userId, userId);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

/**
 * Get messages in a conversation
 * GET /api/messages/conversation/:userId
 */
exports.getConversation = (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { userId: otherUserId } = req.params;

    // Get conversation
    const conversation = db.prepare(`
      SELECT id FROM conversations 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `).get(currentUserId, otherUserId, otherUserId, currentUserId);

    if (!conversation) {
      return res.json({
        success: true,
        messages: []
      });
    }

    // Get messages
    const messages = db.prepare(`
      SELECT m.*, 
        u.display_name as sender_name,
        u.profile_image_url as sender_image
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).all(conversation.id);

    // Mark messages as read
    db.prepare('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND receiver_id = ?').run(conversation.id, currentUserId);

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

/**
 * Get unread message count
 * GET /api/messages/unread
 */
exports.getUnreadCount = (req, res) => {
  try {
    const userId = req.user.userId;

    const result = db.prepare('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0').get(userId);

    res.json({
      success: true,
      count: result.count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};
