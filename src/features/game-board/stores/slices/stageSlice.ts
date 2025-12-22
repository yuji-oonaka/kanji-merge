import { StateCreator } from 'zustand';
// ★修正: types.ts から DifficultyMode も一緒にインポート
import { JukugoDefinition, DifficultyMode } from '@/features/kanji-core/types';

export interface StageSlice {
  levelIndex: number;
  maxReachedLevel: number;
  currentJukugo: JukugoDefinition | null;
  isCleared: boolean;
  filledIndices: number[];
  historyIds: string[];
  
  // ★追加
  difficultyMode: DifficultyMode;

  setLevelIndex: (index: number) => void;
  setStage: (jukugo: JukugoDefinition) => void;
  setCleared: (cleared: boolean) => void;
  checkAndFillSlot: (char: string) => boolean;
  resetStage: () => void;
  
  // ★追加
  setDifficultyMode: (mode: DifficultyMode) => void;
}

export const createStageSlice: StateCreator<StageSlice> = (set, get) => ({
  levelIndex: 0,
  maxReachedLevel: 0,
  currentJukugo: null,
  isCleared: false,
  filledIndices: [],
  historyIds: [],
  
  // ★追加: デフォルトは NORMAL
  difficultyMode: 'NORMAL',

  setLevelIndex: (index) => set({ levelIndex: index }),

  setStage: (jukugo) => {
    const { historyIds } = get();
    // 履歴は最新50件まで保持
    const newHistory = [...historyIds, jukugo.id].slice(-50);
    set({ 
      currentJukugo: jukugo, 
      isCleared: false, 
      filledIndices: [],
      historyIds: newHistory
    });
  },

  setCleared: (cleared) => {
    const state = get();
    if (cleared) {
      if (state.levelIndex >= state.maxReachedLevel) {
        set({ isCleared: cleared, maxReachedLevel: state.levelIndex + 1 });
        return;
      }
    }
    set({ isCleared: cleared });
  },

  checkAndFillSlot: (char) => {
    const state = get();
    if (!state.currentJukugo) return false;

    // まだ埋まっていないスロットの中で、文字が一致する場所を探す
    const targetIndex = state.currentJukugo.components.findIndex(
      (c, idx) => c === char && !state.filledIndices.includes(idx)
    );

    if (targetIndex !== -1) {
      const newFilled = [...state.filledIndices, targetIndex];
      set({ filledIndices: newFilled });
      
      // 全て埋まったらクリア判定
      if (newFilled.length === state.currentJukugo.components.length) {
        get().setCleared(true);
      }
      return true;
    }
    return false;
  },

  resetStage: () => set({ isCleared: false, filledIndices: [] }),

  // ★追加: 難易度変更の実装
  setDifficultyMode: (mode) => set({ difficultyMode: mode }),
});