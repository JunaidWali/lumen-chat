import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { geminiService } from "../lib/gemini";
import { conversationsApi, messagesApi } from "../lib/supabase";
import { useChatStore } from "../stores/chatStore";
import { useSettingsStore } from "../stores/settingsStore";
import { Message } from "../types/chat.types";
import { generateId } from "../utils/helpers";

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const {
    messages,
    conversations,
    activeConversationId,
    addMessage,
    addConversation,
    updateConversation,
    setActiveConversation,
  } = useChatStore();

  const { selectedModel, temperature, webSearchEnabled } = useSettingsStore();

  const sendMessage = useCallback(
    async (content: string, images?: string[], audioUri?: string) => {
      if (!content.trim() && !images?.length) return;

      try {
        setIsLoading(true);
        let currentConversationId = activeConversationId;

        // Create new conversation if none exists
        if (!currentConversationId) {
          const newConversation = {
            title: "New Chat",
            user_id: "temp-user",
            message_count: 0,
            last_message: content,
          };

          const createdConversation = await conversationsApi.create(
            newConversation
          );
          currentConversationId = createdConversation.id;

          addConversation({
            id: createdConversation.id,
            title: createdConversation.title,
            createdAt: new Date(createdConversation.created_at),
            updatedAt: new Date(createdConversation.updated_at),
            userId: createdConversation.user_id,
            messageCount: createdConversation.message_count,
            lastMessage: createdConversation.last_message,
          });

          setActiveConversation(currentConversationId);
        }

        // Create and save user message
        const userMessage: Message = {
          id: generateId(),
          content,
          role: "user",
          timestamp: new Date(),
          conversationId: currentConversationId!,
          images,
          audioUrl: audioUri,
        };

        await messagesApi.create({
          id: userMessage.id,
          conversation_id: currentConversationId!,
          content,
          role: "user",
          images: images || null,
          audio_url: audioUri || null,
        });

        addMessage(userMessage);

        // Generate AI response
        setIsTyping(true);

        const response = await geminiService.generateResponse(
          content,
          selectedModel.name,
          {
            temperature,
            images,
            webSearch: webSearchEnabled && selectedModel.supportWebSearch,
          }
        );

        const assistantMessage: Message = {
          id: generateId(),
          content: response,
          role: "assistant",
          timestamp: new Date(),
          conversationId: currentConversationId!,
        };

        await messagesApi.create({
          id: assistantMessage.id,
          conversation_id: currentConversationId!,
          content: response,
          role: "assistant",
        });

        addMessage(assistantMessage);

        // Update conversation
        const currentConversation = conversations.find(
          (c) => c.id === currentConversationId
        );
        if (currentConversation?.title === "New Chat") {
          const newTitle = await geminiService.generateTitle(content);
          await conversationsApi.update(currentConversationId!, {
            title: newTitle,
            last_message: response,
            message_count: 2,
          });

          updateConversation(currentConversationId!, {
            title: newTitle,
            lastMessage: response,
            messageCount: 2,
            updatedAt: new Date(),
          });
        } else if (currentConversation) {
          await conversationsApi.update(currentConversationId!, {
            last_message: response,
            message_count: messages.length + 2,
            updated_at: new Date().toISOString(),
          });

          updateConversation(currentConversationId!, {
            lastMessage: response,
            messageCount: messages.length + 2,
            updatedAt: new Date(),
          });
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        Alert.alert("Error", "Failed to send message");
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [
      activeConversationId,
      selectedModel,
      temperature,
      webSearchEnabled,
      messages.length,
      conversations,
      addMessage,
      addConversation,
      updateConversation,
      setActiveConversation,
    ]
  );

  return {
    sendMessage,
    isLoading,
    isTyping,
  };
}
