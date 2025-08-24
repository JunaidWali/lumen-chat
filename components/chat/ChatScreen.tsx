import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Platform,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { geminiService } from "../../lib/gemini";
import { conversationsApi, messagesApi } from "../../lib/supabase";
import { useChatStore } from "../../stores/chatStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { Message } from "../../types/chat.types";
import { generateId } from "../../utils/helpers";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { ModelSelector } from "./ModelSelector";

interface ChatScreenProps {
  conversationId?: string;
}

export function ChatScreen({ conversationId }: ChatScreenProps) {
  const [inputText, setInputText] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isLoading,
    isTyping,
    setMessages,
    addMessage,
    setIsLoading,
    setIsTyping,
    activeConversationId,
    setActiveConversation,
    addConversation,
    updateConversation,
    conversations,
  } = useChatStore();

  const {
    selectedModel,
    temperature,
    webSearchEnabled,
    setSelectedModel,
    setTemperature,
    setWebSearchEnabled,
  } = useSettingsStore();

  // Handle keyboard events for better scroll behavior
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        const newKeyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(newKeyboardHeight);

        // Multiple attempts to ensure scroll to bottom works
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 150);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      setActiveConversation(conversationId);
    } else {
      setMessages([]);
      setActiveConversation(null);
    }
  }, [conversationId]);

  const loadMessages = async (convId: string) => {
    try {
      setIsLoading(true);
      const messageData = await messagesApi.getByConversation(convId);

      const formattedMessages: Message[] = messageData.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.created_at),
        conversationId: msg.conversation_id,
        images: msg.images || undefined,
        audioUrl: msg.audio_url || undefined,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      Alert.alert("Error", "Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (
    content: string,
    images?: string[],
    audioUri?: string
  ) => {
    if (!content.trim() && !images?.length) return;

    try {
      let currentConversationId = activeConversationId;

      // Create new conversation if none exists
      if (!currentConversationId) {
        setIsInitializing(true);
        const newConversation = {
          title: "New Chat",
          user_id: "temp-user", // Replace with actual user ID
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
        setIsInitializing(false);
      }

      // Create user message
      const userMessage: Message = {
        id: generateId(),
        content,
        role: "user",
        timestamp: new Date(),
        conversationId: currentConversationId!,
        images,
        audioUrl: audioUri,
      };

      // Save user message to database
      await messagesApi.create({
        id: userMessage.id,
        conversation_id: currentConversationId!,
        content,
        role: "user",
        images: images || null,
        audio_url: audioUri || null,
      });

      addMessage(userMessage);
      setInputText("");

      // Scroll to bottom after adding user message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Generate AI response
      setIsTyping(true);

      try {
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

        // Save assistant message to database
        await messagesApi.create({
          id: assistantMessage.id,
          conversation_id: currentConversationId!,
          content: response,
          role: "assistant",
        });

        addMessage(assistantMessage);

        // Scroll to bottom after adding assistant message
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Update conversation title if it's the first message
        const currentConversation = conversations.find(
          (c) => c.id === currentConversationId
        );
        if (currentConversation && currentConversation.title === "New Chat") {
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
          // Update last message and count
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
        console.error("Failed to generate response:", error);
        Alert.alert("Error", "Failed to get AI response. Please try again.");
      } finally {
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert("Error", "Failed to send message");
      setIsInitializing(false);
      setIsTyping(false);
    }
  };

  const handleImagePress = (imageUri: string) => {
    // TODO: Implement full-screen image viewer
    console.log("Image pressed:", imageUri);
  };

  const handleMessageLongPress = (message: Message) => {
    Alert.alert(
      "Message Options",
      "What would you like to do with this message?",
      [
        {
          text: "Copy",
          onPress: () => console.log("Copy message:", message.content),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      onImagePress={handleImagePress}
      onLongPress={handleMessageLongPress}
    />
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View className="mx-4 mb-4">
        <View className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 self-start max-w-[80%]">
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#666" />
            <Text className="text-gray-600 ml-2">AI is thinking...</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-2xl mb-4">💬</Text>
      <Text className="text-lg font-semibold text-gray-700 mb-2 text-center">
        Start a conversation
      </Text>
      <Text className="text-base text-gray-500 text-center">
        Send a message to begin chatting with {selectedModel.displayName}
      </Text>
    </View>
  );

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Creating conversation...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* Model Selector */}
        <ModelSelector
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          webSearchEnabled={webSearchEnabled}
          onWebSearchToggle={setWebSearchEnabled}
          temperature={temperature}
          onTemperatureChange={setTemperature}
        />

        {/* Messages Container with proper keyboard handling */}
        <View
          className="flex-1"
          style={{
            marginBottom:
              keyboardHeight > 0
                ? Platform.OS === "ios"
                  ? keyboardHeight - 34 + 16
                  : keyboardHeight + 16
                : 0,
          }}
        >
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-600 mt-4">Loading messages...</Text>
            </View>
          ) : messages.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingTop: 16,
                paddingBottom: 100, // Fixed space for input
                flexGrow: 1,
              }}
              onContentSizeChange={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            />
          )}

          {renderTypingIndicator()}
        </View>

        {/* Chat Input - Absolutely positioned at bottom */}
        <View
          style={{
            position: "absolute",
            bottom:
              keyboardHeight > 0
                ? Platform.OS === "ios"
                  ? keyboardHeight - 34 + 16
                  : keyboardHeight + 16
                : 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
          }}
        >
          <ChatInput
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSendMessage}
            disabled={isLoading || isTyping}
            placeholder={`Message ${selectedModel.displayName}...`}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
