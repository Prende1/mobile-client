import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useSelector } from "react-redux";

const ScorePopup = ({
  visible,
  onClose,
  onCheckReport = () => {},
  onNavigateHome = () => {},
}) => {
  // Get the quiz score from Redux
  const { quizScore } = useSelector((state) => state.quizScore);

  // Calculate percentage for tag and color decision
  const correct = quizScore?.correct || 0;
  const totalQuestions = quizScore?.totalQuestions || 1; // Prevent division by zero
  const scorePercentage = (correct / totalQuestions) * 100;

  // Determine performance tag based on scorePercentage
  const getPerformanceTag = () => {
    if (scorePercentage >= 90) return "Excellent!";
    if (scorePercentage >= 80) return "Great job!";
    if (scorePercentage >= 70) return "Good work!";
    if (scorePercentage >= 60) return "Nice effort!";
    if (scorePercentage >= 50) return "Keep practicing!";
    return "Keep learning!";
  };

  // Get score color based on percentage
  const getScoreColor = () => {
    if (scorePercentage >= 80) return "#4CAF50"; // Green for high scores
    if (scorePercentage >= 60) return "#FFC107"; // Yellow for medium scores
    return "#F44336"; // Red for low scores
  };

  // Calculate completion time
  const getCompletionTime = () => {
    if (!quizScore?.startedTS || !quizScore?.endTS) return "N/A";

    const startTime = new Date(quizScore.startedTS);
    const endTime = new Date(quizScore.endTS);
    const diffInSeconds = Math.floor((endTime - startTime) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;

    return `${minutes}m ${seconds}s`;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Header with Performance Tag */}
          <Text style={styles.headerText}>{getPerformanceTag()}</Text>

          {/* Monkey Image */}
          <Image
            source={require("../../assets/images/start1.png")}
            style={styles.monkeyImage}
            resizeMode="contain"
          />

          {/* Score Display */}
          <View style={styles.scoreDisplayContainer}>
            <Text style={[styles.scoreTag, { color: getScoreColor() }]}>
              {getPerformanceTag()}
            </Text>
          </View>

          {/* Score Stats */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Correct Answers</Text>
              <Text style={[styles.scoreValue, { color: "#4CAF50" }]}>
                {correct}
              </Text>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Incorrect Answers</Text>
              <Text style={[styles.scoreValue, { color: "#F44336" }]}>
                {totalQuestions - correct}
              </Text>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Completion Time</Text>
              <Text style={styles.scoreValue}>{getCompletionTime()}</Text>
            </View>
          </View>

          {/* Total Score */}
          <View style={styles.totalScoreContainer}>
            <Text style={styles.totalScoreText}>
              Score:{" "}
              <Text style={{ color: getScoreColor() }}>
                {correct}/{totalQuestions}
              </Text>
            </Text>
            <Text style={[styles.percentageText, { color: getScoreColor() }]}>
              {scorePercentage.toFixed(0)}%
            </Text>
          </View>

          {/* Check Report Button */}
          <TouchableOpacity style={styles.reportButton} onPress={onCheckReport}>
            <Text style={styles.reportButtonText}>Check Detailed Report</Text>
          </TouchableOpacity>

          {/* OK Button to navigate home */}
          <TouchableOpacity style={styles.okButton} onPress={onNavigateHome}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  monkeyImage: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  scoreDisplayContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  scoreTag: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  scoreContainer: {
    width: "100%",
    marginVertical: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: "#333",
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalScoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  totalScoreText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  percentageText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  reportButton: {
    backgroundColor: "#03A9F4",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  reportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  okButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 12,
  },
  okButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ScorePopup;
