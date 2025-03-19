import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const Navbar = () => {
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "");
  const name = useSelector((state)=> state.auth.user?.username);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitial(name) || " "}</Text>
      </View>
      <View>
        <Text style={styles.welcomeText}>Welcome!</Text>
        <Text style={styles.nameText}>{name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    minHeight: 80,
    alignItems: "center",
    backgroundColor: "#1B2128",
    padding: 10,
    borderBottomRadius: 20,
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
});

export default Navbar;
