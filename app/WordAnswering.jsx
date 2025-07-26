import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import API_ROUTES from "../api/apiConfig"; // Adjust the import path as necessary
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const QuestionsScreen = () => {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState(""); // Placeholder for the question text
  const [answers, setAnswers] = useState([]); // Store all answers
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false); // Track if user has submitted
  const { username: currentUsername } = useSelector((state) => state.auth.user);

  const getAllAnswers = async (wqID) => {
    setLoadingAnswers(true);
    try {
      const response = await fetch(API_ROUTES.getWordAnswers(wqID), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAnswers(data);
      } else {
        // Handle case where API returns {message: "No questions found"} or other non-array response
        console.log("API Response:", data);
        setAnswers([]);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
      Alert.alert('Error', 'Network error while fetching answers');
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleSubmit = async () => {
    console.log("Submitting answer:", answer);
    
    // Validation
    if (!answer.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }

    if (!currentUsername) { // Fixed variable name
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!question.wordID || !question._id) {
      Alert.alert('Error', 'Question data is incomplete');
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
          wordID: question.wordID,
          wqID: question._id,
          answer: answer.trim(),
          answered_by: currentUsername,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Success', 
          'Answer submitted successfully! Answer is reviewed by AI.'
        );
        setAnswer(''); // Clear the answer field after successful submission
        setHasSubmitted(true); // Mark as submitted
        
        // Fetch all answers after successful submission
        await getAllAnswers(question._id);
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

  const getQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.getRandomQuestion, {
        method: "GET",
      });
      const data = await res.json();
      console.log("Fetched question:", data);
      setQuestion(data);
      
      // Reset submission state when getting a new question
      setHasSubmitted(false);
      setAnswers([]); // Clear previous answers
    } catch (error) {
      console.error("Error fetching next question:", error);
      Alert.alert("Error", "Failed to fetch next question");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    await getQuestion();
  };

  useEffect(() => {
    getQuestion();
  }, []);

  const handleBack = () => {
    console.log("Back button pressed");
    router.back(); // Use router.back() for navigation
  };

  const renderAnswers = () => {
    // Only show answers if user has submitted an answer
    if (!hasSubmitted) {
      return null;
    }

    if (loadingAnswers) {
      return (
        <View style={styles.answersLoadingContainer}>
          <ActivityIndicator size="small" color="#7dd3c0" />
          <Text style={styles.loadingText}>Loading answers...</Text>
        </View>
      );
    }

    return (
      <View style={styles.answersContainer}>
        <Text style={styles.answersTitle}>All Answers ({answers.length})</Text>
        {answers.length === 0 ? (
          <View style={styles.noAnswersContainer}>
            <Text style={styles.noAnswersText}>No other answers yet. You're the first to answer!</Text>
          </View>
        ) : (
          answers.map((answerItem, index) => (
            <View key={index} style={styles.answerItem}>
              <View style={styles.answerHeader}>
                <Text style={styles.answerAuthor}>
                  {answerItem.answered_by || 'Anonymous'}
                </Text>
                {answerItem.createdAt && (
                  <Text style={styles.answerDate}>
                    {new Date(answerItem.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <Text style={styles.answerText}>{answerItem.answer}</Text>
              {answerItem.status && (
                <View style={styles.statusContainer}>
                  <Text style={[
                    styles.statusText,
                    answerItem.status === 'approved' && styles.approvedStatus,
                    answerItem.status === 'rejected' && styles.rejectedStatus,
                    answerItem.status === 'pending' && styles.pendingStatus,
                  ]}>
                    {answerItem.status.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Questions</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Content */}
        <View style={styles.content}>
          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {loading ? "Loading question..." : question.question || "No question available"}
            </Text>
          </View>

          {/* Text Area - Only show before submission */}
          {!hasSubmitted && (
            <View style={styles.textAreaContainer}>
              <TextInput
                value={answer}
                onChangeText={setAnswer}
                placeholder="Type your answer here...(If answered, try to give another answer to the same question)"
                placeholderTextColor="#999"
                multiline={true}
                textAlignVertical="top"
                style={styles.textArea}
                editable={!loading}
              />
            </View>
          )}

          {/* Answers Section - Only shown after submission */}
          {renderAnswers()}
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back to Questions</Text>
        </TouchableOpacity>
        
        {!hasSubmitted ? (
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[
              styles.submitButton,
              loading && styles.disabledButton
            ]}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={handleNext} 
            style={[
              styles.submitButton,
              loading && styles.disabledButton
            ]}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Loading...' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    lineHeight: 28,
  },
  textAreaContainer: {
    marginBottom: 32,
  },
  textArea: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#000",
    minHeight: 120,
    maxHeight: 200,
  },
  // Answer styles
  answersContainer: {
    marginTop: 20,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  answerItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#7dd3c0",
  },
  answerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  answerAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7dd3c0",
  },
  answerDate: {
    fontSize: 12,
    color: "#666",
  },
  answerText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 8,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  approvedStatus: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  rejectedStatus: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  pendingStatus: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  noAnswersContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noAnswersText: {
    fontSize: 16,
    color: "#666",
    fontStyle: 'italic',
  },
  answersLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 34, // Safe area padding for bottom
    paddingTop: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  backButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#7dd3c0",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7dd3c0",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default QuestionsScreen;