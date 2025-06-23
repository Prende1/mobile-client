import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import API_ROUTES from "../api/apiConfig";
import { setCurrentQuestionId } from "@/redux/word/word";

const AccordionItem = ({
  title,
  createdBy,
  reviewedBy,
  topAnswer,
  isExpanded,
  onToggle,
  commentCount,
  likeCount,
  hasAnswers,
  answerCount,
  onQuestionPress,
}) => (
  <View style={styles.accordionContainer}>
    <TouchableOpacity
      style={styles.accordionHeader}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.headerLeft}>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#666"
        />
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={onQuestionPress} style={styles.questionButton}>
            <Text style={styles.title}>{title}</Text>
          </TouchableOpacity>
          <View style={styles.authorContainer}>
            <Text style={styles.createdBy}>Created by {createdBy}</Text>
            {reviewedBy && (
              <Text style={styles.reviewedBy}>Reviewed by {reviewedBy}</Text>
            )}
            <Text style={styles.answerCount}>
              {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>

    {isExpanded && (
      <View style={styles.accordionContent}>
        {hasAnswers && topAnswer ? (
          <View style={styles.answersContainer}>
            <View style={styles.topAnswerHeader}>
              <Text style={styles.answersTitle}>Top Answer:</Text>
              {answerCount > 1 && (
                <TouchableOpacity style={styles.viewAllButton} onPress={onQuestionPress}>
                  <Text style={styles.viewAllText}>View all {answerCount} answers</Text>
                  <Ionicons name="arrow-forward" size={12} color="#06B6D4" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.answerItem}>
              <View style={styles.answerHeader}>
                <View style={styles.answerRank}>
                  <Text style={styles.rankNumber}>#1</Text>
                  <View style={styles.scoreContainer}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.scoreText}>{topAnswer.ai_score}</Text>
                  </View>
                </View>
                <View style={styles.answerMeta}>
                  <Text style={styles.answeredBy}>by {topAnswer.answered_by}</Text>
                  <Text style={styles.narrative}>({topAnswer.narrative})</Text>
                </View>
              </View>
              
              <Text style={styles.answerText}>{topAnswer.answer}</Text>
              
              <View style={styles.answerFooter}>
                <Text style={styles.answerDate}>
                  {new Date(topAnswer.created_ts).toLocaleDateString()}
                </Text>
                <View style={styles.answerActions}>
                  <TouchableOpacity style={styles.answerActionButton}>
                    <Ionicons name="thumbs-up-outline" size={14} color="#666" />
                    <Text style={styles.answerActionText}>{topAnswer.num_vote}</Text>
                  </TouchableOpacity>
                  {topAnswer.flag && (
                    <View style={styles.flagContainer}>
                      <Ionicons name="flag" size={12} color="#EF4444" />
                      <Text style={styles.flagText}>Flagged</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noAnswerContainer}>
            <Ionicons name="help-circle-outline" size={24} color="#94a3b8" />
            <Text style={styles.noAnswerText}>
              No answers available for this question yet.
            </Text>
            <Text style={styles.noAnswerSubText}>
              Be the first to contribute an answer!
            </Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          <View style={styles.actionLeft}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text style={styles.actionText}>{commentCount || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="thumbs-up-outline" size={16} color="#666" />
              <Text style={styles.actionText}>{likeCount || 0}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    )}
  </View>
);

export default function QuestionAndAnswer() {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedMainFilter, setSelectedMainFilter] = useState("Definition");
  const [selectedSubFilter, setSelectedSubFilter] = useState("Definition");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const {currentWordId,currentWord} = useSelector((state) => state.word);
  const router = useRouter();
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

    const getAnswersList = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ROUTES.getWordAnswersByWordID(currentWordId), {
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

    // Map questions with their corresponding answers
    const mapQuestionsWithAnswers = () => {
      const mapped = questions.map(question => {
        // Find all answers for this question
        const questionAnswers = answers.filter(answer => answer.wqID === question._id);
        
        // Sort answers by AI score (highest first) and then by creation date
        const sortedAnswers = questionAnswers.sort((a, b) => {
          if (b.ai_score !== a.ai_score) {
            return b.ai_score - a.ai_score;
          }
          return new Date(b.created_ts) - new Date(a.created_ts);
        });

        return {
          id: question._id,
          title: question.question,
          createdBy: question.created_by,
          reviewedBy: question.reviewed_by,
          commentCount: 0, // Add if you have comment data
          likeCount: question.num_vote || 0,
          hasAnswers: sortedAnswers.length > 0,
          answerCount: sortedAnswers.length,
          topAnswer: sortedAnswers.length > 0 ? sortedAnswers[0] : null, // Only store the top answer
        };
      });

      setMappedData(mapped);
    };

    // Initial fetch on mount
    useEffect(() => {
      if (currentWordId) {
        getQuestionList();
        getAnswersList();
      }
    }, [currentWordId]);

    // Map data whenever questions or answers change
    useEffect(() => {
      if (questions.length > 0 || answers.length > 0) {
        mapQuestionsWithAnswers();
      }
    }, [questions, answers]);

  const toggleItem = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleQuestionPress = (questionId) => {
      dispatch(setCurrentQuestionId(questionId));
      router.push("WordAnswers");
    };

  const mainFilters = ["Definition", "Children Definition", "Primary Def"];

  const handleMainFilterPress = (filter) => {
    setSelectedMainFilter(filter);
  };

  // Separate handler for Questions button
  const handleQuestionsPress = () => {
    router.push("WordQuestions");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06B6D4" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentWord}</Text>
      </View>

      {/* Main Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mainFilterScroll}
        >
          {mainFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleMainFilterPress(filter)}
              style={[
                styles.filterButton,
                selectedMainFilter === filter && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedMainFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter}
                {filter !== "Primary Def" && " +"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sub Filter Section with Questions Button */}
        <View style={styles.subFilterContainer}>
          <TouchableOpacity
            style={styles.questionsButton}
            onPress={handleQuestionsPress}
          >
            <Ionicons name="add-circle-outline" size={16} color="#06B6D4" />
            <Text style={styles.questionsButtonText}>Go to Questions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Accordion Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accordionList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading questions...</Text>
            </View>
          ) : mappedData.length > 0 ? (
            mappedData.map((item) => (
              <AccordionItem
                key={item.id}
                title={item.title}
                createdBy={item.createdBy}
                reviewedBy={item.reviewedBy}
                topAnswer={item.topAnswer}
                isExpanded={expandedItems.has(item.id)}
                onToggle={() => toggleItem(item.id)}
                onQuestionPress={() => handleQuestionPress(item.id)}
                commentCount={item.commentCount}
                likeCount={item.likeCount}
                hasAnswers={item.hasAnswers}
                answerCount={item.answerCount}
              />
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="help-circle-outline" size={48} color="#94a3b8" />
              <Text style={styles.noDataText}>No questions found</Text>
              <Text style={styles.noDataSubText}>
                Be the first to ask a question about this word!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1E293B" 
  },
  header: {
    backgroundColor: "#06B6D4",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { 
    padding: 5 
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
  // Enhanced filter container styles from WordAnswers
  filterContainer: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mainFilterScroll: {
    marginBottom: 12,
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
  subFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  questionsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E40AF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  questionsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  accordionList: {
    padding: 16,
  },
  accordionContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  questionButton: {
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000", // Changed to make it look like a button/link
    marginBottom: 4,
    textDecorationLine: "underline", // Added underline to indicate it's interactive
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  createdBy: {
    fontSize: 12,
    color: "#64748B",
    marginRight: 8,
  },
  reviewedBy: {
    fontSize: 12,
    color: "#3B82F6",
    marginRight: 8,
  },
  answerCount: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  answersContainer: {
    marginTop: 12,
  },
  topAnswerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  answersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#EFF6FF",
    borderRadius: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: "#06B6D4",
    fontWeight: "500",
    marginRight: 4,
  },
  answerItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#06B6D4",
  },
  answerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  answerRank: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#06B6D4",
    marginRight: 8,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
    marginLeft: 2,
  },
  answerMeta: {
    alignItems: "flex-end",
  },
  answeredBy: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3B82F6",
  },
  narrative: {
    fontSize: 11,
    color: "#64748B",
    fontStyle: "italic",
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
    marginBottom: 8,
  },
  answerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  answerDate: {
    fontSize: 11,
    color: "#94a3b8",
  },
  answerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  answerActionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  answerActionText: {
    fontSize: 11,
    color: "#64748B",
    marginLeft: 3,
  },
  flagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  flagText: {
    fontSize: 10,
    color: "#EF4444",
    marginLeft: 2,
    fontWeight: "500",
  },
  noAnswerContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noAnswerText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
  },
  noAnswerSubText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    textAlign: "center",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    padding: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#94a3b8",
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
    textAlign: "center",
  },
  noDataSubText: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
    textAlign: "center",
  },
});