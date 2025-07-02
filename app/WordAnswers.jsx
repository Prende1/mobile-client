import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import API_ROUTES from "../api/apiConfig";
import AddAnswerModal from "../components/Words/AddAnswerModal";

const WordAnswers = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const { currentQuestionId,currentWord } = useSelector((state) => state.word);
  const { username: currentUsername, userId} = useSelector((state) => state.auth.user);
  
  console.log("Current Question ID:", currentQuestionId);
  console.log("Current Username:", currentUsername);
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showAddAnswerModal, setShowAddAnswerModal] = useState(false);

  const getAnswerList = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ROUTES.getWordAnswers(currentQuestionId), {
        method: 'GET',
      });
      const data = await response.json();
      
      // Check if data is an array, otherwise set empty array
      if (Array.isArray(data)) {
        setAnswers(data);
      } else {
        // Handle case where API returns {message: "No questions found"} or other non-array response
        console.log("API Response:", data);
        setAnswers([]);
      }
      
      console.log("Fetched Answers:", data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setAnswers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (currentQuestionId) {
      getAnswerList();
    }
  }, [currentQuestionId]);

  // Helper function to get author name from ID (you might need to modify this based on your user data structure)
  const getAuthorName = (authorId) => {
    // You might want to maintain a user lookup or fetch user details
    // For now, returning the ID or a placeholder
    return authorId || "Unknown Author";
  };

  // Filter answers based on selected filter
  const filteredAnswers = useMemo(() => {
    if (!currentUsername) {
      // If no current user, show all answers
      return answers;
    }

    switch (selectedFilter) {
      case "All":
        return answers;
      
      case "Users":
        // Show answers from other users (not current user)
        return answers.filter(answer => answer.answered_by !== currentUsername);
      
      case "Mine":
        // Show only current user's answers
        return answers.filter(answer => answer.answered_by === currentUsername);
      
      default:
        return answers;
    }
  }, [answers, selectedFilter, currentUsername]);

  const filters = ["All", "Users", "Mine"];

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
  };

  const handleVote = async (answerId) => {
  try {
    const response = await fetch(API_ROUTES.likeQuestionOrAnswer, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answerID : answerId,
        username : currentUsername,
        like : true
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
  } catch (error) {
    console.error("Error during voting:", error);
  }
};


  const handleAddAnswer = () => {
    setShowAddAnswerModal(true);
  };

  const handleAnswerAdded = () => {
    setShowAddAnswerModal(false);
    getAnswerList(); // Refresh the answers list after adding a new answer
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
        {/* Title */}
        <Text style={styles.title}>{currentWord}</Text>

        {/* Add Answer Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddAnswer}>
          <Text style={styles.addButtonText}>Answer</Text>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterPress(filter)}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter}
                {filter !== "All" && (
                  <Text style={styles.filterCount}>
                    {" "}({
                      filter === "Users" 
                        ? answers.filter(answer => answer.answered_by !== currentUsername).length
                        : filter === "Mine"
                        ? answers.filter(answer => answer.answered_by === currentUsername).length
                        : answers.length
                    })
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading answers...</Text>
          </View>
        )}

        {/* No Answers State */}
        {!loading && filteredAnswers.length === 0 && (
          <View style={styles.noAnswersContainer}>
            <Text style={styles.noAnswersText}>
              {selectedFilter === "All" 
                ? "No answers found for this question."
                : selectedFilter === "Users"
                ? "No answers from other users found."
                : "You haven't answered this question yet."
              }
            </Text>
          </View>
        )}

        {/* Answers List */}
        <View style={styles.answersList}>
          {filteredAnswers.map((answer) => (
            <View key={answer._id} style={styles.answerCard}>
              {/* Answer Header */}
              <View style={styles.answerHeader}>
                <Text style={styles.authorText}>
                  Answer by{" "}
                  <Text style={[
                    styles.authorName,
                    answer.answered_by === currentUsername && styles.currentUserName
                  ]}>
                    {getAuthorName(answer.answered_by)}
                    {answer.answered_by === currentUsername && " (You)"}
                  </Text>
                </Text>
                <Text style={styles.reviewerText}>
                  Reviewed by{" "}
                  <Text style={styles.reviewerName}>
                    {answer.reviewed_by || "AI"}
                  </Text>
                </Text>
              </View>

              {/* Answer Content */}
              <Text style={styles.answerContent}>{answer.answer}</Text>

              {/* Example Section - Only show if narrative exists */}
              {answer.narrative && (
                <>
                  <Text style={styles.exampleHeader}>Narrative:</Text>
                  <Text style={styles.exampleText}>{answer.narrative}</Text>
                </>
              )}

              {/* Answer Footer */}
              <View style={styles.answerFooter}>
                <View style={styles.leftFooter}>
                  {/* <TouchableOpacity style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={16} color="#6b7280" />
                  </TouchableOpacity> */}
                  <View style={styles.aiScore}>
                    <Text style={styles.aiScoreText}>
                      AI Score : {answer.ai_score || 0}
                    </Text>
                  </View>
                </View>

                <View style={styles.rightFooter}>
                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={() => handleVote(answer._id)}
                  >
                    <Ionicons
                      name="chevron-up"
                      size={20}
                      color={answer.isUpvoted ? "#06B6D4" : "#6b7280"}
                    />
                  </TouchableOpacity>
                  <Text style={styles.voteCount}>{answer.likes || 0}</Text>
                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={() => handleVote(answer._id)}
                  >
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                   <Text style={styles.voteCount}>{answer.dislikes || 0}</Text>
                </View>
              </View>

              {/* Additional Info */}
              <View style={styles.additionalInfo}>
                <Text style={styles.timestampText}>
                  Created: {new Date(answer.created_ts).toLocaleDateString()}
                </Text>
                {answer.flag && (
                  <Text style={styles.flagText}>🚩 Flagged</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <AddAnswerModal
        visible={showAddAnswerModal}
        onClose={() => setShowAddAnswerModal(false)}
        onAnswerAdded={handleAnswerAdded}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e293b",
  },
  header: {
    backgroundColor: "#06B6D4",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: { padding: 5 },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#64748b",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  plusIcon: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: "#475569",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#64748b",
  },
  filterButtonText: {
    color: "#d1d5db",
    fontSize: 14,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "white",
  },
  filterCount: {
    fontSize: 12,
    opacity: 0.8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
  },
  noAnswersContainer: {
    padding: 20,
    alignItems: "center",
  },
  noAnswersText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
  },
  answersList: {
    gap: 16,
  },
  answerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  answerHeader: {
    marginBottom: 12,
  },
  authorText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  authorName: {
    color: "#111827",
    fontWeight: "500",
  },
  currentUserName: {
    color: "#06B6D4",
    fontWeight: "600",
  },
  reviewerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  reviewerName: {
    color: "#2563eb",
    fontWeight: "500",
  },
  answerContent: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 24,
    marginBottom: 12,
  },
  exampleHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 16,
  },
  answerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leftFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  aiScore: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  aiScoreText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  rightFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    minWidth: 20,
    textAlign: "center",
  },
  additionalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  timestampText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  flagText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
});

export default WordAnswers;