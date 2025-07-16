import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import API_ROUTES from "../api/apiConfig";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setCurrentQuizId , setQuiz } from "@/redux/quiz/quiz";
import QuizStartScreen from "../components/Quiz/StartCard";

const PastQuizQuestions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = useSelector((state) => state.auth.user?._id);
  const router = useRouter();
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  
  console.log("User ID:", userId);

  const getQuestionList = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ROUTES.getRecentQuizAttempts(userId), {
        method: "GET",
      });
      const data = await response.json();

      // Check if data is an array, otherwise set empty array
      if (Array.isArray(data)) {
        setRecentQuestions(data);
      } else {
        // Handle case where API returns {message: "No questions found"} or other non-array response
        console.log("API Response:", data);
        setRecentQuestions([]);
      }

      console.log("Fetched Questions:", data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setRecentQuestions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (userId) {
      getQuestionList();
    }
  }, [userId]);

  const handleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleStartQuiz = async (difficulty) => {
    console.log("Selected difficulty:", difficulty);
    setModalVisible(false);
    
    try {
      setLoading(true);
      const response = await fetch(API_ROUTES.startQuizSession, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, difficulty }),
      });
      
      const data = await response.json();
      console.log("Start Quiz Response:", data);
      
      // Assuming the response contains a quiz ID
      if (data.quizId || data._id) {
        const quizId = data.quizId || data._id;
        dispatch(setCurrentQuizId(quizId));
        dispatch(setQuiz(data))
        router.push("QuizScreen");
      } else {
        console.error("No quiz ID returned from API");
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on search query
  const filteredQuestions = recentQuestions.filter((item) =>
    item.questionTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderQuizItem = (item, index) => (
    <View key={`${item.attemptID}-${index}`} style={styles.quizItem}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{item.questionTitle}</Text>
        <View style={styles.iconContainer}>
          <Icon
            name={item.correct ? "check" : "close"}
            size={24}
            color={item.correct ? "#4CAF50" : "#F44336"}
          />
        </View>
      </View>
      <Text style={styles.selectedText}>
        Status: {item.correct ? "Correct" : "Incorrect"}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#666" />
          <Text style={styles.loadingText}>Loading quiz questions...</Text>
        </View>
      );
    }

    if (recentQuestions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="quiz" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No quiz attempts found</Text>
          <Text style={styles.emptySubText}>
            Complete some quizzes to see your past attempts here
          </Text>
        </View>
      );
    }

    if (filteredQuestions.length === 0 && searchQuery.length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No matching questions found</Text>
          <Text style={styles.emptySubText}>
            Try adjusting your search terms
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredQuestions.map((item, index) => renderQuizItem(item, index))}
      </ScrollView>
    );
  };

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Past Quiz Questions</Text>
          <TouchableOpacity onPress={getQuestionList} disabled={loading}>
            <Icon name="refresh" size={24} color={loading ? "#ccc" : "#666"} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search questions"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Icon name="clear" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results Count */}
        {!loading && recentQuestions.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {searchQuery.length > 0
                ? `${filteredQuestions.length} of ${recentQuestions.length} questions`
                : `${recentQuestions.length} total questions`}
            </Text>
          </View>
        )}

        {/* Content */}
        {renderContent()}
        
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.startAnsweringButton}
            onPress={handleModal}
          >
            <Text style={styles.startAnsweringButtonText}>Start Answering</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <QuizStartScreen
              onStartQuiz={handleStartQuiz}
              title="New Quiz"
              onClose={handleModal}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  backButton: { padding: 5 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    fontFamily: "Lexend",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  quizItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    padding: 4,
  },
  selectedText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    fontWeight: "600",
    marginBottom: 4,
  },
  bottomContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  startAnsweringButton: {
    backgroundColor: "#20c997",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  startAnsweringButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Lexend",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default PastQuizQuestions;