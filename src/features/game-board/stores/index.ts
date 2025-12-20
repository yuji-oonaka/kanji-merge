import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartsSlice, createPartsSlice } from './slices/partsSlice';
import { StageSlice, createStageSlice } from './slices/stageSlice';
// ★削除: DictionarySlice は独立したので、ここでのインポートは不要です
// import { DictionarySlice, createDictionarySlice } from '@/features/dictionary/stores/dictionarySlice';
import { ThemeSlice, createThemeSlice } from './slices/themeSlice';

// ▼ 修正: DictionarySlice を型から削除
type GameStore = PartsSlice & StageSlice & ThemeSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createPartsSlice(...a),
      ...createStageSlice(...a),
      // ★削除: createDictionarySlice(...a) も削除
      ...createThemeSlice(...a),
    }),
    {
      name: 'kanji-merge-storage',
      partialize: (state) => ({ 
        // ★修正: ここにあった unlockedIds, unlockedJukugos を削除
        // (これらは独立した dictionarySlice 側で保存されるようになりました)
        
        levelIndex: state.levelIndex,
        maxReachedLevel: state.maxReachedLevel,
        historyIds: state.historyIds,
        currentTheme: state.currentTheme,
      }),
    }
  )
);