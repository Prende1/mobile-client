// services/WebRTCService.js
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  MediaStreamTrack,
} from 'react-native-webrtc';
import SocketService from './socket_service';

class WebRTCService {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.isInitiator = false;
    this.currentCallId = null;
    this.listeners = new Map();
    
    // WebRTC configuration
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
  }

  async initialize() {
    try {
      // Request audio permissions and get local stream
      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.localStream = stream;
      this.setupSocketListeners();
      
      return true;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      throw error;
    }
  }

  setupSocketListeners() {
    // WebRTC signaling events
    SocketService.onWebRTCOffer(async (data) => {
      if (data.callId === this.currentCallId) {
        await this.handleOffer(data.offer, data.from);
      }
    });

    SocketService.onWebRTCAnswer(async (data) => {
      if (data.callId === this.currentCallId) {
        await this.handleAnswer(data.answer);
      }
    });

    SocketService.onWebRTCIceCandidate(async (data) => {
      if (data.callId === this.currentCallId) {
        await this.handleIceCandidate(data.candidate);
      }
    });
  }

  async startCall(recipientId, callId) {
    try {
      this.currentCallId = callId;
      this.isInitiator = true;
      
      await this.createPeerConnection(recipientId);
      
      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      // Create and send offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });

      await this.peerConnection.setLocalDescription(offer);
      
      SocketService.sendWebRTCOffer(recipientId, offer, callId);
      
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async acceptCall(callId, recipientId) {
    try {
      this.currentCallId = callId;
      this.isInitiator = false;
      
      await this.createPeerConnection(recipientId);
      
      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }
      
    } catch (error) {
      console.error('Error accepting call:', error);
      throw error;
    }
  }

  async createPeerConnection(recipientId) {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Handle ICE candidates
    this.peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        SocketService.sendWebRTCIceCandidate(
          recipientId,
          event.candidate,
          this.currentCallId
        );
      }
    });

    // Handle remote stream
    this.peerConnection.addEventListener('track', (event) => {
      console.log('Received remote track');
      this.remoteStream = event.streams[0];
      this.emit('remoteStream', this.remoteStream);
    });

    // Handle connection state changes
    this.peerConnection.addEventListener('connectionstatechange', () => {
      console.log('Connection state:', this.peerConnection.connectionState);
      
      switch (this.peerConnection.connectionState) {
        case 'connected':
          this.emit('callConnected');
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          this.emit('callEnded');
          break;
      }
    });

    // Handle ICE connection state changes
    this.peerConnection.addEventListener('iceconnectionstatechange', () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
    });
  }

  async handleOffer(offer, from) {
    try {
      if (!this.peerConnection) {
        console.error('PeerConnection not initialized');
        return;
      }

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await this.peerConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });

      await this.peerConnection.setLocalDescription(answer);
      
      SocketService.sendWebRTCAnswer(from, answer, this.currentCallId);
      
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(answer) {
    try {
      if (!this.peerConnection) {
        console.error('PeerConnection not initialized');
        return;
      }

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(candidate) {
    try {
      if (!this.peerConnection) {
        console.error('PeerConnection not initialized');
        return;
      }

      await this.peerConnection.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
      
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  mute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }
  }

  unmute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
    }
  }

  isMuted() {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      return audioTracks.length > 0 ? !audioTracks[0].enabled : true;
    }
    return true;
  }

  endCall() {
    try {
      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop();
        });
        this.localStream = null;
      }

      // Reset remote stream
      this.remoteStream = null;
      this.currentCallId = null;
      this.isInitiator = false;

      this.emit('callEnded');
      
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  // Event listener methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Convenience methods for event listeners
  onCallConnected(callback) {
    this.on('callConnected', callback);
  }

  onCallEnded(callback) {
    this.on('callEnded', callback);
  }

  onRemoteStream(callback) {
    this.on('remoteStream', callback);
  }
}

// Export singleton instance
export default new WebRTCService();