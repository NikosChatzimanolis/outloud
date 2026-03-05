import { create } from 'zustand';
import { Thread, Message } from '../types';

interface ThreadsState {
  threads: Thread[];
  activeThreadMessages: Message[];
  setThreads: (threads: Thread[]) => void;
  setActiveThreadMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateThreadPreview: (threadId: string, preview: string, lastMessageAt: Date) => void;
}

export const useThreadsStore = create<ThreadsState>((set) => ({
  threads: [],
  activeThreadMessages: [],
  setThreads: (threads) => set({ threads }),
  setActiveThreadMessages: (messages) => set({ activeThreadMessages: messages }),
  addMessage: (message) =>
    set((state) => ({
      activeThreadMessages: [...state.activeThreadMessages, message],
    })),
  updateThreadPreview: (threadId, preview, lastMessageAt) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              lastMessagePreview: preview,
              lastMessageAt: { seconds: Math.floor(lastMessageAt.getTime() / 1000) },
            }
          : t
      ),
    })),
}));
