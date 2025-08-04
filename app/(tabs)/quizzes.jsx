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
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import API_ROUTES from "../../api/apiConfig";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setCurrentQuizId , setQuiz } from "@/redux/quiz/quiz";
import QuizStartScreen from "../../components/Quiz/StartCard";

const Quizzes = () => {
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
    <View key={`${item.attemptID}-${index}`} style={styles.quizCard}>
      <View style={styles.quizContent}>
        <View style={styles.quizLeft}>
          <Text style={styles.quizTitle}>{item.questionTitle}</Text>
          <Text style={styles.statusText}>
            Status: {item.correct ? "Correct" : "Incorrect"}
          </Text>
        </View>
        
        <View style={styles.quizRight}>
          <View style={styles.statusContainer}>
            <Ionicons
              name={item.correct ? "checkmark-circle" : "close-circle"}
              size={24}
              color={item.correct ? "#4CAF50" : "#F44336"}
            />
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        
        <ScrollView style={styles.content}>
          {/* Title and Search Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Past Quiz Questions ({recentQuestions.length})</Text>
            

            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search questions"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#9ca3af"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Results Count */}
            {recentQuestions.length > 0 && (
              <Text style={styles.resultsText}>
                {searchQuery.length > 0
                  ? `${filteredQuestions.length} of ${recentQuestions.length} questions`
                  : `${recentQuestions.length} total questions`}
              </Text>
            )}
            
            {/* Quiz List */}
            <View style={styles.quizList}>
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((item, index) => renderQuizItem(item, index))
              ) : recentQuestions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No quiz attempts found</Text>
                  <TouchableOpacity style={styles.emptyButton} onPress={handleModal}>
                    <Text style={styles.emptyButtonText}>Start your first quiz!</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No matching questions found</Text>
                  <Text style={styles.emptySubText}>Try adjusting your search terms</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
        
        {/* Bottom Start Quiz Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.startQuizButton} onPress={handleModal}>
            <Text style={styles.startQuizButtonText}>Start New Quiz</Text>
            <Ionicons name="play" size={20} color="white" style={styles.playIcon} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
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
    backgroundColor: '#1e293b',
    paddingBottom: 70,
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
  content: {
    flex: 1,
    paddingBottom: 90, // Add padding to prevent content from being hidden behind bottom button
  },
  titleSection: {
    padding: 16,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#475569',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
  },
  plusIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: 'white',
  },
  clearButton: {
    padding: 4,
  },
  resultsText: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  quizList: {
    gap: 12,
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  quizContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quizLeft: {
    flex: 1,
    marginRight: 16,
  },
  quizTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  quizRight: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptySubText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  bottomContainer: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  startQuizButton: {
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06B6D4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startQuizButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  playIcon: {
    marginLeft: 4,
  },
});

export default Quizzes;