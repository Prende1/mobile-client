// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
// } from "react-native";
// import { useSelector } from "react-redux";
// import API_ROUTES from "../api/apiConfig";
// import ExplanationCard from "../components/Quiz/Explanation";
// import { useRouter } from "expo-router";
// import QuizCompletionPopup from "../components/Quiz/ScorePopup";
// import { setQuizScore } from "../redux/quiz/quizScore";
// import { useDispatch } from "react-redux";

// const QuizScreen = () => {
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(30);
//   const [showHint, setShowHint] = useState(false);
//   const { currentQuizId } = useSelector((state) => state.quiz);
//   const { user } = useSelector((state) => state.auth);
//   const [startTime, setStartTime] = useState(null);
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const timerRef = useRef(null);

//   // Quiz result state
//   const [quizCompleted, setQuizCompleted] = useState(false);

//   useEffect(() => {
//     if (currentQuizId) {
//       fetch(API_ROUTES.getQuizById(currentQuizId))
//         .then((response) => response.json())
//         .then((data) => {
//           const formattedQuestions = data.questions.map((question) => ({
//             id: question._id,
//             question: question.title,
//             hint: question.hint,
//             correctAnswerId: question.correctAnswerId,
//             choices: question.answers.map((answer) => ({
//               id: answer._id,
//               text: answer.title,
//               explanation: answer.reason || "",
//             })),
//           }));
//           setQuestions(formattedQuestions);
//         })
//         .catch((error) => {
//           console.error("Error fetching questions:", error);
//         });
//     }
//   }, [currentQuizId]);

//   useEffect(() => {
//     // Clean up any existing timer
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//       timerRef.current = null;
//     }

//     // Only start a new timer if the quiz is not completed and we have questions
//     if (questions.length > 0 && !quizCompleted) {
//       setStartTime((prev) => prev || new Date());
//       timerRef.current = setInterval(() => {
//         setTimeLeft((prevTime) => {
//           if (prevTime === 1) {
//             handleTimeout();
//             return 30;
//           }
//           return prevTime - 1;
//         });
//       }, 1000);
//     }

//     // Clean up when component unmounts or quiz completes
//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//     };
//   }, [currentQuestionIndex, questions, quizCompleted]);

//   const handleTimeout = () => {
//     if (!quizCompleted) {
//       Alert.alert("Time's up!", "Moving to the next question");
//       handleNext();
//     }
//   };

//   if (questions.length === 0) {
//     return <Text style={styles.loadingText}>Loading Questions...</Text>;
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   const handleSelectAnswer = (answer) => {
//     if (quizCompleted) return;

//     try {
//       fetch(API_ROUTES.submitAnswer, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userID: user._id,
//           quizID: currentQuizId,
//           questionID: currentQuestion.id,
//           answerID: answer.id,
//         }),
//       })
//         .then((response) => response.json())
//         .then((data) => {
//           console.log("Answer submitted:", data);
//         })
//         .catch((error) => {
//           console.error("Error submitting answer:", error);
//         });
//     } catch (error) {
//       console.error("Error in handleSelectAnswer:", error);
//     }
//     setSelectedAnswer(answer);
//     setTimeLeft(30); // reset timer
//   };

//   const handleNext = () => {
//     if (quizCompleted) return;

//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setSelectedAnswer(null);
//       setShowHint(false);
//       setTimeLeft(30);
//     } else {
//       // Clear the timer when quiz is completed
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }

//       // Submit the quiz result
//       try {
//         fetch(API_ROUTES.submitQuizResult, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             userID: user._id,
//             quizID: currentQuizId,
//             startedTS: startTime?.toISOString(),
//             endTS: new Date().toISOString(),
//           }),
//         })
//           .then((response) => response.json())
//           .then((data) => {
//             console.log("Quiz result submitted:", data);
//             dispatch(setQuizScore(data.result));
//             setQuizCompleted(true);
//           })
//           .catch((error) => {
//             console.error("Error submitting quiz result:", error);
//           });
//       } catch (error) {
//         console.error("Error in handleNext:", error);
//       }
//     }
//   };

//   const handleNavigateHome = () => {
//     setQuizCompleted(false);
//     router.replace("/(tabs)");
//   };

//   const handleCheckReport = () => {
//     setQuizCompleted(false);
//     router.replace("/quiz-report");
//   };

//   const toggleHint = () => {
//     if (quizCompleted) return;
//     setShowHint(!showHint);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* Quiz Completion Popup */}
//       <QuizCompletionPopup
//         visible={quizCompleted}
//         onClose={() => setQuizCompleted(false)}
//         onCheckReport={handleCheckReport}
//         onNavigateHome={handleNavigateHome}
//       />

//       {/* Only show timer when quiz is not completed */}
//       {!quizCompleted && (
//         <Text style={styles.timerText}>⏳ Time Left: {timeLeft}s</Text>
//       )}

//       {/* Question progress */}
//       <View style={styles.progressContainer}>
//         <Text style={styles.progressText}>
//           Question {currentQuestionIndex + 1} of {questions.length}
//         </Text>
//       </View>

//       {/* Question Dots */}
//       <View style={styles.dotsContainer}>
//         {questions.map((_, index) => (
//           <View
//             key={index}
//             style={[
//               styles.dot,
//               index === currentQuestionIndex
//                 ? styles.activeDot
//                 : index < currentQuestionIndex
//                 ? styles.completedDot
//                 : styles.inactiveDot,
//             ]}
//           />
//         ))}
//       </View>

//       {/* Question with Hint Icon */}
//       <View style={styles.questionContainer}>
//         <Text style={styles.questionNumber}>{currentQuestion.question}</Text>
//         <TouchableOpacity
//           onPress={toggleHint}
//           style={styles.hintButton}
//           disabled={quizCompleted}
//         >
//           <Text style={styles.hintIcon}>💡</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Hint display */}
//       {showHint && !quizCompleted && (
//         <View style={styles.hintContainer}>
//           <Text style={styles.hintText}>{currentQuestion.hint}</Text>
//         </View>
//       )}

//       {/* Options */}
//       <View style={styles.optionsContainer}>
//         {currentQuestion.choices.map((choice, index) => (
//           <TouchableOpacity
//             key={index}
//             style={[
//               styles.optionButton,
//               selectedAnswer?.id === choice.id &&
//                 (choice.id === currentQuestion.correctAnswerId
//                   ? styles.correctOption
//                   : styles.wrongOption),
//             ]}
//             onPress={() => handleSelectAnswer(choice)}
//             disabled={selectedAnswer !== null || quizCompleted}
//           >
//             <Text style={styles.optionText}>{choice.text}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Explanation Card */}
//       {selectedAnswer && !quizCompleted && (
//         <View style={styles.explanationContainer}>
//           <ExplanationCard
//             isCorrect={selectedAnswer.id === currentQuestion.correctAnswerId}
//             explanation={
//               selectedAnswer.explanation || "No explanation available."
//             }
//           />
//         </View>
//       )}

//       {/* Next Button - only visible when an answer is selected and quiz is not completed */}
//       {selectedAnswer !== null && !quizCompleted && (
//         <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
//           <Text style={styles.nextButtonText}>
//             {currentQuestionIndex < questions.length - 1
//               ? "Next Question"
//               : "Finish Quiz"}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#F5F5F5",
//   },
//   loadingText: {
//     textAlign: "center",
//     marginTop: 20,
//     fontSize: 18,
//   },
//   timerText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     textAlign: "center",
//     color: "#FF5733",
//     marginBottom: 20,
//   },
//   progressContainer: {
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   progressText: {
//     fontSize: 16,
//     color: "#666",
//   },
//   dotsContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginBottom: 20,
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginHorizontal: 5,
//   },
//   activeDot: {
//     backgroundColor: "#1A1E26",
//   },
//   completedDot: {
//     backgroundColor: "#4CAF50",
//   },
//   inactiveDot: {
//     backgroundColor: "#D3D3D3",
//   },
//   questionContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 10,
//   },
//   questionNumber: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1A1E26",
//   },
//   hintButton: {
//     padding: 5,
//   },
//   hintIcon: {
//     fontSize: 20,
//   },
//   hintContainer: {
//     backgroundColor: "#FFF9C4",
//     borderRadius: 8,
//     padding: 15,
//     marginBottom: 15,
//     borderLeftWidth: 4,
//     borderLeftColor: "#FFC107",
//   },
//   hintText: {
//     color: "#5D4037",
//     fontSize: 14,
//   },
//   optionsContainer: {
//     marginTop: 10,
//   },
//   optionButton: {
//     backgroundColor: "white",
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     borderRadius: 8,
//     padding: 15,
//     marginBottom: 15,
//   },
//   correctOption: {
//     borderColor: "green",
//     backgroundColor: "#d4edda",
//   },
//   wrongOption: {
//     borderColor: "red",
//     backgroundColor: "#f8d7da",
//   },
//   optionText: {
//     fontSize: 16,
//     color: "#1A1E26",
//   },
//   explanationContainer: {
//     marginTop: 20,
//     width: "100%",
//     marginBottom: 20,
//   },
//   nextButton: {
//     backgroundColor: "#1A1E26",
//     borderRadius: 8,
//     padding: 15,
//     alignItems: "center",
//     marginTop: 10,
//     marginBottom: 30,
//   },
//   nextButtonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// export default QuizScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import API_ROUTES from "../api/apiConfig";
import { useSelector, useDispatch } from "react-redux";
import { setQuizScore } from "../redux/quiz/quizScore";
import ExplanationCard from "../components/Quiz/Explanation";
import { useRouter } from "expo-router";

const QuizScreen = () => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(new Date());
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const router = useRouter();
  
  const { currentQuizId } = useSelector((state) => state.quiz);
  const { user } = useSelector((state) => state.auth); // Assuming user is in redux state
  const dispatch = useDispatch();

  const fetchNextQuestion = async () => {
    try {
      setLoading(true);
      setSelectedAnswer(null); // Reset selected answer for new question
      setAnswerSubmitted(false); // Reset answer submitted state
      setShowHint(false); // Reset hint visibility
      
      const res = await fetch(API_ROUTES.getNextQuestion(currentQuizId));
      const data = await res.json();
      
      console.log("Fetched question:", data);
      
      if (data.finished) {
        console.log("Quiz finished");
        handleSubmit(); // Submit the quiz result
        setLoading(false);
        router.replace("/QuizResult"); // Navigate to results screen
      } else {
        setQuestion(data.question);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching next question:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to fetch next question");
    }
  };

  useEffect(() => {
    setStartTime(new Date());
    fetchNextQuestion();
  }, []);

  const handleSubmit = async () => {
    try {
      // First submit the current answer if one is selected
      if (selectedAnswer !== null && question) {
        await submitCurrentAnswer();
      }

      // Then submit the quiz result
      const response = await fetch(API_ROUTES.submitQuizResult, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: user._id,
          quizID: currentQuizId,
          startedTS: startTime?.toISOString(),
          endTS: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      console.log("Quiz result submitted:", data);
      
      dispatch(setQuizScore(data.result));
      router.replace("/QuizResult"); // Navigate to results screen

      
    } catch (error) {
      console.error("Error submitting quiz result:", error);
      Alert.alert("Error", "Failed to submit quiz result");
    }
  };

  const submitCurrentAnswer = async () => {
    if (!selectedAnswer || !question) return;
    
    try {
      const response = await fetch(API_ROUTES.submitAnswer, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: user._id,
          quizID: currentQuizId,
          questionID: question._id,
          answerID: selectedAnswer._id,
        }),
      });

      const data = await response.json();
      console.log("Answer submitted:", data);
      
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  };

  const handleNext = async () => {
    try {
      if (!answerSubmitted) {
        // First step: Submit current answer
        if (selectedAnswer !== null && question) {
          await submitCurrentAnswer();
          setAnswerSubmitted(true);
        }
      } else {
        // Second step: Move to next question
        await fetchNextQuestion();
      }
      
    } catch (error) {
      console.error("Error in handleNext:", error);
      Alert.alert("Error", "Failed to submit answer or fetch next question");
    }
  };

  const handleAnswerSelect = (answer) => {
    if (!answerSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const getOptionStyle = (answer) => {
    if (selectedAnswer && selectedAnswer._id === answer._id) {
      return styles.selectedOption;
    }
    return styles.option;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!question) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No question available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Quiz Content */}
      <View style={styles.quizContainer}>
        <Text style={styles.quizTitle}>MCQ's</Text>

        {/* Difficulty Badge */}
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyText}>
            Difficulty: {question.difficulty?.toUpperCase() || 'MEDIUM'}
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>
              {question.title}
            </Text>
            
            {/* Hint Button */}
            {question.hint && (
              <TouchableOpacity
                style={styles.hintButton}
                onPress={toggleHint}
              >
                <Text style={styles.hintIcon}>💡</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Hint if shown */}
          {showHint && question.hint && (
            <Text style={styles.hintText}>
              💡 Hint: {question.hint}
            </Text>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.answers?.map((answer, index) => (
            <TouchableOpacity
              key={answer._id}
              style={getOptionStyle(answer)}
              onPress={() => handleAnswerSelect(answer)}
              disabled={answerSubmitted}
            >
              <Text style={styles.optionText}>{answer.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Submitting Quiz" : "Submit Quiz"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button, 
              answerSubmitted ? styles.nextButton : styles.submitAnswerButton,
              selectedAnswer ? {} : styles.disabledButton
            ]}
            onPress={handleNext}
            disabled={!selectedAnswer || loading }
          >
            <Text style={styles.buttonText}>
              {answerSubmitted ? "Next Question" : (loading ? "Submitting Answer" : "Submit Answer")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected Answer Info */}
        {selectedAnswer && !answerSubmitted && (
          <View style={styles.selectedAnswerContainer}>
            <Text style={styles.selectedAnswerText}>
              Selected: {selectedAnswer.title}
            </Text>
          </View>
        )}

        {/* Explanation Card - Only show after answer is submitted */}
        {selectedAnswer && answerSubmitted && (
          <View style={styles.explanationContainer}>
            <ExplanationCard
              isCorrect={selectedAnswer._id === question.correctAnswerId}
              explanation={
                selectedAnswer.reson || "No explanation available."
              }
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C3E50",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  completedText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  explanationContainer: {
    marginTop: 20,
    width: "100%",
    marginBottom: 20,
  },
  completedSubText: {
    color: "white",
    fontSize: 16,
    opacity: 0.8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 18,
    fontWeight: "600",
  },
  quizContainer: {
    flex: 1,
    padding: 20,
  },
  quizTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  difficultyContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  difficultyText: {
    color: "#3498DB",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "#34495E",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  questionNumber: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    flex: 1,
  },
  hintButton: {
    backgroundColor: "#34495E",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  hintIcon: {
    fontSize: 20,
  },
  hintText: {
    color: "#F39C12",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#34495E",
    borderRadius: 8,
  },
  optionsContainer: {
    marginBottom: 40,
  },
  option: {
    backgroundColor: "#34495E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: "#34495E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#3498DB",
  },
  optionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: "#3498DB",
  },
  submitAnswerButton: {
    backgroundColor: "#E67E22",
  },
  nextButton: {
    backgroundColor: "#2ECC71",
  },
  disabledButton: {
    backgroundColor: "#7F8C8D",
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedAnswerContainer: {
    backgroundColor: "#34495E",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3498DB",
  },
  selectedAnswerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default QuizScreen;