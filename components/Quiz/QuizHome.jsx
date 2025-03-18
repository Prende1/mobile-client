import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import AIBanner from "./AIBanner";
import QuizCard from "./QuizCard";

const QuizHome = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("http://192.168.117.252:8000/api/quizzes"); // Replace with local IP
        const data = await response.json();
        console.log("Fetched Quizzes:", data);
        setQuizzes(data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <View style={styles.container}>
      <AIBanner />
      <View style={styles.quizContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E1E1E" />
        ) : quizzes.length === 0 ? (
          <Text style={styles.noData}>No quizzes found.</Text>
        ) : (
          <View style={styles.quizList}>
            {quizzes.map((item) => (
              <QuizCard key={item._id} title={item.title} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default QuizHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  quizContainer: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 20,
  },
  quizList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  noData: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555",
  },
});
