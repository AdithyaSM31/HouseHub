import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import { messageService } from '../../services/messageService';
import { formatRelativeTime } from '../../utils/helpers';
import styles from './Messages.module.css';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [newConversationUser, setNewConversationUser] = useState(null);

  useEffect(() => {
    fetchConversations();
    
    // Check if starting new conversation with a user
    const userId = searchParams.get('userId');
    const propertyId = searchParams.get('propertyId');
    if (userId) {
      startNewConversation(userId, propertyId);
    }
  }, [searchParams]);

  const fetchConversations = async () => {
    try {
      const response = await messageService.getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async (userId, propertyId) => {
    try {
      // Check if conversation already exists
      const existingConv = conversations.find(c => c.other_user_id === parseInt(userId));
      if (existingConv) {
        handleSelectConversation(existingConv);
        return;
      }

      // Fetch property details to get owner info
      if (propertyId) {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/properties/${propertyId}`);
        const data = await response.json();
        
        if (data.success && data.property) {
          setNewConversationUser({
            other_user_id: parseInt(userId),
            other_user_name: data.property.owner_name,
            other_user_image: data.property.owner_image,
            property_id: parseInt(propertyId),
            property_title: data.property.title
          });
          setSelectedConversation({
            other_user_id: parseInt(userId),
            other_user_name: data.property.owner_name,
            other_user_image: data.property.owner_image,
            property_id: parseInt(propertyId),
            property_title: data.property.title
          });
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const response = await messageService.getConversation(conversation.other_user_id);
      setMessages(response.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await messageService.sendMessage({
        receiverId: selectedConversation.other_user_id,
        content: newMessage,
        propertyId: selectedConversation.property_id
      });
      
      setNewMessage('');
      
      // If this was a new conversation, refresh the conversations list
      if (newConversationUser) {
        await fetchConversations();
        setNewConversationUser(null);
      }
      
      // Refresh messages
      const response = await messageService.getConversation(selectedConversation.other_user_id);
      setMessages(response.messages);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className={styles.messagesPage}>
      <div className={styles.container}>
        <div className={styles.conversationsList}>
          <h2 className={styles.listTitle}>Messages</h2>
          
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className="spinner"></div>
            </div>
          ) : conversations.length > 0 ? (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`${styles.conversationItem} ${selectedConversation?.id === conv.id ? styles.active : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className={styles.avatar}>
                  {conv.other_user_image ? (
                    <img src={conv.other_user_image} alt={conv.other_user_name} />
                  ) : (
                    <span>{conv.other_user_name?.charAt(0)}</span>
                  )}
                </div>
                <div className={styles.conversationInfo}>
                  <h3>{conv.other_user_name}</h3>
                  <p>{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span className={styles.unreadBadge}>{conv.unread_count}</span>
                )}
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No messages yet</p>
            </div>
          )}
        </div>

        <div className={styles.chatArea}>
          {selectedConversation ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.avatar}>
                  {selectedConversation.other_user_image ? (
                    <img src={selectedConversation.other_user_image} alt={selectedConversation.other_user_name} />
                  ) : (
                    <span>{selectedConversation.other_user_name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3>{selectedConversation.other_user_name}</h3>
                  {selectedConversation.property_title && (
                    <p>About: {selectedConversation.property_title}</p>
                  )}
                </div>
              </div>

              <div className={styles.messagesContainer}>
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${message.sender_id === selectedConversation.other_user_id ? styles.received : styles.sent}`}
                  >
                    <p>{message.message}</p>
                    <span className={styles.timestamp}>
                      {formatRelativeTime(message.created_at)}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className={styles.messageForm}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={styles.messageInput}
                />
                <button type="submit" className={styles.sendButton}>
                  <FiSend />
                </button>
              </form>
            </>
          ) : (
            <div className={styles.emptyChat}>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
