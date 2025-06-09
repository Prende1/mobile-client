import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  setToken,
} from "../redux/login/authSlice";
import API_ROUTES from "../api/apiConfig";
import { LinearGradient } from "expo-linear-gradient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { loading, error } = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    dispatch(loginStart());

    try {
      console.log("Logging in...");
      const response = await fetch(API_ROUTES.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(loginSuccess(data.user));
        dispatch(setToken(data.token));
        console.log("User logged in:", data.user);
        router.replace("/(tabs)");
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch(loginFailure(error.message));
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1C1E46", "#131425"]}
        style={styles.gradientBackground}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 1]}
      />
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <FontAwesome
          name="envelope"
          size={20}
          color="#000"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="E-Mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <FontAwesome
          name="lock"
          size={25}
          color="#000"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* Remember Me Checkbox */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
          onPress={() => setRememberMe(!rememberMe)}
        >
          {rememberMe && <FontAwesome name="check" size={14} color="#000" />}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>Remember me</Text>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.signUpButtonText}>
          {loading ? "Signing In..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      {/* Divider */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "transparent",
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  inputIcon: {
    marginRight: 10,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: "100%",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
    marginTop: 5,
    marginLeft: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#fff",
  },
  checkboxLabel: {
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#01b4e4', // Bright blue button
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    width: "100%",
    height: 60,
    justifyContent: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    paddingHorizontal: 15,
    color: "#777",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    color: "#333",
  },
  loginLink: {
    fontSize: 16,
    color: "#1a2639",
    fontWeight: "bold",
  },
});

export default Login;
