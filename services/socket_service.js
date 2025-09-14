// services/socket_service.js
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
        console.log("Auth token", token);
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

  // === CALL MANAGEMENT METHODS ===

  // Initiate a call
  initiateCall(recipientId, topic) {
    if (this.socket && this.isConnected) {
      const callId = this.generateCallId();
      this.socket.emit('initiate_call', {
        recipientId,
        topic,
        callId
      });
      return callId;
    }
    return null;
  }

  // Send call request
  sendCallRequest(recipientId, topic, callId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('call_request', {
        recipientId,
        topic,
        callId
      });
    }
  }

  // Accept call
  acceptCall(callId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('accept_call', { callId });
    }
  }

  // Decline call
  declineCall(callId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('decline_call', { callId });
    }
  }

  // End call
  endCall(callId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('end_call', { callId });
    }
  }

  // Send speaker change notification
  sendSpeakerChange(callId, speakerId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('speaker_change', { callId, speakerId });
    }
  }

  // === WEBRTC SIGNALING METHODS ===

  // Send WebRTC offer
  sendWebRTCOffer(recipientId, offer, callId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('webrtc_offer', {
        to: recipientId,
        offer,
        callId
      });
    }
  }

  // Send WebRTC answer
  sendWebRTCAnswer(recipientId, answer, callId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('webrtc_answer', {
        to: recipientId,
        answer,
        callId
      });
    }
  }

  // Send ICE candidate
  sendWebRTCIceCandidate(recipientId, candidate, callId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('webrtc_ice_candidate', {
        to: recipientId,
        candidate,
        callId
      });
    }
  }

  // === EVENT LISTENERS ===

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

  // === CALL EVENT LISTENERS ===

  // Listen for call requests
  onCallRequest(callback) {
    if (this.socket) {
      this.socket.on('call_request', callback);
      this.listeners.set('call_request', callback);
    }
  }

  // Listen for call accepted
  onCallAccepted(callback) {
    if (this.socket) {
      this.socket.on('call_accepted', callback);
      this.listeners.set('call_accepted', callback);
    }
  }

  // Listen for call declined
  onCallDeclined(callback) {
    if (this.socket) {
      this.socket.on('call_declined', callback);
      this.listeners.set('call_declined', callback);
    }
  }

  // Listen for call ended
  onCallEnded(callback) {
    if (this.socket) {
      this.socket.on('call_ended', callback);
      this.listeners.set('call_ended', callback);
    }
  }

  // Listen for speaker changes
  onSpeakerChange(callback) {
    if (this.socket) {
      this.socket.on('speaker_change', callback);
      this.listeners.set('speaker_change', callback);
    }
  }

  // === WEBRTC EVENT LISTENERS ===

  // Listen for WebRTC offers
  onWebRTCOffer(callback) {
    if (this.socket) {
      this.socket.on('webrtc_offer', callback);
      this.listeners.set('webrtc_offer', callback);
    }
  }

  // Listen for WebRTC answers
  onWebRTCAnswer(callback) {
    if (this.socket) {
      this.socket.on('webrtc_answer', callback);
      this.listeners.set('webrtc_answer', callback);
    }
  }

  // Listen for ICE candidates
  onWebRTCIceCandidate(callback) {
    if (this.socket) {
      this.socket.on('webrtc_ice_candidate', callback);
      this.listeners.set('webrtc_ice_candidate', callback);
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

  // === UTILITY METHODS ===

  // Generate room ID (same logic as backend)
  generateRoomId(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }

  // Generate call ID
  generateCallId() {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export default new SocketService();