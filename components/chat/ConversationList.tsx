import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { Conversation } from "../../types/chat.types";
import { formatConversationTime, truncateText } from "../../utils/helpers";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationPress: (conversation: Conversation) => void;
  onConversationDelete: (conversationId: string) => void;
  onNewChat: () => void;
  loading?: boolean;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onPress: () => void;
  onDelete: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  onPress,
  onDelete,
}: ConversationItemProps) {
  const handleLongPress = () => {
    Alert.alert(
      "Delete Conversation",
      `Are you sure you want to delete "${conversation.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      className={`mx-4 mb-2 p-4 rounded-xl ${
        isActive
          ? "bg-blue-50 border border-blue-200"
          : "bg-white border border-gray-100"
      }`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text
            className={`text-base font-semibold mb-1 ${
              isActive ? "text-blue-700" : "text-gray-900"
            }`}
            numberOfLines={1}
          >
            {conversation.title}
          </Text>

          {conversation.lastMessage && (
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {truncateText(conversation.lastMessage, 100)}
            </Text>
          )}

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-500">
              {formatConversationTime(conversation.updatedAt)}
            </Text>

            {conversation.messageCount > 0 && (
              <View className="flex-row items-center">
                <Ionicons name="chatbubble-outline" size={12} color="#666" />
                <Text className="text-xs text-gray-500 ml-1">
                  {conversation.messageCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={handleLongPress}
          className="p-1 rounded-full"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={16} color="#666" />
        </Pressable>
      </View>
    </Pressable>
  );
}

export function ConversationList({
  conversations,
  activeConversationId,
  onConversationPress,
  onConversationDelete,
  onNewChat,
  loading = false,
}: ConversationListProps) {
  const renderItem = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      isActive={item.id === activeConversationId}
      onPress={() => onConversationPress(item)}
      onDelete={() => onConversationDelete(item.id)}
    />
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
      <Text className="text-lg font-semibold text-gray-700 mt-4 mb-2">
        No conversations yet
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6">
        Start a new conversation to begin chatting with AI
      </Text>
      <Pressable
        onPress={onNewChat}
        className="bg-blue-500 px-6 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">Start New Chat</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">Conversations</Text>
          <Pressable
            onPress={onNewChat}
            className="p-2 rounded-full bg-blue-500"
          >
            <Ionicons name="add" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
