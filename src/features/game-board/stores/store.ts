import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartsSlice, createPartsSlice } from './slices/partsSlice';
import { StageSlice, createStageSlice } from './slices/stageSlice';
import { DictionarySlice, createDictionarySlice } from '@/features/dictionary/stores/dictionarySlice';
import { EffectSlice, createEffectSlice } from './slices/effectSlice';
// ▼ 追加
import { ThemeSlice, createThemeSlice } from './slices/themeSlice';

// ▼ 型定義に追加
type GameStore = PartsSlice & StageSlice & DictionarySlice & EffectSlice & ThemeSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createPartsSlice(...a),
      ...createStageSlice(...a),
      ...createDictionarySlice(...a),
      ...createEffectSlice(...a),
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
        // ▼ 追加: テーマ設定も保存対象にする
        currentTheme: state.currentTheme,
      }),
    }
  )
);