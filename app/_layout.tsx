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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments(); // Get the current active route

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
  // const shouldShowNavAndFooter = !["Login", "index"].includes(segments[0]);

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={styles.container}>
          {/* Conditionally render Navbar */}
          {/* {shouldShowNavAndFooter && <Navbar />} */}

          {/* Main content */}
          <View style={styles.content}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="Login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </View>

          {/* Conditionally render Footer */}
          {/* {shouldShowNavAndFooter && <Footer />} */}
        </View>

        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#F0F4F6",
  },
});