import { create } from 'zustand';

interface UIState {
  onboardingCompleted: boolean;
  setOnboardingCompleted: (value: boolean) => void;
  toast: { message: string; type?: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  onboardingCompleted: false,
  setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
  toast: null,
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
