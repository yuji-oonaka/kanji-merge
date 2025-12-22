import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartsSlice, createPartsSlice } from './slices/partsSlice';
import { StageSlice, createStageSlice } from './slices/stageSlice';
import { EffectSlice, createEffectSlice } from './slices/effectSlice';
import { ThemeSlice, createThemeSlice } from './slices/themeSlice';

// DictionarySlice は削除済み
type GameStore = PartsSlice & StageSlice & EffectSlice & ThemeSlice & {
  resetSaveData: () => void;
};

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createPartsSlice(...a),
      ...createStageSlice(...a),
      ...createEffectSlice(...a),
      ...createThemeSlice(...a),

      // ▼ リセット機能
      resetSaveData: () => {
        localStorage.removeItem('kanji-merge-storage');
        // 図鑑データも削除
        localStorage.removeItem('kanji-merge-collection');
        window.location.reload();
      },
    }),
    {
      name: 'kanji-merge-storage',
      partialize: (state) => ({ 
        // StageSliceの保存対象
        levelIndex: state.levelIndex, 
        maxReachedLevel: state.maxReachedLevel,
        historyIds: state.historyIds,
        
        // ★追加: 難易度設定も保存する
        difficultyMode: state.difficultyMode,
        
        // ThemeSliceの保存対象
        currentTheme: state.currentTheme,
      }),
    }
  )
);