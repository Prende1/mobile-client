// screens/AudioDiscussion.js
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import WebRTCService from '../services/webRTCService';
import SocketService from '../services/socket_service';
import AudioAssessmentService from '../services/audioAssessmentService';

const AudioDiscussion = () => {
  const router = useRouter();
  const { callId, audioTopic, isInitiator } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);
  const recipient = useSelector((state) => state.auth.connectUser);
  

  const [callState, setCallState] = useState('waiting'); // waiting, connecting, active, ended
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [speakingTime, setSpeakingTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  
  const timerRef = useRef(null);
  const speakingTimerRef = useRef(null);
  const callTimerRef = useRef(null);
  const audioRecorderRef = useRef(null);
  
  const SPEAKING_TIME_LIMIT = 120; // 2 minutes in seconds

  useEffect(() => {
    initializeCall();
    setupCallListeners();

    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Request audio permissions
      await requestAudioPermissions();
      
      // Initialize WebRTC
      await WebRTCService.initialize();
      
      if (isInitiator === 'true') {
        setCallState('connecting');
      } else {
        setCallState('waiting');
      }

    } catch (error) {
      console.error('Error initializing call:', error);
      Alert.alert('Error', 'Failed to initialize call');
    }
  };

  const requestAudioPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Audio Permission',
          message: 'This app needs access to your microphone for voice calls',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Audio permission not granted');
      }
    }
  };

  const setupCallListeners = () => {
    // WebRTC call events
    WebRTCService.onCallConnected(() => {
      setCallState('active');
      startCallTimer();
      // First speaker starts (initiator goes first)
      if (isInitiator === 'true') {
        startSpeaking(user._id);
      }
    });

    WebRTCService.onCallEnded(() => {
      setCallState('ended');
      endCall();
    });

    // Socket events for call coordination
    SocketService.onCallAccepted((data) => {
      if (data.callId === callId) {
        WebRTCService.startCall(data.recipientId);
      }
    });

    SocketService.onCallDeclined((data) => {
      if (data.callId === callId) {
        Alert.alert('Call Declined', 'The other user declined the call');
        router.back();
      }
    });

    SocketService.onCallEnded((data) => {
      if (data.callId === callId) {
        endCall();
      }
    });

    SocketService.onSpeakerChange((data) => {
      if (data.callId === callId) {
        switchSpeaker(data.speakerId);
      }
    });
  };

  const startCall = async () => {
    try {
      setCallState('connecting');
      
      if (isInitiator === 'true') {
        // Send call request to recipient
        SocketService.sendCallRequest(recipient.id, audioTopic, callId);
      } else {
        // Accept the call
        SocketService.acceptCall(callId);
      }

    } catch (error) {
      console.error('Error starting call:', error);
      Alert.alert('Error', 'Failed to start call');
    }
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const startSpeaking = (speakerId) => {
    setCurrentSpeaker(speakerId);
    setSpeakingTime(SPEAKING_TIME_LIMIT);
    
    // Start recording if it's user's turn
    if (speakerId === user._id) {
      startRecording();
      WebRTCService.unmute();
      setIsMuted(false);
    } else {
      WebRTCService.mute();
      setIsMuted(true);
    }

    // Start speaking timer
    speakingTimerRef.current = setInterval(() => {
      setSpeakingTime(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          switchToNextSpeaker();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  const switchToNextSpeaker = () => {
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
    }

    // Stop recording if it was user's turn
    if (currentSpeaker === user._id) {
      stopRecording();
    }

    // Switch to the other person
    const nextSpeaker = currentSpeaker === user._id ? recipient.id : user._id;
    
    // Notify other user about speaker change
    SocketService.sendSpeakerChange(callId, nextSpeaker);
    
    startSpeaking(nextSpeaker);
  };

  const switchSpeaker = (speakerId) => {
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
    }
    
    if (currentSpeaker === user._id) {
      stopRecording();
    }
    
    startSpeaking(speakerId);
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      await AudioAssessmentService.startRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      const audioUri = await AudioAssessmentService.stopRecording();
      
      // Send audio for assessment
      const assessment = await AudioAssessmentService.assessAudio(audioUri);
      setAssessmentResult(assessment);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const endCall = () => {
    cleanup();
    setCallState('ended');
    
    // Show final assessment
    if (assessmentResult) {
      Alert.alert(
        'Call Assessment',
        `Fluency Score: ${assessmentResult.fluencyScore}/10\nClarity Score: ${assessmentResult.clarityScore}/10\nFeedback: ${assessmentResult.feedback}`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      setTimeout(() => router.back(), 2000);
    }
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end the discussion?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            SocketService.endCall(callId);
            endCall();
          }
        }
      ]
    );
  };

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    
    WebRTCService.endCall();
    AudioAssessmentService.cleanup();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaitingState = () => (
    <View style={styles.content}>
      <Text style={styles.topic}>Topic: {audioTopic}</Text>
      
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: recipient.image }}
            style={styles.avatar}
          />
        </View>
        
        <Text style={styles.name}>{recipient.username}</Text>
        <Text style={styles.location}>{recipient.level}</Text>
        <Text style={styles.status}>
          {isInitiator === 'true' ? 'Calling...' : 'Waiting to Respond'}
        </Text>
        
        <TouchableOpacity 
          style={styles.beginButton}
          onPress={startCall}
        >
          <Text style={styles.beginButtonText}>
            {isInitiator === 'true' ? 'Calling...' : 'Accept'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActiveCall = () => (
    <View style={styles.content}>
      <Text style={styles.topic}>Topic: {audioTopic}</Text>
      
      {/* Call Duration */}
      <View style={styles.callInfo}>
        <Text style={styles.callDuration}>
          Call Duration: {formatTime(callDuration)}
        </Text>
      </View>

      {/* Current Speaker Section */}
      <View style={styles.speakerSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: currentSpeaker === user._id ? user.image : recipient.image 
            }}
            style={[
              styles.avatar,
              isRecording && styles.recordingAvatar
            ]}
          />
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <Icon name="mic" size={20} color="#fff" />
            </View>
          )}
        </View>
        
        <Text style={styles.name}>
          {currentSpeaker === user._id ? user.username : recipient.username}
        </Text>
        
        <Text style={styles.speakingStatus}>
          {currentSpeaker === user._id ? 'You are speaking' : 'Listening...'}
        </Text>
        
        {/* Speaking Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>
            {formatTime(speakingTime)}
          </Text>
          <View style={styles.timerBar}>
            <View 
              style={[
                styles.timerProgress,
                { 
                  width: `${(speakingTime / SPEAKING_TIME_LIMIT) * 100}%`,
                  backgroundColor: speakingTime < 30 ? '#ef4444' : '#22c55e'
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Call Controls */}
      <View style={styles.callControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <Icon name="phone-off" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Assessment Display */}
      {assessmentResult && (
        <View style={styles.assessmentContainer}>
          <Text style={styles.assessmentTitle}>Your Last Turn Assessment:</Text>
          <Text style={styles.assessmentScore}>
            Fluency: {assessmentResult.fluencyScore}/10 | 
            Clarity: {assessmentResult.clarityScore}/10
          </Text>
        </View>
      )}
    </View>
  );

  const renderEndedCall = () => (
    <View style={styles.content}>
      <View style={styles.endedContainer}>
        <Icon name="phone-off" size={64} color="#6b7280" />
        <Text style={styles.endedTitle}>Discussion Ended</Text>
        <Text style={styles.endedSubtitle}>
          Total Duration: {formatTime(callDuration)}
        </Text>
        
        {assessmentResult && (
          <View style={styles.finalAssessment}>
            <Text style={styles.assessmentTitle}>Final Assessment:</Text>
            <Text style={styles.assessmentScore}>
              Fluency Score: {assessmentResult.fluencyScore}/10
            </Text>
            <Text style={styles.assessmentScore}>
              Clarity Score: {assessmentResult.clarityScore}/10
            </Text>
            <Text style={styles.assessmentFeedback}>
              {assessmentResult.feedback}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (callState) {
      case 'waiting':
      case 'connecting':
        return renderWaitingState();
      case 'active':
        return renderActiveCall();
      case 'ended':
        return renderEndedCall();
      default:
        return renderWaitingState();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => {
            if (callState === 'active') {
              handleEndCall();
            } else {
              router.back();
            }
          }}
        >
          <Icon name="x" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
        <View style={styles.placeholder} />
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  topic: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
  },
  callInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  callDuration: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  profileSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  speakerSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5d5ae',
  },
  recordingAvatar: {
    borderWidth: 4,
    borderColor: '#ef4444',
  },
  recordingIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
  },
  speakingStatus: {
    fontSize: 18,
    color: '#4A90E2',
    marginBottom: 30,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  timerBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    borderRadius: 4,
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  endCallButton: {
    backgroundColor: '#ef4444',
  },
  beginButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  beginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  assessmentContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  assessmentScore: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  assessmentFeedback: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  endedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  endedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  endedSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
  },
  finalAssessment: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginTop: 20,
  },
});

export default AudioDiscussion;