import { useState , useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import API_ROUTES from '../api/apiConfig';
import { useSelector } from 'react-redux';

// Menu Icon Component
const MenuIcon = () => (
  <View style={styles.menuIcon}>
    <View style={styles.menuLine} />
    <View style={styles.menuLine} />
    <View style={styles.menuLine} />
  </View>
);

const Discussion = () => {
  const [users, setUsers] = useState([]);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    getAllUsers();
  }, []);

  const getAllUsers = async () => {
    try {
      const response = await fetch(API_ROUTES.getAllUsers, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data);
      console.log('Fetched users:', data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Map users as individual chat conversations
  const chatList = users.map((user, index) => ({
    id: user._id,
    name: user.username,
    lastMessage: "Start a conversation...",
    avatar: user.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    level: user.level,
    isOnline: Math.random() > 0.5, // Random online status for demo
    timestamp: "now",
    user: user
  }));

  const handleChatPress = (chat) => {
    console.log('Selected chat with:', chat.name);
    console.log('User data:', chat.user);
    // Add your navigation to chat screen logic here
  };

  const handleStartNewChat = () => {
    console.log('Start new chat pressed');
    // Add your start new chat logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity>
          <MenuIcon />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {chatList.length > 0 ? (
          chatList.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => handleChatPress(chat)}
              activeOpacity={0.7}
            >
              {/* Avatar with Online Indicator */}
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: chat.avatar }}
                  style={styles.avatar}
                />
                {chat.isOnline && <View style={styles.onlineIndicator} />}
              </View>

              {/* Content */}
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName} numberOfLines={1}>
                    {chat.name}
                  </Text>
                  <Text style={styles.timestamp}>{chat.timestamp}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
                <Text style={styles.userLevel} numberOfLines={1}>
                  {chat.level}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No chats available</Text>
            <Text style={styles.emptyStateSubtext}>Loading users...</Text>
          </View>
        )}
      </ScrollView>

      {/* New Chat Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartNewChat}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>New Chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  menuIcon: {
    width: 24,
    height: 24,
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  menuLine: {
    height: 2,
    backgroundColor: '#6b7280',
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  chatContent: {
    flex: 1,
    minWidth: 0,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default Discussion;