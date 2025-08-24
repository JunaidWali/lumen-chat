// Mock Audio Service - Replace with actual implementation when needed
import { AudioRecording } from "../types/chat.types";

class AudioService {
  private isRecordingState: boolean = false;

  async requestPermissions(): Promise<boolean> {
    try {
      // For demo purposes, always return true
      // In a real app, you would request actual permissions
      console.log("Audio permissions requested (mock)");
      return true;
    } catch (error) {
      console.error("Error requesting audio permissions:", error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Audio recording permission not granted");
      }

      console.log("Starting audio recording (mock)");
      this.isRecordingState = true;

      // Simulate recording start
      // In a real implementation, you would use expo-audio or react-native-audio-recorder-player
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }

  async stopRecording(): Promise<AudioRecording | null> {
    try {
      if (!this.isRecordingState) {
        return null;
      }

      console.log("Stopping audio recording (mock)");
      this.isRecordingState = false;

      // Return a mock recording
      const mockRecording: AudioRecording = {
        uri: "mock://audio-recording.m4a",
        duration: 5000, // 5 seconds
        size: 128000, // 128KB
      };

      return mockRecording;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      this.isRecordingState = false;
      return null;
    }
  }

  async cancelRecording(): Promise<void> {
    try {
      console.log("Cancelling audio recording (mock)");
      this.isRecordingState = false;
    } catch (error) {
      console.error("Failed to cancel recording:", error);
    }
  }

  isRecording(): boolean {
    return this.isRecordingState;
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    try {
      console.log("Transcribing audio from:", audioUri);

      // Mock transcription responses
      const mockTranscriptions = [
        "Hello, how are you today?",
        "What's the weather like outside?",
        "Can you help me with this task?",
        "Thank you for your assistance.",
        "I need help with my project.",
      ];

      const randomTranscription =
        mockTranscriptions[
          Math.floor(Math.random() * mockTranscriptions.length)
        ];

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return randomTranscription;
    } catch (error) {
      console.error("Transcription failed:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  async playAudio(uri: string): Promise<void> {
    try {
      console.log("Playing audio (mock):", uri);
      // In a real implementation, you would use expo-audio or expo-av
      // For now, just log the action
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  }
}

export const audioService = new AudioService();
