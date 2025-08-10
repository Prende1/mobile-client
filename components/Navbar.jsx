import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Navbar = () => {
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "");
  const name = useSelector((state)=> state.auth.user?.username);

  const handleProfilePress = () => {
    // Add your profile navigation logic here
    console.log("Profile button pressed");
    router.push("/Profile");
  };

  const handleDiscussionPress = () => {
    // Add your discussion navigation logic here
    console.log("Discussion button pressed");
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial(name) || " "}</Text>
        </View>
        <View>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.nameText}>{name}</Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.button} onPress={handleDiscussionPress}>
          <Ionicons name="chatbubbles-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleProfilePress}>
          <Ionicons name="person-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    minHeight: 80,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1B2128",
    padding: 10,
    borderBottomRadius: 20,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  welcomeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  nameText: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A3138",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A4148",
  },
});

export default Navbar;