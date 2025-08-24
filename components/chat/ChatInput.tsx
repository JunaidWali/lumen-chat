import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { audioService } from "../../utils/audioService";
import { imageService } from "../../utils/imageService";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (message: string, images?: string[], audioUri?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = async () => {
    if (!value.trim() && selectedImages.length === 0) return;

    const messageText = value.trim();
    const images = selectedImages.length > 0 ? selectedImages : undefined;

    onSend(messageText, images);
    onChangeText("");
    setSelectedImages([]);

    // Add haptic feedback
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleImagePicker = () => {
    Alert.alert("Select Image", "Choose how you want to add an image", [
      {
        text: "Camera",
        onPress: async () => {
          try {
            const result = await imageService.takePhoto();
            if (result) {
              const compressedUri = await imageService.compressImage(
                result.uri
              );
              setSelectedImages((prev) => [...prev, compressedUri]);
            }
          } catch (error) {
            Alert.alert("Error", "Failed to take photo");
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          try {
            const results = await imageService.pickFromLibrary();
            if (results.length > 0) {
              const compressedImages = await Promise.all(
                results.map((result) => imageService.compressImage(result.uri))
              );
              setSelectedImages((prev) => [...prev, ...compressedImages]);
            }
          } catch (error) {
            Alert.alert("Error", "Failed to pick images");
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleMicPress = async () => {
    if (isRecording) {
      // Stop recording
      try {
        setIsRecording(false);
        const recording = await audioService.stopRecording();

        if (recording) {
          setIsTranscribing(true);
          try {
            const transcription = await audioService.transcribeAudio(
              recording.uri
            );
            onChangeText(value + (value ? " " : "") + transcription);
          } catch (error) {
            Alert.alert("Error", "Failed to transcribe audio");
          } finally {
            setIsTranscribing(false);
          }
        }
      } catch (error) {
        Alert.alert("Error", "Failed to stop recording");
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        await audioService.startRecording();
        setIsRecording(true);

        if (Platform.OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to start recording");
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend =
    (value.trim().length > 0 || selectedImages.length > 0) && !disabled;

  return (
    <View className="bg-white px-4 py-2">
      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <View className="flex-row mb-3 gap-2">
          {selectedImages.map((imageUri, index) => (
            <View key={index} className="relative">
              <Image
                source={{ uri: imageUri }}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
              />
              <Pressable
                onPress={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
              >
                <Ionicons name="close" size={12} color="white" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row items-end gap-3">
        {/* Attachment Button */}
        <Pressable
          onPress={handleImagePicker}
          disabled={disabled}
          className="p-2 rounded-full bg-gray-100"
        >
          <Ionicons name="image-outline" size={24} color="#666" />
        </Pressable>

        {/* Text Input */}
        <View className="flex-1 min-h-[44px] max-h-[100px] bg-gray-100 rounded-full px-4 justify-center">
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#666"
            multiline
            textAlignVertical="center"
            className="text-base text-gray-900 py-2"
            editable={!disabled}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
        </View>

        {/* Voice/Send Button */}
        <Pressable
          onPress={canSend ? handleSend : handleMicPress}
          onLongPress={!canSend ? handleMicPress : undefined}
          disabled={disabled || isTranscribing}
          className={`p-3 rounded-full ${
            canSend ? "bg-blue-500" : isRecording ? "bg-red-500" : "bg-gray-100"
          }`}
        >
          {isTranscribing ? (
            <ActivityIndicator size={20} color="white" />
          ) : canSend ? (
            <Ionicons name="send" size={20} color="white" />
          ) : isRecording ? (
            <Ionicons name="stop" size={20} color="white" />
          ) : (
            <Ionicons name="mic-outline" size={20} color="#666" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
