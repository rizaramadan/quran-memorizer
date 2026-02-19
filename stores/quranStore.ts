import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuranStore {
  currentSpread: number;
  setCurrentSpread: (spread: number) => void;
  activeAyah: { surah: number; ayah: number } | null;
  setActiveAyah: (surah: number, ayah: number) => void;
  clearActiveAyah: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  bookmarks: string[]; // "surah:ayah" keys
  toggleBookmark: (surah: number, ayah: number) => void;
}

export const useQuranStore = create<QuranStore>()(
  persist(
    (set) => ({
      currentSpread: 0,
      setCurrentSpread: (spread) => set({ currentSpread: spread }),
      activeAyah: null,
      setActiveAyah: (surah, ayah) => set({ activeAyah: { surah, ayah } }),
      clearActiveAyah: () => set({ activeAyah: null }),
      isDarkMode: false,
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      bookmarks: [],
      toggleBookmark: (surah, ayah) => set((s) => {
        const key = `${surah}:${ayah}`;
        const has = s.bookmarks.includes(key);
        return { bookmarks: has ? s.bookmarks.filter((b) => b !== key) : [...s.bookmarks, key] };
      }),
    }),
    {
      name: 'quran-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
