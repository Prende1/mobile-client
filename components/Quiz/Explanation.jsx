import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ExplanationCard = ({ isCorrect, explanation }) => {
  return (
    <View style={[styles.container, isCorrect ? styles.correctContainer : styles.incorrectContainer]}>
      <Text style={styles.header}>
        {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
      </Text>
      <Text style={styles.explanation}>{explanation}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 10,
  },
  correctContainer: {
    backgroundColor: "#d4edda",
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  incorrectContainer: {
    backgroundColor: "#f8d7da",
    borderLeftWidth: 4,
    borderLeftColor: "#dc3545",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ExplanationCard;