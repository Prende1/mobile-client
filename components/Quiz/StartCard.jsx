import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to have expo vector icons installed

const StartCard = ({ onStartQuiz, title, onClose }) => {
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
          <Text style={styles.infoText}>10-15 MCQ's</Text>
          <Text style={styles.infoText}>30 seconds for each answer</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={onStartQuiz}
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
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 6,
    fontWeight: '600',
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