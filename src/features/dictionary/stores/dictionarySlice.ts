import { StateCreator } from 'zustand';

export interface DictionarySlice {
  unlockedIds: string[];      // 発見済みの漢字 (例: "日", "明")
  unlockedJukugos: string[];  // ★追加: 発見済みの熟語ID (例: "jukugo-001")
  
  unlockKanji: (char: string) => void;
  unlockJukugo: (id: string) => void; // ★追加
  
  isUnlocked: (char: string) => boolean;
  isJukugoUnlocked: (id: string) => boolean; // ★追加
  
  resetCollection: () => void;
}

export const createDictionarySlice: StateCreator<DictionarySlice> = (set, get) => ({
  unlockedIds: ["日", "月", "木", "山", "石", "田", "力", "艹", "化", "工", "ウ", "イ"], 
  unlockedJukugos: [], // 初期値

  unlockKanji: (char) => {
    const { unlockedIds } = get();
    if (!unlockedIds.includes(char)) {
      console.log(`🎉 New Kanji Discovered: ${char}`);
      set({ unlockedIds: [...unlockedIds, char] });
    }
  },

  unlockJukugo: (id) => {
    const { unlockedJukugos } = get();
    if (!unlockedJukugos.includes(id)) {
      console.log(`🎉 New Jukugo Completed: ${id}`);
      set({ unlockedJukugos: [...unlockedJukugos, id] });
    }
  },

  isUnlocked: (char) => get().unlockedIds.includes(char),
  isJukugoUnlocked: (id) => get().unlockedJukugos.includes(id),

  resetCollection: () => set({ unlockedIds: [], unlockedJukugos: [] }),
});