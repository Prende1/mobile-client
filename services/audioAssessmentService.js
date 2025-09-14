// services/AudioAssessmentService.js
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI } from '@google/generative-ai';

class AudioAssessmentService {
  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.genAI = null;
    this.recordingUri = null;
  }

  async initialize() {
    try {
      // Initialize Gemini AI - Replace with your API key
      const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      
      // Request audio recording permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

    } catch (error) {
      console.error('Error initializing AudioAssessmentService:', error);
      throw error;
    }
  }

  async startRecording() {
    try {
      if (this.isRecording) {
        console.warn('Already recording');
        return;
      }

      // Initialize if not already done
      if (!this.genAI) {
        await this.initialize();
      }

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(recordingOptions);
      
      this.recording = recording;
      this.isRecording = true;
      
      await recording.startAsync();
      console.log('Recording started');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    try {
      if (!this.isRecording || !this.recording) {
        console.warn('No active recording');
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      this.recordingUri = uri;
      this.isRecording = false;
      this.recording = null;
      
      console.log('Recording stopped, saved to:', uri);
      return uri;
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  async assessAudio(audioUri) {
    try {
      if (!this.genAI) {
        throw new Error('Gemini AI not initialized');
      }

      // Convert audio to base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Get the generative model
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Create the prompt for audio assessment
      const prompt = `
        You are an AI language assessment expert. Please analyze this audio recording and provide a comprehensive assessment of the speaker's English fluency and clarity.

        Please evaluate the following aspects and provide scores from 1-10:
        1. Fluency (flow of speech, natural rhythm, hesitations)
        2. Clarity (pronunciation, articulation, understandability)
        3. Vocabulary usage
        4. Grammar accuracy
        5. Overall communication effectiveness

        Format your response as a JSON object with the following structure:
        {
          "fluencyScore": number (1-10),
          "clarityScore": number (1-10),
          "vocabularyScore": number (1-10),
          "grammarScore": number (1-10),
          "overallScore": number (1-10),
          "strengths": ["strength1", "strength2", ...],
          "areasForImprovement": ["area1", "area2", ...],
          "feedback": "Detailed feedback paragraph",
          "suggestions": ["suggestion1", "suggestion2", ...]
        }

        Please be constructive and encouraging in your feedback.
      `;

      // Create the parts for the API call
      const audioPart = {
        inlineData: {
          data: audioBase64,
          mimeType: 'audio/m4a'
        }
      };

      // Generate assessment
      const result = await model.generateContent([prompt, audioPart]);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      let assessment;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;
        assessment = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing assessment JSON:', parseError);
        // Fallback assessment
        assessment = {
          fluencyScore: 7,
          clarityScore: 7,
          vocabularyScore: 7,
          grammarScore: 7,
          overallScore: 7,
          strengths: ["Good attempt at communication"],
          areasForImprovement: ["Continue practicing"],
          feedback: "Assessment could not be fully processed, but keep practicing your speaking skills!",
          suggestions: ["Practice speaking regularly", "Focus on clear pronunciation"]
        };
      }

      // Clean up the audio file
      try {
        await FileSystem.deleteAsync(audioUri);
      } catch (cleanupError) {
        console.warn('Could not delete audio file:', cleanupError);
      }

      return assessment;

    } catch (error) {
      console.error('Error assessing audio:', error);
      
      // Return a fallback assessment
      return {
        fluencyScore: 6,
        clarityScore: 6,
        vocabularyScore: 6,
        grammarScore: 6,
        overallScore: 6,
        strengths: ["Participated in the discussion"],
        areasForImprovement: ["Keep practicing"],
        feedback: "Technical issues prevented full assessment. Keep practicing your speaking skills!",
        suggestions: ["Practice speaking English daily", "Record yourself speaking"]
      };
    }
  }

  async transcribeAudio(audioUri) {
    try {
      if (!this.genAI) {
        throw new Error('Gemini AI not initialized');
      }

      // Convert audio to base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = "Please transcribe this audio recording accurately. Provide only the transcribed text.";

      const audioPart = {
        inlineData: {
          data: audioBase64,
          mimeType: 'audio/m4a'
        }
      };

      const result = await model.generateContent([prompt, audioPart]);
      const response = await result.response;
      const transcription = response.text();

      return transcription.trim();

    } catch (error) {
      console.error('Error transcribing audio:', error);
      return "Could not transcribe audio";
    }
  }

  isCurrentlyRecording() {
    return this.isRecording;
  }

  async cleanup() {
    try {
      if (this.isRecording && this.recording) {
        await this.recording.stopAndUnloadAsync();
      }
      
      if (this.recordingUri) {
        try {
          await FileSystem.deleteAsync(this.recordingUri);
        } catch (error) {
          console.warn('Could not delete recording file:', error);
        }
      }

      this.recording = null;
      this.isRecording = false;
      this.recordingUri = null;
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default new AudioAssessmentService();