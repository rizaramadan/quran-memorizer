import { create } from 'zustand';

interface QuranStore {
  activeAyah: { surah: number; ayah: number } | null;
  setActiveAyah: (surah: number, ayah: number) => void;
  clearActiveAyah: () => void;
}

export const useQuranStore = create<QuranStore>((set) => ({
  activeAyah: null,
  setActiveAyah: (surah, ayah) => set({ activeAyah: { surah, ayah } }),
  clearActiveAyah: () => set({ activeAyah: null }),
}));
