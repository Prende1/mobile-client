import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import AIBanner from "./AIBanner";
import QuizCard from "./QuizCard";
import { setQuiz } from "@/redux/quiz/quiz";
import { useDispatch, useSelector } from "react-redux";
import API_ROUTES from "@/api/apiConfig";
import { useRouter } from "expo-router";

const QuizHome = () => {
  // const [loading, setLoading] = useState(true);
  // const dispatch = useDispatch();
  // const {quiz} = useSelector((state) => state.quiz);
  const router = useRouter();

  // useEffect(() => {
  //   const fetchQuizzes = async () => {
  //     try {
  //       const response = await fetch(API_ROUTES.QUIZZES); // Replace with local IP
  //       const data = await response.json();
  //       //console.log("Fetched Quizzes:", data);
  //       dispatch(setQuiz(data));
  //       // console.log(quiz);
  //     } catch (error) {
  //       console.error("Error fetching quizzes:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchQuizzes();
  // }, []);

  return (
    <View style={styles.container}>
      <AIBanner />
      {/* <View style={styles.quizContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E1E1E" />
        ) : quiz.length === 0 ? (
          <Text style={styles.noData}>No quizzes found.</Text>
        ) : (
          <View style={styles.quizList}>
            {quiz.map((item) => (
              <QuizCard key={item._id} id={item._id} title={item.title} />
            ))}
          </View>
        )}
      </View> */}
      <TouchableOpacity
          style={{ marginTop: 160, alignItems: "center" }}
          onPress={() => {
            // Handle the action for "See All" button
            router.push("PastQuizQuestions");
          }}
        >
          <Text style={{ color: "#1E1E1E", fontSize: 26 }}>Past Quiz Questions</Text>
        </TouchableOpacity>
    </View>
  );
};

export default QuizHome;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  quizContainer: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 10,
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
