import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const AIBanner = () => {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/avatarAI.png")} style={styles.avatar} />
      <Text style={styles.text}>Converse to AI & boost your thinking</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 10,
    borderRadius: 10,
    width: "90%",
    alignSelf: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  text: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});

export default AIBanner;
