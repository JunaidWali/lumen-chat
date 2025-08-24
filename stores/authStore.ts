import { create } from "zustand";
import { User } from "../types/chat.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Actions
  setUser: (user) => set({ user }),
  setIsAuthenticated: (authenticated) =>
    set({ isAuthenticated: authenticated }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  signOut: () => set({ user: null, isAuthenticated: false }),
}));
