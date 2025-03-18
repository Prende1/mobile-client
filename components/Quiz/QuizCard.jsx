import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const QuizCard = ({ title }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.button}>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
      <View style={styles.curvedDesign} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 130,
    height: 130,
    backgroundColor: "#F4F4F4",
    borderRadius: 15,
    padding: 10,
    justifyContent: "space-between",
    position: "relative",
    margin: 10,
    borderWidth: 1,
    borderColor: "#1C1E46",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  button: {
    width: 30,
    height: 30,
    backgroundColor: "#1E1E1E",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  curvedDesign: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 60,
    height: 60,
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 80,
    borderBottomEndRadius: 10,
  },
});

export default QuizCard;
