// src/features/game-board/stores/store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartsSlice, createPartsSlice } from './slices/partsSlice';
import { StageSlice, createStageSlice } from './slices/stageSlice';
import { DictionarySlice, createDictionarySlice } from '@/features/dictionary/stores/dictionarySlice'; // パスは環境に合わせてください
import { EffectSlice, createEffectSlice } from './slices/effectSlice';
import { ThemeSlice, createThemeSlice } from './slices/themeSlice';

// ▼ 型定義に追加: resetSaveData を含める
type GameStore = PartsSlice & StageSlice & DictionarySlice & EffectSlice & ThemeSlice & {
  resetSaveData: () => void;
};

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createPartsSlice(...a),
      ...createStageSlice(...a),
      // もし createDictionarySlice の引数や型が合わない場合は調整してください
      // 基本的には ...a (set, get, api) を渡せばOKです
      ...createDictionarySlice(...a), 
      ...createEffectSlice(...a),
      ...createThemeSlice(...a),

      // ▼ 追加: リセット機能の実装
      resetSaveData: () => {
        // 1. ローカルストレージを削除
        localStorage.removeItem('kanji-merge-storage');
        
        // 2. ページをリロードして、強制的に初期状態（デフォルト値）で再開させる
        // (stateを個別にsetで戻すより、これが一番確実でバグが起きにくいです)
        window.location.reload();
      },
    }),
    {
      name: 'kanji-merge-storage',
      partialize: (state) => ({ 
        unlockedIds: state.unlockedIds,
        unlockedJukugos: state.unlockedJukugos,
        // levelIndex や maxReachedLevel など、StageSliceのプロパティ名に合わせてください
        // StageSliceの定義によりますが、恐らく currentLevel などを保存しているはずです
        levelIndex: state.levelIndex, 
        maxReachedLevel: state.maxReachedLevel,
        historyIds: state.historyIds, 
        currentTheme: state.currentTheme,
      }),
    }
  )
);