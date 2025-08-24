import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiModel } from "../types/chat.types";

// Replace with your actual API key
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "demo-key-replace-with-actual-gemini-key";

export const GEMINI_MODELS: GeminiModel[] = [
  {
    id: "gemini-pro",
    name: "gemini-pro",
    displayName: "Gemini Pro",
    description:
      "Most capable model for reasoning, planning, and understanding",
    supportImages: false,
    supportWebSearch: false,
    maxTokens: 30720,
  },
  {
    id: "gemini-pro-vision",
    name: "gemini-pro-vision",
    displayName: "Gemini Pro Vision",
    description: "Optimized for visual understanding and multimodal reasoning",
    supportImages: true,
    supportWebSearch: false,
    maxTokens: 30720,
  },
  {
    id: "gemini-1.5-pro",
    name: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    description: "Latest model with enhanced capabilities and longer context",
    supportImages: true,
    supportWebSearch: true,
    maxTokens: 1048576,
  },
  {
    id: "gemini-1.5-flash",
    name: "gemini-1.5-flash",
    displayName: "Gemini 1.5 Flash",
    description: "Faster, lighter model for quick responses",
    supportImages: true,
    supportWebSearch: true,
    maxTokens: 1048576,
  },
];

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private models: Map<string, GenerativeModel> = new Map();

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
  }

  private getModel(modelName: string): GenerativeModel {
    if (!this.models.has(modelName)) {
      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      });
      this.models.set(modelName, model);
    }
    return this.models.get(modelName)!;
  }

  async generateResponse(
    prompt: string,
    modelName: string = "gemini-pro",
    options?: {
      temperature?: number;
      maxTokens?: number;
      images?: string[];
      webSearch?: boolean;
    }
  ): Promise<string> {
    try {
      // Check if we have a valid API key
      if (API_KEY === "demo-key-replace-with-actual-gemini-key") {
        // Return a mock response for demo purposes
        const responses = [
          "This is a mock response from the AI assistant. To get real AI responses, please add your Gemini API key to the environment variables.",
          "Hello! I'm a demo AI assistant. Replace the API key in the .env file to connect to the real Gemini AI.",
          "I'm here to help! This is a simulated response since no API key is configured yet.",
          "Thanks for your message! Please configure your Gemini API key to enable real AI conversations.",
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        return randomResponse + `\n\n(Using ${modelName} model)`;
      }

      const model = this.getModel(modelName);

      // For models that support images
      if (options?.images && options.images.length > 0) {
        const imageParts = await Promise.all(
          options.images.map(async (imageUri) => {
            // Convert image to base64 if needed
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const base64 = await this.blobToBase64(blob);

            return {
              inlineData: {
                data: base64.split(",")[1], // Remove data:image/jpeg;base64, prefix
                mimeType: blob.type,
              },
            };
          })
        );

        const result = await model.generateContent([prompt, ...imageParts]);
        return result.response.text();
      }

      // For text-only prompts
      if (options?.webSearch && modelName.includes("1.5")) {
        // Add web search context to prompt
        const enhancedPrompt = `${prompt}\n\nPlease search the web for current information if needed to provide an accurate and up-to-date response.`;
        const result = await model.generateContent(enhancedPrompt);
        return result.response.text();
      }

      const result = await model.generateContent(prompt);
      return result.response.text();
        return result.response.text();
      }

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to generate response. Please try again.");
    }
  }

  async generateTitle(firstMessage: string): Promise<string> {
    try {
      const model = this.getModel("gemini-pro");
      const prompt = `Generate a short, concise title (3-5 words) for a chat conversation that starts with this message: "${firstMessage}". Only return the title, no quotes or extra text.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Title generation error:", error);
      return "New Chat";
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  getAvailableModels(): GeminiModel[] {
    return GEMINI_MODELS;
  }

  getModelById(id: string): GeminiModel | undefined {
    return GEMINI_MODELS.find((model) => model.id === id);
  }
}

export const geminiService = new GeminiService();
