import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditProfileModal = ({ visible, userProfile, onClose, onSave }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const levelOptions = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // Initialize form with userProfile data when modal opens
  useEffect(() => {
    if (visible && userProfile) {
      setUsername(userProfile.username || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setLevel(userProfile.level || 'Beginner');
    }
  }, [visible, userProfile]);

  const resetForm = () => {
    if (userProfile) {
      setUsername(userProfile.username || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setLevel(userProfile.level || 'Beginner');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phone === '' || phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleSubmit = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    if (username.trim().length < 2) {
      Alert.alert('Error', 'Username must be at least 2 characters long');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (phone.trim() && !validatePhone(phone.trim())) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      
      const updatedProfile = {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        level: level,
      };

      await onSave(updatedProfile);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const LevelSelector = () => (
    <View style={styles.levelContainer}>
      <Text style={styles.label}>Learning Level *</Text>
      <View style={styles.levelOptions}>
        {levelOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.levelOption,
              level === option && styles.levelOptionSelected
            ]}
            onPress={() => setLevel(option)}
          >
            <Text style={[
              styles.levelOptionText,
              level === option && styles.levelOptionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.helperText}>
        Select your current learning level
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your username"
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
                <Text style={styles.helperText}>
                  Choose a unique username (minimum 2 characters)
                </Text>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.helperText}>
                  We'll use this for important account notifications
                </Text>
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your phone number (optional)"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <Text style={styles.helperText}>
                  Optional - for account recovery and notifications
                </Text>
              </View>

              {/* Level Selector */}
              <LevelSelector />

              {/* Info Section */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>📝 Profile Update Info:</Text>
                <Text style={styles.infoText}>• Changes will be saved to your account</Text>
                <Text style={styles.infoText}>• Username and email must be unique</Text>
                <Text style={styles.infoText}>• Phone number is optional but recommended</Text>
                <Text style={styles.infoText}>• Level helps us customize your experience</Text>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  levelContainer: {
    marginBottom: 20,
  },
  levelOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  levelOption: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  levelOptionSelected: {
    backgroundColor: '#06B6D4',
    borderColor: '#06B6D4',
  },
  levelOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  levelOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#06B6D4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default EditProfileModal;