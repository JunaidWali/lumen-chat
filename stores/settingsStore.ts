import { create } from "zustand";
import { GEMINI_MODELS } from "../lib/gemini";
import { GeminiModel } from "../types/chat.types";

interface SettingsState {
  // Model settings
  selectedModel: GeminiModel;
  temperature: number;
  maxTokens: number;
  webSearchEnabled: boolean;

  // UI settings
  darkMode: boolean;
  fontSize: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;

  // Actions
  setSelectedModel: (model: GeminiModel) => void;
  setTemperature: (temperature: number) => void;
  setMaxTokens: (maxTokens: number) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setFontSize: (size: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  selectedModel: GEMINI_MODELS[0], // Gemini Pro as default
  temperature: 0.7,
  maxTokens: 2048,
  webSearchEnabled: false,
  darkMode: false,
  fontSize: 16,
  soundEnabled: true,
  hapticEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  // Initial state
  ...defaultSettings,

  // Actions
  setSelectedModel: (model) => set({ selectedModel: model }),
  setTemperature: (temperature) => set({ temperature }),
  setMaxTokens: (maxTokens) => set({ maxTokens }),
  setWebSearchEnabled: (enabled) => set({ webSearchEnabled: enabled }),
  setDarkMode: (enabled) => set({ darkMode: enabled }),
  setFontSize: (size) => set({ fontSize: size }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
  resetToDefaults: () => set(defaultSettings),
}));
