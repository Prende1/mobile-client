import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import API_ROUTES from "../api/apiConfig";

const QuizScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30); // ⏳ Timer starts at 30 seconds
  const { currentQuizId } = useSelector((state) => state.quiz);

  useEffect(() => {
    if (currentQuizId) {
      fetch(API_ROUTES.QUIZ_BY_ID(currentQuizId))
        .then((response) => response.json())
        .then((data) => {
          setQuestions(data.questions);
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
            handleNext(); // Auto-submit when timer reaches 0
            return 30; // Reset timer for the next question
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer); // Cleanup on unmount
    }
  }, [currentQuestionIndex, questions]);

  if (questions.length === 0) {
    return <Text style={styles.loadingText}>Loading Questions...</Text>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer === currentQuestion.answer); // ✅ Validate answer
    setTimeLeft(30); // Reset timer when answer is selected
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(30); // Reset timer for new question
    } else {
      alert("Quiz Completed!");
    }
  };

  return (
    <View style={styles.container}>
      {/* Timer Display */}
      <Text style={styles.timerText}>⏳ Time Left: {timeLeft}s</Text>

      {/* Question Dots */}
      <View style={styles.dotsContainer}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentQuestionIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Question */}
      <Text style={styles.questionNumber}>
        {currentQuestionIndex + 1}. {currentQuestion.question}
      </Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.choices.map((choice, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === choice
                ? isCorrect
                  ? styles.correctOption
                  : styles.wrongOption
                : null,
            ]}
            onPress={() => handleSelectAnswer(choice)}
            disabled={selectedAnswer !== null} // Disable after selecting
          >
            <Text style={styles.optionText}>{choice}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Button */}
      {selectedAnswer !== null && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      )}
    </View>
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
  inactiveDot: {
    backgroundColor: "#D3D3D3",
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1E26",
    marginBottom: 10,
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
  nextButton: {
    backgroundColor: "#1A1E26",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default QuizScreen;
