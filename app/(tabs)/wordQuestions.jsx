import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_ROUTES from "../../api/apiConfig"; // Adjust the import path as necessary
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";

const QuestionsListComponent = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { username: currentUsername } = useSelector((state) => state.auth.user);
  const router = useRouter();

  const getQuestionList = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ROUTES.getAllQuestions, {
        method: "GET",
      });
      const data = await response.json();

      // Check if data is an array, otherwise set empty array
      if (Array.isArray(data)) {
        // Map API data to component format
        const mappedQuestions = data.map((apiQuestion) => ({
          id: apiQuestion._id,
          title: apiQuestion.question,
          askedBy: apiQuestion.created_by,
          reviewedBy: apiQuestion.reviewed_by,
          answers: apiQuestion.num_ans,
          upvotes: apiQuestion.likes,
          downvotes: apiQuestion.dislikes,
          createdAt: apiQuestion.created_ts,
          updatedAt: apiQuestion.updated_ts,
          wordID: apiQuestion.wordID,
        }));
        setQuestions(mappedQuestions);
      } else {
        // Handle case where API returns {message: "No questions found"} or other non-array response
        console.log("API Response:", data);
        setQuestions([]);
      }

      // console.log("Fetched Questions:", data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    getQuestionList();
  }, []);

  const handleVote = async (questionId, like) => {
    try {
      const response = await fetch(API_ROUTES.likeQuestionOrAnswer, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionID: questionId,
          username: currentUsername,
          like: like,
        }),
      });

      const result = await response.json();
      // console.log("fuyyu", result);
      if (!response.ok) {
        if (
          response.status === 400 &&
          result.error?.includes("already liked")
        ) {
          // Show popup or toast notification
          alert("You have already liked this answer.");
        } else if (
          response.status === 400 &&
          result.error?.includes("already disliked")
        ) {
          alert("You have already disliked this answer.");
        } else {
          alert(`Error: ${result.error}`);
        }
      } else {
        // Success
        console.log("Vote result:", result);
        getQuestionList();
        // Optionally update UI or state here
      }
       // Refresh the questions list after voting
    } catch (error) {
      console.error("Error during voting:", error);
    }
  };

  const QuestionItem = ({ question }) => (
    <View style={styles.questionItem}>
      <View style={styles.questionHeader}>
        <View style={styles.questionContent}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          <Text style={styles.questionMeta}>
            {question.askedBy && question.askedBy !== "AI"
              ? `Asked by ${question.askedBy}`
              : `Reviewed by ${question.reviewedBy}`}
          </Text>
        </View>
        <Text style={styles.answersCount}>{question.answers} answers</Text>
      </View>

      <View style={styles.votingSection}>
        <TouchableOpacity
          style={[styles.voteButton, styles.activeUpvote]}
          onPress={() => handleVote(question.id, true)}
        >
          <Ionicons name="thumbs-up" size={20} color="#6b7280" />
          <Text style={styles.statText}>{question.upvotes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.voteButton, styles.activeDownvote]}
          onPress={() => handleVote(question.id, false)}
        >
          <Ionicons name="thumbs-down" size={20} color="#6b7280" />
          <Text style={styles.statText}>{question.downvotes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Questions</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Questions List */}
      <ScrollView
        style={styles.questionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {questions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No questions available</Text>
          </View>
        ) : (
          questions.map((question) => (
            <QuestionItem key={question.id} question={question} />
          ))
        )}
      </ScrollView>

      {/* Start Answering Button */}
      <TouchableOpacity style={styles.startAnsweringButton} onPress={() => {
            // Handle the action for "See All" button
            router.push("WordAnswering");
          }}>
        <Text style={styles.startAnsweringText}>Start Answering</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingBottom: 70,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  questionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  questionContent: {
    flex: 1,
    marginRight: 12,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  questionMeta: {
    fontSize: 14,
    color: "#6b7280",
  },
  answersCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  votingSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  activeUpvote: {
    backgroundColor: "#dcfce7",
  },
  activeDownvote: {
    backgroundColor: "#fee2e2",
  },
  voteCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeVoteText: {
    color: "#374151",
  },
  startAnsweringButton: {
    backgroundColor: "#10b981",
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 12,
    borderRadius: 60,
    alignItems: "center",
  },
  startAnsweringText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});

export default QuestionsListComponent;
