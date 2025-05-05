import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const StartPage = () => {
  const router = useRouter(); // Assuming you are using a router like React Router or React Navigation
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.bubbleContainer}>
          <View style={styles.speechBubble}>
            <Text style={styles.bubbleText}>Hello!</Text>
          </View>
          <View style={styles.bubbleTail}></View>
        </View>
        
        <Image
          source={require("../assets/images/start1.png")} 
          // In a real app, you would use a local asset or a proper image URL
          // source={require('./assets/monkey.png')}
          style={styles.monkeyImage}
        />
      </View>
      
      <TouchableOpacity style={styles.button} onPress={() => router.replace("/Login")}>
        <Text style={styles.buttonText}>Let's Start</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141429',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monkeyImage: {
    width: 266,
    height: 266,
    resizeMode: 'contain',
  },
  bubbleContainer: {
    position: 'absolute',
    top: '30%',
    right: '15%',
    zIndex: 1,
  },
  speechBubble: {
    backgroundColor: '#1C1E46',
    borderRadius: 4,
    padding: 10,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -10,
    left: 10,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    transform: [{ rotate: '0deg' }],
  },
  bubbleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00B2E3',
    paddingVertical: 15,
    borderRadius: 4,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StartPage;