import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import API_ROUTES from "../api/apiConfig";
import ExplanationCard from "../components/Quiz/Explanation";
import { useRouter } from "expo-router";
// import { Bulb } from "lucide-react"; // Assuming you have a suitable icon library

const QuizScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const { currentQuizId } = useSelector((state) => state.quiz);
  const router = useRouter();

  useEffect(() => {
    if (currentQuizId) {
      fetch(API_ROUTES.getQuizById(currentQuizId))
        .then((response) => response.json())
        .then((data) => {
          // Transform the data structure to match our component needs
          // console.log("Fetched Questions:", data);
          const formattedQuestions = data.questions.map((question) => ({
            id: question._id,
            question: question.title,
            hint: question.hint,
            choices: question.answers.map((answer) => ({
              id: answer._id,
              text: answer.title,
              isCorrect: answer.reason !== "",
              explanation: answer.reason,
            })),
          }));
          setQuestions(formattedQuestions);
        })
        .catch((error) => {
          console.error("Error fetching questions:", error);
        });
    }
  }, [currentQuizId]);

  useEffect(() => {
    if (questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 1) {
            handleTimeout();
            return 30;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, questions]);

  const handleTimeout = () => {
    Alert.alert("Time's up!", "Moving to the next question");
    handleNext();
  };

  if (questions.length === 0) {
    return <Text style={styles.loadingText}>Loading Questions...</Text>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer.isCorrect);
    setTimeLeft(30); // Reset timer when answer is selected
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowHint(false);
      setTimeLeft(30);
    } else {
      Alert.alert("Quiz Completed!", "You've finished all questions.");
      router.replace("/(tabs)");
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Timer Display */}
      <Text style={styles.timerText}>⏳ Time Left: {timeLeft}s</Text>

      {/* Question progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      {/* Question Dots */}
      <View style={styles.dotsContainer}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentQuestionIndex
                ? styles.activeDot
                : index < currentQuestionIndex
                ? styles.completedDot
                : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Question with Hint Icon */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>{currentQuestion.question}</Text>
        <TouchableOpacity onPress={toggleHint} style={styles.hintButton}>
          <Text style={styles.hintIcon}>💡</Text>
        </TouchableOpacity>
      </View>

      {/* Hint display */}
      {showHint && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>{currentQuestion.hint}</Text>
        </View>
      )}

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.choices.map((choice, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer?.id === choice.id
                ? choice.isCorrect
                  ? styles.correctOption
                  : styles.wrongOption
                : null,
            ]}
            onPress={() => handleSelectAnswer(choice)}
            disabled={selectedAnswer !== null}
          >
            <Text style={styles.optionText}>{choice.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Explanation Card */}
      {selectedAnswer && (
        <View style={styles.explanationContainer}>
          <ExplanationCard
            isCorrect={isCorrect}
            explanation={
              selectedAnswer.explanation || "No explanation available."
            }
          />
        </View>
      )}

      {/* Next Button */}
      {selectedAnswer !== null && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex < questions.length - 1
              ? "Next Question"
              : "Finish Quiz"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
  },
  timerText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FF5733",
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: "#666",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#1A1E26",
  },
  completedDot: {
    backgroundColor: "#4CAF50",
  },
  inactiveDot: {
    backgroundColor: "#D3D3D3",
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  questionNumber: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1E26",
  },
  hintButton: {
    padding: 5,
  },
  hintIcon: {
    fontSize: 20,
  },
  hintContainer: {
    backgroundColor: "#FFF9C4",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  hintText: {
    color: "#5D4037",
    fontSize: 14,
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  correctOption: {
    borderColor: "green",
    backgroundColor: "#d4edda",
  },
  wrongOption: {
    borderColor: "red",
    backgroundColor: "#f8d7da",
  },
  optionText: {
    fontSize: 16,
    color: "#1A1E26",
  },
  explanationContainer: {
    marginTop: 20,
    width: "100%",
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: "#1A1E26",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default QuizScreen;
