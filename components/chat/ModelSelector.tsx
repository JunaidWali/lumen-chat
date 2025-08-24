import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { GEMINI_MODELS } from "../../lib/gemini";
import { GeminiModel } from "../../types/chat.types";

interface ModelSelectorProps {
  selectedModel: GeminiModel;
  onModelSelect: (model: GeminiModel) => void;
  webSearchEnabled: boolean;
  onWebSearchToggle: (enabled: boolean) => void;
  temperature: number;
  onTemperatureChange: (temperature: number) => void;
}

export function ModelSelector({
  selectedModel,
  onModelSelect,
  webSearchEnabled,
  onWebSearchToggle,
  temperature,
  onTemperatureChange,
}: ModelSelectorProps) {
  const [isVisible, setIsVisible] = useState(false);

  const ModelCard = ({ model }: { model: GeminiModel }) => {
    const isSelected = model.id === selectedModel.id;

    return (
      <Pressable
        onPress={() => {
          onModelSelect(model);
          setIsVisible(false);
        }}
        className={`p-4 rounded-xl border-2 mb-3 ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
        }`}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text
              className={`text-lg font-semibold mb-1 ${
                isSelected ? "text-blue-700" : "text-gray-900"
              }`}
            >
              {model.displayName}
            </Text>

            <Text className="text-sm text-gray-600 mb-3">
              {model.description}
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {model.supportImages && (
                <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full">
                  <Ionicons name="image" size={12} color="#059669" />
                  <Text className="text-xs text-green-700 ml-1">Images</Text>
                </View>
              )}

              {model.supportWebSearch && (
                <View className="flex-row items-center bg-purple-100 px-2 py-1 rounded-full">
                  <Ionicons name="search" size={12} color="#7c3aed" />
                  <Text className="text-xs text-purple-700 ml-1">
                    Web Search
                  </Text>
                </View>
              )}

              <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
                <Ionicons name="flash" size={12} color="#6b7280" />
                <Text className="text-xs text-gray-700 ml-1">
                  {model.maxTokens > 100000
                    ? "1M+"
                    : `${Math.floor(model.maxTokens / 1000)}K`}{" "}
                  tokens
                </Text>
              </View>
            </View>
          </View>

          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
          )}
        </View>
      </Pressable>
    );
  };

  const TemperatureSlider = () => {
    const temperatureValues = [0.1, 0.3, 0.5, 0.7, 0.9, 1.0];

    return (
      <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Temperature: {temperature}
        </Text>
        <Text className="text-sm text-gray-600 mb-4">
          Controls creativity vs accuracy. Lower values are more focused, higher
          values are more creative.
        </Text>

        <View className="flex-row justify-between">
          {temperatureValues.map((value) => (
            <Pressable
              key={value}
              onPress={() => onTemperatureChange(value)}
              className={`flex-1 py-2 mx-1 rounded-lg ${
                temperature === value ? "bg-blue-500" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  temperature === value ? "text-white" : "text-gray-700"
                }`}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <Pressable
        onPress={() => setIsVisible(true)}
        className="flex-row items-center bg-white border border-gray-200 rounded-full px-4 py-2 mx-4 mb-4"
      >
        <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-900">
            {selectedModel.displayName}
          </Text>
          <View className="flex-row items-center mt-1">
            {selectedModel.supportImages && (
              <Ionicons name="image" size={12} color="#666" />
            )}
            {selectedModel.supportWebSearch && webSearchEnabled && (
              <Ionicons
                name="search"
                size={12}
                color="#666"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
        <Ionicons name="chevron-down" size={16} color="#666" />
      </Pressable>

      {/* Settings Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="bg-white border-b border-gray-200 px-4 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">
                Model Settings
              </Text>
              <Pressable
                onPress={() => setIsVisible(false)}
                className="p-2 rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={20} color="#666" />
              </Pressable>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Web Search Toggle */}
            {selectedModel.supportWebSearch && (
              <View className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">
                      Web Search
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Allow the AI to search the web for current information
                    </Text>
                  </View>
                  <Switch
                    value={webSearchEnabled}
                    onValueChange={onWebSearchToggle}
                    trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
                    thumbColor={webSearchEnabled ? "#ffffff" : "#ffffff"}
                  />
                </View>
              </View>
            )}

            {/* Temperature Control */}
            <TemperatureSlider />

            {/* Model Selection */}
            <View className="bg-white p-4 rounded-xl border border-gray-200">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Select Model
              </Text>

              {GEMINI_MODELS.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
