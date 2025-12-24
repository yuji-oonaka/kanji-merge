import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PartsSlice, createPartsSlice } from './slices/partsSlice';
import { StageSlice, createStageSlice } from './slices/stageSlice';
import { EffectSlice, createEffectSlice } from './slices/effectSlice';
import { ThemeSlice, createThemeSlice } from './slices/themeSlice';

// GameStore型は各スライス（StageSliceなど）の合体なので、
// StageSliceにある gaugeCurrent は自動的にここに含まれます。
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
        localStorage.removeItem('kanji-merge-collection');
        window.location.reload();
      },
    }),
    {
      name: 'kanji-merge-storage', // ローカルストレージのキー名
      
      // ★修正: 正しい変数名 (gaugeCurrent) に変更しました
      partialize: (state) => ({ 
        // --- StageSliceの保存対象 ---
        levelIndex: state.levelIndex, 
        maxReachedLevel: state.maxReachedLevel,
        historyIds: state.historyIds,
        difficultyMode: state.difficultyMode,
        
        // ★修正ポイント: experience ではなく gaugeCurrent が正解でした
        gaugeCurrent: state.gaugeCurrent,       // ゲージの現在値
        unlockedBadgeCount: state.unlockedBadgeCount, // 足跡バッジ数
        loopCount: state.loopCount,             // 周回数
        
        // --- ThemeSliceの保存対象 ---
        currentTheme: state.currentTheme,
      }),
    }
  )
);