import React, { useState } from 'react';
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
import API_ROUTES from '../../api/apiConfig';
import { useSelector } from 'react-redux';

const AddAnswerModal = ({ visible, onClose, onAnswerAdded }) => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const username = useSelector((state) => state.auth.user?.username);
  const {currentWordId , currentQuestionId} = useSelector((state) => state.word);

  const resetForm = () => {
    setAnswer('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Validation
    if (!answer.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }

    if (!username) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(API_ROUTES.createWordAnswer, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordID: currentWordId,
          wqID: currentQuestionId,
          answer: answer.trim(),
          answered_by: username,
        }),
      });

      const data = await response.json();
      
      if (response.status === 400) {
        Alert.alert('Error', data.error || 'Failed to add answer');
        return;
      }
      
      if (response.ok) {
        Alert.alert(
          'Success', 
          'Answer submitted successfully! Answer is reviewed by AI.',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                onClose();
                if (onAnswerAdded) {
                  onAnswerAdded(); // Refresh the answers list
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', data.error || data.message || 'Failed to add answer');
      }
    } catch (error) {
      console.error('Error adding answer:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <Text style={styles.headerTitle}>Add Your Answer</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Answer Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Answer *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Share your knowledge and help others understand this word better..."
                  placeholderTextColor="#9ca3af"
                  value={answer}
                  onChangeText={setAnswer}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <Text style={styles.helperText}>
                  Provide a clear, helpful explanation. Our AI will review and score your answer.
                </Text>
              </View>

              {/* User Info Display */}
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Submitted by:</Text>
                <Text style={styles.infoValue}>{username || 'Unknown User'}</Text>
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Will be reviewed by:</Text>
                <Text style={styles.infoValue}>AI (Gemini-2.0)</Text>
              </View>

              {/* Tips Section */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Tips for a great answer:</Text>
                <Text style={styles.tipText}>• Be clear and concise</Text>
                <Text style={styles.tipText}>• Include examples when helpful</Text>
                <Text style={styles.tipText}>• Use appropriate language for your audience</Text>
                <Text style={styles.tipText}>• Check your grammar and spelling</Text>
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
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Submitting...' : 'Submit Answer'}
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
    minHeight: '70%',
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
  textArea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  infoGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#0369a1',
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
  submitButton: {
    flex: 1,
    backgroundColor: '#06B6D4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AddAnswerModal;