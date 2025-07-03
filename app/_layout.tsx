import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import store from "../redux/store";
import { useColorScheme } from "@/hooks/useColorScheme";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Navbar from "../components/Navbar";
import { SafeAreaView } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments(); // Get the current active route

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    lexend: require("../assets/fonts/Lexend-VariableFont_wght.ttf"),
    lexend_med : require("../assets/fonts/Lexend-Medium.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Hide Navbar & Footer on Login and index (authentication screens)
  const shouldShowNavAndFooter = !["LevelPage", "Login", "index", "PastQuizQuestions","StartPage", "Onboarding","WordQuestions","WordAnswers","QuestionAndAnswer"].includes(
  segments[0]
) && segments[1] !== "wordScreen" && segments[1] !== "profile";

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={styles.safeArea} >
          <LinearGradient
            colors={["#1C1E46", "#131425"]}
            style={styles.gradientBackground}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 1]}
          />
          {/* Conditionally render Navbar */}
          {shouldShowNavAndFooter && <Navbar />}

          {/* Main content */}
          <View style={[styles.content]}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="Login" />
              <Stack.Screen name="LevelPage" />
              <Stack.Screen name="StartPage" />
              <Stack.Screen name="Onboarding" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="QuizScreen" />
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="QuestionAndAnswer" />
              <Stack.Screen name="WordQuestions" />
              <Stack.Screen name="WordAnswers" />
              <Stack.Screen name="PastQuizQuestions" />
            </Stack>
          </View>

          {/* Conditionally render Footer */}
          {/* {shouldShowNavAndFooter && <Footer />} */}
        </SafeAreaView>

        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
  },
});
