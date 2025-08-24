export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  conversationId: string;
  images?: string[];
  audioUrl?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  messageCount: number;
  lastMessage?: string;
}

export interface GeminiModel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  supportImages: boolean;
  supportWebSearch: boolean;
  maxTokens: number;
}

export interface ChatSettings {
  selectedModel: GeminiModel;
  temperature: number;
  maxTokens: number;
  webSearchEnabled: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AudioRecording {
  uri: string;
  duration: number;
  size: number;
}
