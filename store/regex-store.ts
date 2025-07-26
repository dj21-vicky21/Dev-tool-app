import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RegexPattern {
  name: string;
  pattern: string;
  description: string;
  example: string;
}

interface RegexStore {
  savedPatterns: RegexPattern[];
  addPattern: (pattern: RegexPattern) => void;
  removePattern: (index: number) => void;
  clearPatterns: () => void;
}

export const useRegexStore = create<RegexStore>()(
  persist(
    (set) => ({
      savedPatterns: [],
      addPattern: (pattern) =>
        set((state) => ({
          savedPatterns: [...state.savedPatterns, pattern],
        })),
      removePattern: (index) =>
        set((state) => ({
          savedPatterns: state.savedPatterns.filter((_, i) => i !== index),
        })),
      clearPatterns: () =>
        set({
          savedPatterns: [],
        }),
    }),
    {
      name: 'regex-patterns-storage',
    }
  )
); 