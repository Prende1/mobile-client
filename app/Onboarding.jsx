import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const Onboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const router = useRouter(); // Assuming you are using a router like React Router or React Navigation

  // Onboarding data - add your content and images here
  const onboardingData = [
    {
      id: "1",
      image: require("../assets/images/onboarding1.png"), // Replace with your image paths
      title: "Learn like you never did before",
      description: "",
    },
    {
      id: "2",
      image: require("../assets/images/onboarding2.png"),
      title: "Interactive Learning",
      description: "Engage with content in a completely new way",
    },
    {
      id: "3",
      image: require("../assets/images/onboarding3.png"),
      title: "Track Your Progress",
      description: "See your improvements and stay motivated",
    },
  ];

  const goToNextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Navigate to the main app when onboarding is complete
      // Replace this with your navigation logic
      skipOnboarding(); // For example, you can use React Navigation's navigation.navigate('Home') or similar
      // navigation.replace('Home');
    }
  };

  const skipOnboarding = () => {
    router.replace("/StartPage"); // Replace with your navigation logic
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
        />

        <View style={styles.bottomContainer}>
          <View style={styles.indicatorContainer}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      index === currentIndex ? "#00B2E3" : "#FFFFFF",
                  },
                  { width: index === currentIndex ? 24 : 12 },
                ]}
              />
            ))}
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {onboardingData[currentIndex].title}
            </Text>
            <Text style={styles.description}>
              {onboardingData[currentIndex].description}
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={currentIndex === onboardingData.length - 1 ? skipOnboarding : goToNextSlide}>
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141429",
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  skipButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  flatList: {
    flex: 0,
    height: height * 0.4,
  },
  slide: {
    width,
    height: height * 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width * 0.8,
    height: height * 0.5,
    resizeMode: "contain",
  },
  bottomContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  indicator: {
    height: 8,
    width: 12,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#00B2E3",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Onboarding;