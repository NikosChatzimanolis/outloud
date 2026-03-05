import { create } from 'zustand';
import { UserProfile, UserSettings } from '../types';

interface UserState {
  profile: UserProfile | null;
  settings: UserSettings | null;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: UserSettings | null) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  settings: null,
  setProfile: (profile) => set({ profile }),
  setSettings: (settings) => set({ settings }),
  updateSettings: (partial) =>
    set((state) => ({
      settings: state.settings ? { ...state.settings, ...partial } : null,
    })),
}));
