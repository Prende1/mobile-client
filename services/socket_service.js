// services/SocketService.js
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Initialize socket connection
  async connect() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log("AUth token", token);
        throw new Error('No authentication token found');
      }

      // Replace with your backend URL
      const SOCKET_URL = 'https://vocab-server-fkrv.onrender.com';

      this.socket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.isConnected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
      });

      return this.socket;
    } catch (error) {
      console.error('Socket connection error:', error);
      throw error;
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Join a chat room
  joinChat(recipientId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', { recipientId });
    }
  }

  // Send a message
  sendMessage(recipientId, message, messageType = 'text') {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        recipientId,
        message,
        messageType
      });
    }
  }

  // Mark messages as read
  markMessagesRead(chatRoom) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_messages_read', { chatRoom });
    }
  }

  // Send typing indicator
  sendTyping(recipientId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { recipientId, isTyping });
    }
  }

  // Get chat history
  getChatHistory(recipientId, page = 1, limit = 50) {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_chat_history', { recipientId, page, limit });
    }
  }

  // Listen for new messages
  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
      this.listeners.set('receive_message', callback);
    }
  }

  // Listen for chat history
  onChatHistory(callback) {
    if (this.socket) {
      this.socket.on('chat_history', callback);
      this.listeners.set('chat_history', callback);
    }
  }

  // Listen for typing indicators
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
      this.listeners.set('user_typing', callback);
    }
  }

  // Listen for message read status
  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on('messages_read', callback);
      this.listeners.set('messages_read', callback);
    }
  }

  // Listen for online users
  onUsersOnline(callback) {
    if (this.socket) {
      this.socket.on('users_online', callback);
      this.listeners.set('users_online', callback);
    }
  }

  // Listen for message notifications
  onNewMessageNotification(callback) {
    if (this.socket) {
      this.socket.on('new_message_notification', callback);
      this.listeners.set('new_message_notification', callback);
    }
  }

  // Remove specific listener
  removeListener(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  // Generate room ID (same logic as backend)
  generateRoomId(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }
}

// Export singleton instance
export default new SocketService();