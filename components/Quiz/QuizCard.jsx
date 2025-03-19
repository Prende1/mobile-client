import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QuizStartScreen from "./StartCard";
import { useDispatch } from "react-redux";
import { setCurrentQuizId } from "@/redux/quiz/quiz";
import { useRouter } from "expo-router";

const QuizCard = ({ title ,id}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleStartQuiz = () => {
    setModalVisible(false);
    // Add navigation logic here to start the quiz
    dispatch(setCurrentQuizId(id));
    router.push("QuizScreen");
    console.log(`Starting quiz: ${title}`);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const name = capitalize(title);

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.title}>{name}</Text>
        <TouchableOpacity style={styles.button} onPress={handleModal}>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.curvedDesign} />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <QuizStartScreen
              onStartQuiz={handleStartQuiz}
              title={name}
              onClose={handleModal}
            />
          </View>
        </View>
      </Modal>
    </>
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "transparent",
  },
});

export default QuizCard;
