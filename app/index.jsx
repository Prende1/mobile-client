import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/login/authSlice";

const Index = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      console.log("Checking token...");
      try {
        const token = await AsyncStorage.getItem("token");
        const user = await AsyncStorage.getItem("user");
        const parsedUser = user ? JSON.parse(user) : null;

        if (token && parsedUser) {
          console.log("Token found, navigating to home screen");
          dispatch(loginSuccess({ token, user: parsedUser }));
          router.replace("/(tabs)");
        } else {
          console.log("No token found, navigating to login screen");
          router.replace("/StartPage");
        }
      } catch (error) {
        console.error("Error checking token:", error);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/icon.png")} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default Index;