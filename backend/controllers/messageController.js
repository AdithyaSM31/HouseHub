/**
 * Message Controller (MongoDB)
 * Handles messaging and conversations
 */

const { Message, Conversation, User, Property } = require('../models');

/**
 * Send a message
 * POST /api/messages
 */
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, content, propertyId } = req.body;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      $or: [
        { user1_id: senderId, user2_id: receiverId },
        { user1_id: receiverId, user2_id: senderId }
      ]
    });

    if (!conversation) {
      conversation = await Conversation.create({
        user1_id: senderId,
        user2_id: receiverId,
        property_id: propertyId || null
      });
    }

    // Create message
    const message = await Message.create({
      conversation_id: conversation._id,
      sender_id: senderId,
      receiver_id: receiverId,
      content
    });

    // Update conversation last message time
    await Conversation.findByIdAndUpdate(conversation._id, {
      last_message_at: new Date()
    });

    // Populate sender details
    const populatedMessage = await Message.findById(message._id)
      .populate('sender_id', 'display_name profile_image_url')
      .lean();

    res.status(201).json({
      success: true,
      message: {
        ...populatedMessage,
        id: populatedMessage._id
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Get conversations for user
 * GET /api/messages/conversations
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      $or: [{ user1_id: userId }, { user2_id: userId }]
    })
      .populate('user1_id', 'display_name profile_image_url')
      .populate('user2_id', 'display_name profile_image_url')
      .populate('property_id', 'title images')
      .sort({ last_message_at: -1 })
      .lean();

    // Get last message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ conversation_id: conv._id })
          .sort({ created_at: -1 })
          .lean();

        const otherUser = conv.user1_id._id.toString() === userId ? conv.user2_id : conv.user1_id;

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          conversation_id: conv._id,
          receiver_id: userId,
          is_read: false
        });

        return {
          id: conv._id,
          otherUser: {
            id: otherUser._id,
            displayName: otherUser.display_name,
            profileImageUrl: otherUser.profile_image_url
          },
          property: conv.property_id ? {
            id: conv.property_id._id,
            title: conv.property_id.title,
            image: conv.property_id.images[0]
          } : null,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.created_at,
            senderId: lastMessage.sender_id
          } : null,
          unreadCount,
          lastMessageAt: conv.last_message_at
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithMessages
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
exports.getConversationMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;

    // Find conversation
    const conversation = await Conversation.findOne({
      $or: [
        { user1_id: currentUserId, user2_id: otherUserId },
        { user1_id: otherUserId, user2_id: currentUserId }
      ]
    }).populate('property_id', 'title images');

    if (!conversation) {
      return res.json({
        success: true,
        messages: [],
        property: null
      });
    }

    // Get messages
    const messages = await Message.find({ conversation_id: conversation._id })
      .populate('sender_id', 'display_name profile_image_url')
      .sort({ created_at: 1 })
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversation_id: conversation._id,
        receiver_id: currentUserId,
        is_read: false
      },
      { is_read: true }
    );

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      content: msg.content,
      senderId: msg.sender_id._id,
      senderName: msg.sender_id.display_name,
      senderImage: msg.sender_id.profile_image_url,
      createdAt: msg.created_at,
      isRead: msg.is_read
    }));

    res.json({
      success: true,
      messages: formattedMessages,
      property: conversation.property_id ? {
        id: conversation.property_id._id,
        title: conversation.property_id.title,
        image: conversation.property_id.images[0]
      } : null
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

/**
 * Get unread message count
 * GET /api/messages/unread
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const count = await Message.countDocuments({
      receiver_id: userId,
      is_read: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};
