import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LevelPage = ({ onSelectLevel, onContinue }) => {
  const [selectedLevel, setSelectedLevel] = React.useState(null);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Radial Gradient Background */}
      <LinearGradient
        colors={['#1C1E46', '#131425']}
        style={styles.gradientBackground}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 1]}
      />
      
        {/* Back button */}
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title}>What's your level of learning</Text>
          
          {/* Level buttons */}
          <TouchableOpacity 
            style={[styles.levelButton, selectedLevel === 'beginner' && styles.selectedButton]} 
            onPress={() => handleLevelSelect('beginner')}
          >
            <Text style={styles.levelButtonText}>Beginner</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.levelButton, selectedLevel === 'intermediate' && styles.selectedButton]} 
            onPress={() => handleLevelSelect('intermediate')}
          >
            <Text style={styles.levelButtonText}>Intermediate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.levelButton, selectedLevel === 'advanced' && styles.selectedButton]} 
            onPress={() => handleLevelSelect('advanced')}
          >
            <Text style={styles.levelButtonText}>Advanced</Text>
          </TouchableOpacity>
          
          {/* Monkey Image */}
          <View style={styles.imageContainer}>
            {/* Replace this with your actual image */}
            <Image 
              source={require('../assets/images/level.png')} // Replace with your actual image
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          
          {/* Continue button */}
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => onContinue && onContinue(selectedLevel)}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  levelButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 15,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: '#e0e0e0',
  },
  levelButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1C1E46',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  image: {
    width: 227,
    height: 227,
  },
  continueButton: {
    backgroundColor: '#01b4e4', // Bright blue button
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LevelPage;