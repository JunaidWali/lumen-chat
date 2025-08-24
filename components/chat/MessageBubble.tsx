import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Message } from "../../types/chat.types";
import { formatMessageTime } from "../../utils/helpers";

interface MessageBubbleProps {
  message: Message;
  onImagePress?: (imageUri: string) => void;
  onLongPress?: (message: Message) => void;
}

export function MessageBubble({
  message,
  onImagePress,
  onLongPress,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <Pressable
      onLongPress={() => onLongPress?.(message)}
      className={`mb-4 mx-4 ${isUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-500 rounded-br-md"
            : "bg-gray-100 border border-gray-200 rounded-bl-md"
        }`}
      >
        {/* Images */}
        {message.images && message.images.length > 0 && (
          <View className="mb-2">
            {message.images.length === 1 ? (
              <Pressable onPress={() => onImagePress?.(message.images![0])}>
                <Image
                  source={{ uri: message.images[0] }}
                  className="w-48 h-48 rounded-xl"
                  resizeMode="cover"
                />
              </Pressable>
            ) : (
              <View className="flex-row flex-wrap gap-1">
                {message.images.slice(0, 4).map((imageUri, index) => (
                  <Pressable
                    key={index}
                    onPress={() => onImagePress?.(imageUri)}
                  >
                    <View className="relative">
                      <Image
                        source={{ uri: imageUri }}
                        className="w-20 h-20 rounded-lg"
                        resizeMode="cover"
                      />
                      {message.images!.length > 4 && index === 3 && (
                        <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center">
                          <Text className="text-white font-semibold">
                            +{message.images!.length - 4}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Audio indicator */}
        {message.audioUrl && (
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="volume-medium"
              size={16}
              color={isUser ? "white" : "#666"}
            />
            <Text
              className={`ml-2 text-sm ${
                isUser ? "text-blue-100" : "text-gray-600"
              }`}
            >
              Voice message
            </Text>
          </View>
        )}

        {/* Message text */}
        <Text
          className={`text-base leading-5 ${
            isUser ? "text-white" : "text-gray-900"
          }`}
          selectable
        >
          {message.content}
        </Text>

        {/* Timestamp */}
        <Text
          className={`text-xs mt-2 ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {formatMessageTime(message.timestamp)}
        </Text>
      </View>
    </Pressable>
  );
}
