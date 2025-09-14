// screens/ChatScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import SocketService from "../services/socket_service";
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/Feather';
import { setAudioDiscussion } from "../redux/login/authSlice";
import { useDispatch } from "react-redux";

const ChatScreen = () => {
  const router = useRouter();
  const recipient = useSelector((state) => state.auth.connectUser);
  const { user, token } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recipientTyping, setRecipientTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatRoomId = SocketService.generateRoomId(user._id, recipient.id);

  useEffect(() => {
    initializeChat();
    setupSocketListeners();

    return () => {
      SocketService.removeAllListeners();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const initializeChat = async () => {
    try {
      // Connect to socket if not already connected
      if (!SocketService.isSocketConnected()) {
        await SocketService.connect();
      }

      // Join the chat room
      SocketService.joinChat(recipient.id);

      // Get chat history
      SocketService.getChatHistory(recipient.id);

      // Mark messages as read
      SocketService.markMessagesRead(chatRoomId);
    } catch (error) {
      console.error("Error initializing chat:", error);
      Alert.alert("Error", "Failed to initialize chat");
    }
  };

  const setupSocketListeners = () => {
    // Listen for new messages
    SocketService.onReceiveMessage((message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    // Listen for chat history
    SocketService.onChatHistory((data) => {
      setMessages(data.messages);
      setIsLoading(false);
      scrollToBottom();
    });

    // Listen for typing indicators
    SocketService.onUserTyping((data) => {
      if (data.userId === recipient.id) {
        setRecipientTyping(data.isTyping);
      }
    });

    // Listen for message read status
    SocketService.onMessagesRead((data) => {
      if (data.chatRoom === chatRoomId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId._id === user._id ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    // Listen for call requests
    SocketService.onCallRequest((data) => {
      Alert.alert(
        "Incoming Call",
        `${data.fromUser} wants to start a discussion`,
        [
          {
            text: "Decline",
            style: "cancel",
            onPress: () => SocketService.declineCall(data.callId)
          },
          {
            text: "Accept",
            onPress: () => {
              SocketService.acceptCall(data.callId);
              dispatch(setAudioDiscussion({
                callId: data.callId,
                topic: data.topic,
                isInitiator: false
              }));
              router.push("AudioDiscussion");
            }
          }
        ]
      );
    });
  };

  const sendMessage = () => {
    if (inputText.trim()) {
      const messageText = inputText.trim();
      setInputText("");

      // Send message via socket
      SocketService.sendMessage(recipient.id, messageText);

      // Stop typing indicator
      handleTyping(false);

      // Scroll to bottom
      scrollToBottom();
    }
  };

  const handleTyping = (typing) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      SocketService.sendTyping(recipient.id, typing);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        SocketService.sendTyping(recipient.id, false);
      }, 3000);
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);

    if (text.length > 0 && !isTyping) {
      handleTyping(true);
    } else if (text.length === 0 && isTyping) {
      handleTyping(false);
    }
  };

  const handleCall = () => {
    Alert.alert(
      "Start Discussion",
      "Would you like to start an audio discussion?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Call",
          onPress: () => {
            const topic = "The Impact of Social Media on Society"; // You can make this dynamic
            const callId = SocketService.initiateCall(recipient.id, topic);
            dispatch(setAudioDiscussion({ callId, topic, isInitiator: true }));
            router.push("AudioDiscussion");
          }
        }
      ]
    );
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId._id === user._id;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage
            ? styles.ownMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {!isOwnMessage && (
          <Image
            source={{ uri: item.senderId.image || recipient.avatar }}
            style={styles.messageAvatar}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.message}
          </Text>

          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>

            {isOwnMessage && (
              <View style={styles.messageStatus}>
                <Text style={styles.messageStatusText}>
                  {item.isRead ? "✓✓" : "✓"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!recipientTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <Image source={{ uri: recipient.image }} style={styles.messageAvatar} />
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>
            {recipient.username} is typing...
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Image source={{ uri: recipient.image }} style={styles.headerAvatar} />

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{recipient.username}</Text>
          <Text style={styles.headerStatus}>{recipient.level}</Text>
        </View>

        {/* Call Button */}
        <TouchableOpacity
          onPress={handleCall}
          style={styles.callButton}
        >
          <Icon name="phone" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        {renderTypingIndicator()}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              inputText.trim()
                ? styles.sendButtonActive
                : styles.sendButtonInactive,
            ]}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: "#3b82f6",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerStatus: {
    fontSize: 14,
    color: "#6b7280",
  },
  callButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-end",
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  ownMessageBubble: {
    backgroundColor: "#3b82f6",
    marginLeft: 50,
  },
  otherMessageBubble: {
    backgroundColor: "#f3f4f6",
    marginRight: 50,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: "#ffffff",
  },
  otherMessageText: {
    color: "#111827",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  ownMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherMessageTime: {
    color: "#9ca3af",
  },
  messageStatus: {
    marginLeft: 8,
  },
  messageStatusText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginLeft: 8,
  },
  typingText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 12,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonActive: {
    backgroundColor: "#3b82f6",
  },
  sendButtonInactive: {
    backgroundColor: "#d1d5db",
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ChatScreen;