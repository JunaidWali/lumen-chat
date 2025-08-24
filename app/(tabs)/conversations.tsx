import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConversationList } from "../../components/chat/ConversationList";
import { conversationsApi } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";
import { useChatStore } from "../../stores/chatStore";
import { Conversation } from "../../types/chat.types";

export default function ConversationsTab() {
  const [loading, setLoading] = useState(true);

  const {
    conversations,
    setConversations,
    deleteConversation,
    addConversation,
    activeConversationId,
    setActiveConversation,
    clearMessages,
  } = useChatStore();

  const { user } = useAuthStore();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // For now, use a temporary user ID. In a real app, this would come from authentication
      const tempUserId = user?.id || "temp-user";
      const conversationData = await conversationsApi.getAll(tempUserId);

      const formattedConversations: Conversation[] = conversationData.map(
        (conv) => ({
          id: conv.id,
          title: conv.title,
          createdAt: new Date(conv.created_at),
          updatedAt: new Date(conv.updated_at),
          userId: conv.user_id,
          messageCount: conv.message_count,
          lastMessage: conv.last_message || undefined,
        })
      );

      setConversations(formattedConversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      Alert.alert("Error", "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    setActiveConversation(conversation.id);
    router.push("/(tabs)");
  };

  const handleConversationDelete = async (conversationId: string) => {
    try {
      await conversationsApi.delete(conversationId);
      deleteConversation(conversationId);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      Alert.alert("Error", "Failed to delete conversation");
    }
  };

  const handleNewChat = () => {
    setActiveConversation(null);
    clearMessages();
    router.push("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onConversationPress={handleConversationPress}
        onConversationDelete={handleConversationDelete}
        onNewChat={handleNewChat}
        loading={loading}
      />
    </SafeAreaView>
  );
}
