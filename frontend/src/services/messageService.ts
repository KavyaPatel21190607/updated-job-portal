import api from './api';

export interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  receiver: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  content: string;
  encryptedForSender?: string;
  encryptedForReceiver?: string;
  encrypted?: boolean;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    role?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

const messageService = {
  /**
   * Get all conversations
   */
  getAllConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/messages/conversations');
    return response.data.data;
  },

  /**
   * Get conversation with specific user
   */
  getConversation: async (userId: string): Promise<Message[]> => {
    const response = await api.get(`/messages/conversation/${userId}`);
    return response.data.data;
  },

  /**
   * Send a message
   */
  sendMessage: async (receiverId: string, content: string, encrypted: boolean = false, encryptedForSender?: string, encryptedForReceiver?: string): Promise<Message> => {
    const response = await api.post('/messages', {
      receiverId,
      content,
      encrypted,
      encryptedForSender,
      encryptedForReceiver,
    });
    return response.data.data;
  },

  /**
   * Mark message as read
   */
  markAsRead: async (messageId: string): Promise<void> => {
    await api.patch(`/messages/${messageId}/read`);
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/messages/unread-count');
    return response.data.data;
  },
};

export default messageService;
