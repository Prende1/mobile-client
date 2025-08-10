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
import { Ionicons } from "@expo/vector-icons";
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
    // console.log("Back button pressed");
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
          <ActivityIndicator size="small" color="#06B6D4" />
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
                <Text style={[
                  styles.answerAuthor,
                  answerItem.answered_by === currentUsername && styles.currentUserAnswer
                ]}>
                  {answerItem.answered_by || 'Anonymous'}
                  {answerItem.answered_by === currentUsername && ' (You)'}
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

  if (loading && !question) {
    return (
      <SafeAreaView style={styles.container}>
        {/* <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </View> */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
      </View> */}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Content */}
        <View style={styles.content}>
          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.sectionTitle}>Question</Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>
                {question.question || "No question available"}
              </Text>
            </View>
          </View>

          {/* Text Area - Only show before submission */}
          {!hasSubmitted && (
            <View style={styles.textAreaContainer}>
              <Text style={styles.sectionTitle}>Your Answer</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="Type your answer here...(If answered, try to give another answer to the same question)"
                  placeholderTextColor="#6b7280"
                  multiline={true}
                  textAlignVertical="top"
                  style={styles.textArea}
                  editable={!loading}
                />
              </View>
            </View>
          )}

          {/* Answers Section - Only shown after submission */}
          {renderAnswers()}
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBack}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Back to Questions</Text>
        </TouchableOpacity>
        
        {!hasSubmitted ? (
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[
              styles.primaryButton,
              loading && styles.disabledButton
            ]}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={handleNext} 
            style={[
              styles.primaryButton,
              loading && styles.disabledButton
            ]}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
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
    backgroundColor: '#1e293b',
  },
  // header: {
  //   backgroundColor: "#06B6D4",
  //   paddingVertical: 15,
  //   paddingHorizontal: 10,
  //   borderBottomLeftRadius: 25,
  //   borderBottomRightRadius: 25,
  // },
  // backButton: { 
  //   padding: 5 
  // },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 24,
  },
  textAreaContainer: {
    marginBottom: 24,
  },
  textAreaWrapper: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
  },
  textArea: {
    backgroundColor: "transparent",
    padding: 12,
    fontSize: 16,
    color: "#111827",
    minHeight: 120,
    maxHeight: 200,
  },
  // Answer styles
  answersContainer: {
    marginTop: 20,
  },
  answersTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  answerItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
    color: "#111827",
  },
  currentUserAnswer: {
    color: "#06B6D4",
  },
  answerDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  answerText: {
    fontSize: 16,
    color: "#111827",
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
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  rejectedStatus: {
    backgroundColor: "#fecaca",
    color: "#991b1b",
  },
  pendingStatus: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  noAnswersContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  noAnswersText: {
    fontSize: 16,
    color: "#6b7280",
    fontStyle: 'italic',
    textAlign: 'center',
  },
  answersLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 34,
    paddingTop: 16,
    gap: 12,
    backgroundColor: "#1e293b",
  },
  secondaryButton: {
    backgroundColor: "#475569",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  primaryButton: {
    backgroundColor: "#06B6D4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    shadowColor: "#06B6D4",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  disabledButton: {
    backgroundColor: "#64748b",
  },
});

export default QuestionsScreen;