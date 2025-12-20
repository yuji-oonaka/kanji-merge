import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartsSlice, createPartsSlice } from './slices/partsSlice';
import { StageSlice, createStageSlice } from './slices/stageSlice';
// ★削除: DictionarySlice は独立したのでここからは消す
import { EffectSlice, createEffectSlice } from './slices/effectSlice';
import { ThemeSlice, createThemeSlice } from './slices/themeSlice';

// ▼ 型定義: DictionarySlice を削除
type GameStore = PartsSlice & StageSlice & EffectSlice & ThemeSlice & {
  resetSaveData: () => void;
};

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createPartsSlice(...a),
      ...createStageSlice(...a),
      // ★削除: createDictionarySlice はもう使わない
      ...createEffectSlice(...a),
      ...createThemeSlice(...a),

      // ▼ リセット機能
      resetSaveData: () => {
        // 1. ゲーム進行データの削除
        localStorage.removeItem('kanji-merge-storage');
        
        // 2. 図鑑データの削除 (キー名は dictionarySlice.ts で設定したもの)
        localStorage.removeItem('kanji-merge-collection');
        
        // 3. リロード
        window.location.reload();
      },
    }),
    {
      name: 'kanji-merge-storage',
      partialize: (state) => ({ 
        // ★削除: 図鑑データはここでは保存しない
        
        // StageSliceの保存対象
        levelIndex: state.levelIndex, 
        maxReachedLevel: state.maxReachedLevel,
        historyIds: state.historyIds, 
        
        // ThemeSliceの保存対象
        currentTheme: state.currentTheme,
      }),
    }
  )
);