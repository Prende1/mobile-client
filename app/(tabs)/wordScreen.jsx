/*
  WordScreen.jsx
  This file is Main Screen of words.
*/

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import API_ROUTES from "../../api/apiConfig";
import { useDispatch } from "react-redux";
import { setCurrentWord, setCurrentWordId } from "@/redux/word/word";

export default function WordScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const [wordList, setWordList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWord, setNewWord] = useState({
    title: "",
    type: "",
    category: "noun",
  });
  const router = useRouter();

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const renderAlphabetItem = ({ item }) => (
    <TouchableOpacity>
      <Text style={styles.alphabetLetter}>{item}</Text>
    </TouchableOpacity>
  );

  const getWordList = async () => {
    try {
      const response = await fetch(API_ROUTES.getWords);
      const data = await response.json();
      setWordList(data);
      console.log("Fetched Word List:", data);
    } catch (error) {
      console.error("Error fetching word list:", error);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    getWordList();
  }, []);

  const handleAddWord = () => {
    try {
      const newWordData = {
        title: newWord.title,
        type: newWord.type,
        category: newWord.category,
      };

      fetch(API_ROUTES.addWord, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWordData),
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log("New word added:", data);
          setModalVisible(false);
          setNewWord({ title: "", type: "", category: "noun" });
          setSearchTerm("");
          // Refetch the word list from API after adding a new word
          getWordList();
        })
        .catch((error) => {
          console.error("Error adding new word:", error);
        });
    } catch (error) {
      console.error("Error in handleAddWord:", error);
    }
  };

  const handleWord = (id,title) => {
    dispatch(setCurrentWordId(id));
    dispatch(setCurrentWord(title))
    router.push("QuestionAndAnswer");
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#777"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Words"
            placeholderTextColor="#777"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* Add Word button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={20} color="black" />
          <Text style={styles.addButtonText}>Add Word</Text>
        </TouchableOpacity>
      </View>

      {/* Main content area */}
      <View style={styles.contentContainer}>
        {/* Word list */}
        <FlatList
          data={
            wordList
              .filter((word) =>
                word?.title?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .sort((a, b) => a.title.localeCompare(b.title)) // Sort alphabetically by title
          }
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.wordCard} onPress={() => handleWord(item._id,item.title)}>
              <View>
                <Text style={styles.wordText}>{item.title}</Text>
                <Text style={styles.wordType}>({item.category})</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#333" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text
              style={{ color: "white", textAlign: "center", marginTop: 20 }}
            >
              No words found.
            </Text>
          }
        />

        {/* Alphabet index */}
        <View style={styles.alphabetContainer}>
          <FlatList
            data={alphabet}
            renderItem={renderAlphabetItem}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Add Word Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Word</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              value={newWord.title}
              onChangeText={(t) => setNewWord({ ...newWord, title: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Type"
              value={newWord.type}
              onChangeText={(t) => setNewWord({ ...newWord, type: t })}
            />

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newWord.category}
                onValueChange={(value) =>
                  setNewWord({ ...newWord, category: value })
                }
              >
                {[
                  "noun",
                  "verb",
                  "adjective",
                  "adverb",
                  "pronoun",
                  "preposition",
                  "conjunction",
                  "interjection",
                  "determiner",
                  "article",
                ].map((cat) => (
                  <Picker.Item
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    value={cat}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAddWord}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.saveButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E293B" },
  header: {
    backgroundColor: "#06B6D4",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: { padding: 5 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 24 },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 16, color: "#333" },
  addButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C4C4C4",
    padding: 10,
    borderRadius: 8,
    width: "40%",
    height: 40,
  },
  addButtonText: {
    color: "black",
    fontWeight: "600",
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    position: "relative",
    width: "100%",
  },
  wordCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordText: { fontSize: 20, fontWeight: "bold", color: "#333" },
  wordType: { fontSize: 14, fontStyle: "italic", color: "#666" },
  alphabetContainer: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 8,
    height: "90%",
  },
  alphabetLetter: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: "#333",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 16,
    overflow: "hidden",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "#E2E8F0", // Light Gray-Blue
  },
  saveButton: {
    backgroundColor: "#3B82F6", // Blue
  },
  pressedButton: {
    opacity: 0.8,
  },
  cancelButtonText: {
    color: "#1E293B",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
