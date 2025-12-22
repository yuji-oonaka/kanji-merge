import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DictionaryState {
  unlockedIds: string[];
  unlockedJukugos: string[];
  
  unlockKanji: (char: string) => void;
  unlockJukugo: (id: string) => void;
  isUnlocked: (char: string) => boolean;
  isJukugoUnlocked: (id: string) => boolean;
  resetCollection: () => void;
}

export const useDictionaryStore = create<DictionaryState>()(
  persist(
    (set, get) => ({
      // ★重要: 必ず空配列で初期化
      unlockedIds: ["日", "月", "木", "山", "石", "田", "力", "艹", "化", "工", "ウ", "イ"], 
      unlockedJukugos: [],

      unlockKanji: (char) => {
        if (char.startsWith('&')) return;
        const { unlockedIds } = get();
        // ★安全策
        const safeIds = Array.isArray(unlockedIds) ? unlockedIds : [];
        if (!safeIds.includes(char)) {
          set({ unlockedIds: [...safeIds, char] });
        }
      },

      unlockJukugo: (id) => {
        const { unlockedJukugos } = get();
        // ★安全策
        const safeJukugos = Array.isArray(unlockedJukugos) ? unlockedJukugos : [];
        if (!safeJukugos.includes(id)) {
          set({ unlockedJukugos: [...safeJukugos, id] });
        }
      },

      isUnlocked: (char) => {
        const ids = get().unlockedIds;
        return Array.isArray(ids) && ids.includes(char);
      },
      isJukugoUnlocked: (id) => {
        const jukugos = get().unlockedJukugos;
        return Array.isArray(jukugos) && jukugos.includes(id);
      },

      resetCollection: () => set({ unlockedIds: [], unlockedJukugos: [] }),
    }),
    {
      name: 'kanji-merge-collection',
    }
  )
);