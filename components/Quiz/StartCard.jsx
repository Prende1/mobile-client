import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StartCard = ({ onStartQuiz, title, onClose }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

  const difficulties = [
    { id: 'easy', label: 'Easy', color: '#4CAF50' },
    { id: 'medium', label: 'Medium', color: '#FF9800' },
    { id: 'hard', label: 'Hard', color: '#F44336' }
  ];

  const handleStartQuiz = () => {
    onStartQuiz(selectedDifficulty);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>MCQ's Questions</Text>
          <Text style={styles.infoText}>30 seconds for each answer</Text>
        </View>
        
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyTitle}>Select Difficulty:</Text>
          <View style={styles.difficultyOptions}>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.id}
                style={[
                  styles.difficultyOption,
                  selectedDifficulty === difficulty.id && {
                    backgroundColor: difficulty.color,
                    borderColor: difficulty.color,
                  }
                ]}
                onPress={() => setSelectedDifficulty(difficulty.id)}
              >
                <Text style={[
                  styles.difficultyText,
                  selectedDifficulty === difficulty.id && styles.selectedDifficultyText
                ]}>
                  {difficulty.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartQuiz}
        >
          <Text style={styles.buttonText}>Start Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 6,
    fontWeight: '600',
  },
  difficultyContainer: {
    width: '100%',
    marginBottom: 30,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  difficultyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  difficultyText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedDifficultyText: {
    color: 'white',
  },
  startButton: {
    backgroundColor: '#1a2638',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StartCard;