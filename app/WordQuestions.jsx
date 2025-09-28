import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import API_ROUTES from "../api/apiConfig";
import { useRouter } from 'expo-router';
import AddQuestionModal from '../components/Words/AddQuestionModal';
import { useDispatch } from "react-redux";
import { setCurrentQuestionId } from "@/redux/word/word";

const WordQuestions = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { currentWordId } = useSelector((state) => state.word);
  // Get current user information from Redux state
  // Adjust this selector based on your actual Redux state structure
  const { username: currentUsername } = useSelector((state) => state.auth.user);

  console.log("Current Word ID:", currentWordId);
  console.log("Current Username:", currentUsername);
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);
  const dispatch = useDispatch();

  const getQuestionList = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ROUTES.getQuestions(currentWordId), {
        method: 'GET',
      });
      const data = await response.json();
      
      // Check if data is an array, otherwise set empty array
      if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        // Handle case where API returns {message: "No questions found"} or other non-array response
        console.log("API Response:", data);
        setQuestions([]);
      }
      
      console.log("Fetched Questions:", data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (currentWordId) {
      getQuestionList();
    }
  }, [currentWordId]);

  // Helper function to get display name for created_by and reviewed_by
  const getDisplayName = (identifier) => {
    if (!identifier) return 'Unknown';
    
    // If it's an AI model
    if (identifier.includes('gemini') || identifier.includes('gpt') || identifier.includes('claude')) {
      return 'AI';
    }
    return identifier;
  };

  const handleVote = async (questionId,like) => {
    try {
      const response = await fetch(API_ROUTES.likeQuestionOrAnswer, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionID : questionId,
          username : currentUsername,
          like : like
        }),
      });
  
      const result = await response.json();
      console.log("fuyyu",result);
          if (!response.ok) {
        if (response.status === 400 && result.error?.includes("already liked")) {
          // Show popup or toast notification
          alert("You have already liked this answer.");
        } else if (response.status === 400 && result.error?.includes("already disliked")) {
          alert("You have already disliked this answer.");
        } else {
          alert(`Error: ${result.error}`);
        }
      } else {
        // Success
        console.log("Vote result:", result);
        // Optionally update UI or state here
      }
      getQuestionList(); // Refresh the questions list after voting
    } catch (error) {
      console.error("Error during voting:", error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    Alert.alert(
      "Delete Question",
      "Are you sure you want to delete this question? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => performDeleteQuestion(questionId)
        }
      ]
    );
  };

  const performDeleteQuestion = async (questionId) => {
    try {
      setDeletingQuestionId(questionId);
      
      const response = await fetch(API_ROUTES.deleteWordQuestionById(questionId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log("Question deleted successfully:", result);
        // Refresh the questions list after successful deletion
        await getQuestionList();
        Alert.alert("Success", "Question deleted successfully!");
      } else {
        console.error("Error deleting question:", result);
        
        // Handle specific error cases
        if (response.status === 400 && result.error?.includes("Cannot delete question with answers")) {
          Alert.alert(
            "Cannot Delete Question", 
            "This question cannot be deleted because it has answers. Questions with answers are preserved to maintain the integrity of discussions.",
            [{ text: "OK", style: "default" }]
          );
        } else if (response.status === 404) {
          Alert.alert("Error", "Question not found. It may have already been deleted.");
          // Refresh the list in case the question was already deleted
          await getQuestionList();
        } else {
          Alert.alert("Error", result.error || result.message || "Failed to delete question");
        }
      }
    } catch (error) {
      console.error("Error during question deletion:", error);
      Alert.alert("Error", "An error occurred while deleting the question. Please check your connection and try again.");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  // Map API data to display format - only if questions is an array
  const mappedQuestions = questions.length > 0 ? questions.map((q, index) => ({
    id: q._id,
    title: q.question,
    creator: q.created_by,
    reviewer: getDisplayName(q.reviewed_by),
    likes: q.likes || 0,
    dislikes : q.dislikes || 0,
    comments: q.num_ans || 0,
    createdDate: new Date(q.created_ts).toLocaleDateString(),
    updatedDate: new Date(q.updated_ts).toLocaleDateString(),
    // Keep original creator for filtering
    originalCreator: q.created_by
  })) : [];

  // Filter questions based on selected filter
  const filteredQuestions = useMemo(() => {
    if (!currentUsername) {
      // If no current user, show all questions
      return mappedQuestions;
    }

    switch (selectedFilter) {
      case "All":
        return mappedQuestions;
      
      case "Users":
        // Show questions from other users (not current user)
        return mappedQuestions.filter(question => question.originalCreator !== currentUsername);
      
      case "Mine":
        // Show only current user's questions
        return mappedQuestions.filter(question => question.originalCreator === currentUsername);
      
      default:
        return mappedQuestions;
    }
  }, [mappedQuestions, selectedFilter, currentUsername]);

  const filters = ['All', 'Users', 'Mine'];

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
  };

  const handleQuestionPress = (questionId) => {
    dispatch(setCurrentQuestionId(questionId));
    router.push("WordAnswers");
  };

  const handleAskQuestion = () => {
    console.log('Ask question pressed');
    setShowAddModal(true);
  };

  const handleQuestionAdded = () => {
    // Refresh the questions list after adding a new question
    getQuestionList();
  };

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
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Title and Add Button */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Questions ({mappedQuestions.length})</Text>
          
          {/* Ask a Question Button */}
          <TouchableOpacity style={styles.askButton} onPress={handleAskQuestion}>
            <Text style={styles.askButtonText}>Ask a Question</Text>
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
          
          {/* Filter Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => handleFilterPress(filter)}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive
                ]}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive
                ]}>
                  {filter}
                  {filter !== 'All' && (
                    <Text style={styles.filterCount}>
                      {" "}({
                        filter === "Users" 
                          ? mappedQuestions.filter(q => q.originalCreator !== currentUsername).length
                          : filter === "Mine"
                          ? mappedQuestions.filter(q => q.originalCreator === currentUsername).length
                          : mappedQuestions.length
                      })
                    </Text>
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Questions List */}
          <View style={styles.questionsList}>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <TouchableOpacity
                  key={question.id}
                  style={styles.questionCard}
                  onPress={() => handleQuestionPress(question.id)}
                >
                  <View style={styles.questionContent}>
                    <View style={styles.questionLeft}>
                      <View style={styles.questionHeader}>
                        <Text style={styles.questionTitle}>{question.title}</Text>
                        {question.originalCreator === currentUsername && (
                          <TouchableOpacity
                            style={[
                              styles.deleteButton,
                              deletingQuestionId === question.id && styles.deleteButtonDisabled
                            ]}
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent triggering the question press
                              handleDeleteQuestion(question.id);
                            }}
                            disabled={deletingQuestionId === question.id}
                          >
                            {deletingQuestionId === question.id ? (
                              <Text style={styles.deleteButtonText}>...</Text>
                            ) : (
                              <Ionicons name="trash-outline" size={18} color="#ef4444" />
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text style={styles.creatorText}>
                        Created by{" "}
                        <Text style={[
                          styles.creatorName,
                          question.originalCreator === currentUsername && styles.currentUserName
                        ]}>
                          {question.creator}
                          {question.originalCreator === currentUsername && " (You)"}
                        </Text>
                      </Text>
                      <Text style={styles.reviewerText}>Reviewed by {question.reviewer}</Text>
                      {/* <Text style={styles.dateText}>Created: {question.createdDate}</Text> */}
                    </View>
                    
                    <View style={styles.questionRight}>
                      <Ionicons name="chevron-forward" size={22} color="#333" />
                      <View style={styles.statsContainer}>
                        <TouchableOpacity style={styles.statItem} onPress={() => handleVote(question.id, true)}>
                          <Ionicons name="thumbs-up" size={20} color="#6b7280" />
                          <Text style={styles.statText}>{question.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.statItem} onPress={() => handleVote(question.id, false)}>
                          <Ionicons name="thumbs-down" size={20} color="#6b7280" />
                          <Text style={styles.statText}>{question.dislikes}</Text>
                        </TouchableOpacity>
                        {/* <View style={styles.statItem}>
                          <Text style={styles.statIcon}>💬</Text>
                          <Text style={styles.statText}>{question.comments}</Text>
                        </View> */}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedFilter === "All" 
                    ? "No questions found for this word."
                    : selectedFilter === "Users"
                    ? "No questions from other users found."
                    : "You haven't asked any questions for this word yet."
                  }
                </Text>
                <TouchableOpacity style={styles.emptyButton} onPress={handleAskQuestion}>
                  <Text style={styles.emptyButtonText}>
                    {selectedFilter === "Mine" ? "Ask your first question!" : "Be the first to ask!"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <AddQuestionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        wordId={currentWordId}
        onQuestionAdded={handleQuestionAdded}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  header: {
    backgroundColor: "#06B6D4",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: { padding: 5 },
  backArrow: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
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
  askButton: {
    backgroundColor: '#475569',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  askButtonText: {
    color: 'white',
    fontSize: 16,
  },
  plusIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#64748b',
  },
  filterButtonText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  filterCount: {
    fontSize: 12,
    opacity: 0.8,
  },
  questionsList: {
    gap: 12,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  questionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  questionLeft: {
    flex: 1,
    marginRight: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  questionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  deleteButtonText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  creatorText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 2,
  },
  creatorName: {
    color: '#111827',
    fontWeight: '500',
  },
  currentUserName: {
    color: '#06B6D4',
    fontWeight: '600',
  },
  reviewerText: {
    color: '#2563eb',
    fontSize: 14,
    marginBottom: 2,
  },
  dateText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  questionRight: {
    alignItems: 'flex-end',
  },
  chevron: {
    color: '#9ca3af',
    fontSize: 20,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 20,
  },
  statIcon: {
    fontSize: 20,
  },
  statText: {
    color: '#6b7280',
    fontSize: 14,
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
});

export default WordQuestions;