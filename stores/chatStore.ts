import { create } from "zustand";
import { Conversation, Message } from "../types/chat.types";

interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;

  // Messages
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;

  setIsLoading: (loading: boolean) => void;
  setIsTyping: (typing: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  isTyping: false,

  // Conversation actions
  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    })),

  deleteConversation: (id) =>
    set((state) => {
      const newConversations = state.conversations.filter(
        (conv) => conv.id !== id
      );
      const newActiveId =
        state.activeConversationId === id ? null : state.activeConversationId;

      return {
        conversations: newConversations,
        activeConversationId: newActiveId,
        messages: newActiveId === null ? [] : state.messages,
      };
    }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  // Message actions
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),

  clearMessages: () => set({ messages: [] }),

  // UI state actions
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsTyping: (typing) => set({ isTyping: typing }),
}));
