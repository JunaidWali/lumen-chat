import { createClient } from "@supabase/supabase-js";

// These should be replaced with your actual Supabase URL and anon key
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://demo.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "demo-key-replace-with-actual-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for database operations
export const conversationsApi = {
  async getAll(userId: string) {
    // Mock data for demo purposes - return sample conversations
    const mockConversations = [
      {
        id: "conv-1",
        title: "Getting Started with AI",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        user_id: userId,
        message_count: 4,
        last_message: "Thanks for helping me understand AI basics!",
      },
      {
        id: "conv-2",
        title: "Creative Writing Ideas",
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        user_id: userId,
        message_count: 6,
        last_message: "These story ideas are fantastic!",
      },
    ];

    // Return empty array for demo if no userId matches
    return userId === "temp-user" ? mockConversations : [];
  },

  async create(conversation: any) {
    // Mock implementation
    const mockConversation = {
      id: `conv-${Date.now()}`,
      title: conversation.title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: conversation.user_id,
      message_count: conversation.message_count || 0,
      last_message: conversation.last_message,
    };
    return mockConversation;
  },

  async update(id: string, updates: any) {
    // Mock implementation
    return {
      id,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  },

  async delete(id: string) {
    // Mock implementation
    return;
  },
};

export const messagesApi = {
  async getByConversation(conversationId: string) {
    // Mock data for demo purposes - return sample messages
    const mockMessagesData: { [key: string]: any[] } = {
      "conv-1": [
        {
          id: "msg-1",
          conversation_id: "conv-1",
          content: "Hello! Can you explain what artificial intelligence is?",
          role: "user",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          images: null,
          audio_url: null,
        },
        {
          id: "msg-2",
          conversation_id: "conv-1",
          content:
            "Artificial Intelligence (AI) is a branch of computer science that aims to create machines capable of performing tasks that typically require human intelligence. This includes learning, reasoning, problem-solving, perception, and language understanding.",
          role: "assistant",
          created_at: new Date(Date.now() - 86340000).toISOString(),
          images: null,
          audio_url: null,
        },
        {
          id: "msg-3",
          conversation_id: "conv-1",
          content:
            "That's really interesting! What are some practical applications?",
          role: "user",
          created_at: new Date(Date.now() - 86280000).toISOString(),
          images: null,
          audio_url: null,
        },
        {
          id: "msg-4",
          conversation_id: "conv-1",
          content:
            "AI has many practical applications including: virtual assistants (like me!), recommendation systems, autonomous vehicles, medical diagnosis, fraud detection, language translation, and image recognition. It's becoming increasingly integrated into everyday technology!",
          role: "assistant",
          created_at: new Date(Date.now() - 86220000).toISOString(),
          images: null,
          audio_url: null,
        },
      ],
      "conv-2": [
        {
          id: "msg-5",
          conversation_id: "conv-2",
          content: "I need some creative writing prompts for a short story.",
          role: "user",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          images: null,
          audio_url: null,
        },
        {
          id: "msg-6",
          conversation_id: "conv-2",
          content:
            "Here are some creative writing prompts: 1) A time traveler gets stuck in the wrong century, 2) Someone discovers their shadow has started acting independently, 3) In a world where emotions are currency, someone goes bankrupt, 4) A library where books write themselves based on readers' dreams.",
          role: "assistant",
          created_at: new Date(Date.now() - 172740000).toISOString(),
          images: null,
          audio_url: null,
        },
      ],
    };

    return mockMessagesData[conversationId] || [];
  },

  async create(message: any) {
    // Mock implementation
    const mockMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: message.conversation_id,
      content: message.content,
      role: message.role,
      created_at: new Date().toISOString(),
      images: message.images,
      audio_url: message.audio_url,
    };
    return mockMessage;
  },

  async delete(id: string) {
    // Mock implementation
    return;
  },
};
