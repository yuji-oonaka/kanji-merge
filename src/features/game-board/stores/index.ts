import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartsSlice, createPartsSlice } from './slices/partsSlice';
import { StageSlice, createStageSlice } from './slices/stageSlice';
import { DictionarySlice, createDictionarySlice } from '@/features/dictionary/stores/dictionarySlice';
// ▼ 追加
import { ThemeSlice, createThemeSlice } from './slices/themeSlice';

// ▼ 追加
type GameStore = PartsSlice & StageSlice & DictionarySlice & ThemeSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createPartsSlice(...a),
      ...createStageSlice(...a),
      ...createDictionarySlice(...a),
      // ▼ 追加
      ...createThemeSlice(...a),
    }),
    {
      name: 'kanji-merge-storage',
      partialize: (state) => ({ 
        unlockedIds: state.unlockedIds,
        unlockedJukugos: state.unlockedJukugos,
        levelIndex: state.levelIndex,
        maxReachedLevel: state.maxReachedLevel,
        historyIds: state.historyIds,
        // ▼ 追加
        currentTheme: state.currentTheme,
      }),
    }
  )
);