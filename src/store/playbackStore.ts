import { create } from 'zustand';
import { Message } from '../types';

interface PlaybackItem {
  message: Message;
  senderName: string;
}

interface PlaybackState {
  current: PlaybackItem | null;
  queue: PlaybackItem[];
  isPlaying: boolean;
  setCurrent: (item: PlaybackItem | null) => void;
  setQueue: (items: PlaybackItem[]) => void;
  enqueue: (item: PlaybackItem) => void;
  setPlaying: (playing: boolean) => void;
  dismiss: () => void;
  replay: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  current: null,
  queue: [],
  isPlaying: false,
  setCurrent: (current) => set({ current }),
  setQueue: (queue) => set({ queue }),
  enqueue: (item) => set((state) => ({ queue: [...state.queue, item] })),
  setPlaying: (isPlaying) => set({ isPlaying }),
  dismiss: () => set({ current: null, isPlaying: false }),
  replay: () => set({ isPlaying: true }),
}));
