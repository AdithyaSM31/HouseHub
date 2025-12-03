/**
 * API Service for Messages
 */

import { messagesAPI } from './api';

export const messageService = {
  // Get all conversations
  getConversations: async () => {
    return await messagesAPI.getConversations();
  },

  // Get conversation with specific user
  getConversation: async (userId) => {
    return await messagesAPI.getConversation(userId);
  },

  // Send message
  sendMessage: async (data) => {
    return await messagesAPI.send(data);
  },

  // Get unread count
  getUnreadCount: async () => {
    return await messagesAPI.getUnreadCount();
  }
};
