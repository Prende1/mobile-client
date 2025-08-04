import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
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
    <View style={styles.questionCard}>
      <View style={styles.questionContent}>
        <View style={styles.questionLeft}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          <Text style={styles.questionMeta}>
            {question.askedBy && question.askedBy !== "AI"
              ? `Asked by ${question.askedBy}`
              : `Reviewed by ${question.reviewedBy}`}
          </Text>
          <Text style={styles.answersText}>{question.answers} answers</Text>
        </View>
        
        <View style={styles.questionRight}>
          <View style={styles.statsContainer}>
            <TouchableOpacity 
              style={styles.statItem} 
              onPress={() => handleVote(question.id, true)}
            >
              <Ionicons name="thumbs-up" size={20} color="#6b7280" />
              <Text style={styles.statText}>{question.upvotes}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem} 
              onPress={() => handleVote(question.id, false)}
            >
              <Ionicons name="thumbs-down" size={20} color="#6b7280" />
              <Text style={styles.statText}>{question.downvotes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </View> */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading questions...</Text>
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
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
      </View> */}
      
      <ScrollView style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>All Questions ({questions.length})</Text>
          
          {/* Questions List */}
          <View style={styles.questionsList}>
            {questions.length > 0 ? (
              questions.map((question) => (
                <QuestionItem key={question.id} question={question} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No questions available</Text>
                <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("WordAnswering")}>
                  <Text style={styles.emptyButtonText}>Start answering questions!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Start Answering Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.startAnsweringButton} 
          onPress={() => router.push("WordAnswering")}
        >
          <Text style={styles.startAnsweringButtonText}>Start Answering</Text>
          <Ionicons name="chatbubbles" size={20} color="white" style={styles.chatIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingBottom: 70, // Adjusted to prevent content from being hidden behind bottom button
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
  questionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  questionMeta: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 2,
  },
  answersText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  questionRight: {
    alignItems: 'flex-end',
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
  bottomContainer: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  startAnsweringButton: {
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
  startAnsweringButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  chatIcon: {
    marginLeft: 4,
  },
});

export default QuestionsListComponent;