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

const AddQuestionModal = ({ visible, onClose, wordId, onQuestionAdded }) => {
  const [question, setQuestion] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [reviewedBy, setReviewedBy] = useState('AI');
  const [loading, setLoading] = useState(false);
  const name = useSelector((state)=> state.auth.user?.username);

  const resetForm = () => {
    setQuestion('');
    setCreatedBy('');
    setReviewedBy('AI');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Validation
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(API_ROUTES.createWordQuestion, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordID: wordId,
          question: question.trim(),
          created_by: name,
          reviewed_by: reviewedBy.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success', 
          'Question added successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                onClose();
                if (onQuestionAdded) {
                  onQuestionAdded(); // Refresh the questions list
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
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
              <Text style={styles.headerTitle}>Ask a Question</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Question Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Question *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="What would you like to know about this word?"
                  placeholderTextColor="#9ca3af"
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>


              {/* Reviewed By Input */}
              {/* <View style={styles.inputGroup}>
                <Text style={styles.label}>Reviewed By</Text>
                <View style={styles.reviewedByContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Who will review this question?"
                    placeholderTextColor="#9ca3af"
                    value={reviewedBy}
                    onChangeText={setReviewedBy}
                  />
                  <Text style={styles.helperText}>
                    Default: AI (can be changed to specific reviewer)
                  </Text>
                </View>
              </View> */}

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
                  {loading ? 'Adding...' : 'Add Question'}
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
    minHeight: '60%',
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
  textArea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
  },
  reviewedByContainer: {
    gap: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
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

export default AddQuestionModal;