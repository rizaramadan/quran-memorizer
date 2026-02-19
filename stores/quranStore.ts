import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuranStore {
  currentSpread: number;
  setCurrentSpread: (spread: number) => void;
  activeAyah: { surah: number; ayah: number } | null;
  setActiveAyah: (surah: number, ayah: number) => void;
  clearActiveAyah: () => void;
}

export const useQuranStore = create<QuranStore>()(
  persist(
    (set) => ({
      currentSpread: 0,
      setCurrentSpread: (spread) => set({ currentSpread: spread }),
      activeAyah: null,
      setActiveAyah: (surah, ayah) => set({ activeAyah: { surah, ayah } }),
      clearActiveAyah: () => set({ activeAyah: null }),
    }),
    {
      name: 'quran-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
