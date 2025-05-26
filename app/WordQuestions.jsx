import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import API_ROUTES from "../api/apiConfig";
import { useRouter } from 'expo-router';
import AddQuestionModal from '../components/Words/AddQuestionModal';

const WordQuestions = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { currentWordId } = useSelector((state) => state.word);
  console.log("Current Word ID:", currentWordId);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

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

  // Map API data to display format - only if questions is an array
  const mappedQuestions = questions.length > 0 ? questions.map((q, index) => ({
    id: q._id,
    title: q.question,
    creator: q.created_by,
    reviewer: getDisplayName(q.reviewed_by),
    likes: q.num_vote || 0,
    comments: q.num_ans || 0,
    createdDate: new Date(q.created_ts).toLocaleDateString(),
    updatedDate: new Date(q.updated_ts).toLocaleDateString()
  })) : [];

  const filters = ['Admin', 'All', 'Approved', 'Users', 'Mine'];

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
  };

  const handleQuestionPress = (questionId) => {
    console.log('Question pressed:', questionId);
    // Navigate to question detail page
    // router.push(`/questions/${questionId}`);
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
                  {filter !== 'All' && ' >'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Questions List */}
          <View style={styles.questionsList}>
            {mappedQuestions.length > 0 ? (
              mappedQuestions.map((question) => (
                <TouchableOpacity
                  key={question.id}
                  style={styles.questionCard}
                  onPress={() => handleQuestionPress(question.id)}
                >
                  <View style={styles.questionContent}>
                    <View style={styles.questionLeft}>
                      <Text style={styles.questionTitle}>{question.title}</Text>
                      <Text style={styles.creatorText}>Created by {question.creator}</Text>
                      <Text style={styles.reviewerText}>Reviewed by {question.reviewer}</Text>
                      <Text style={styles.dateText}>Created: {question.createdDate}</Text>
                    </View>
                    
                    <View style={styles.questionRight}>
                      <Text style={styles.chevron}>›</Text>
                      <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                          <Text style={styles.statIcon}>♡</Text>
                          <Text style={styles.statText}>{question.likes}</Text>
                        </View>
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
                <Text style={styles.emptyText}>No questions found for this word.</Text>
                <TouchableOpacity style={styles.emptyButton} onPress={handleAskQuestion}>
                  <Text style={styles.emptyButtonText}>Be the first to ask!</Text>
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
  creatorText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 2,
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
  },
  statIcon: {
    fontSize: 16,
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