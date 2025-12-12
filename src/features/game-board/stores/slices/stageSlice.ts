import { StateCreator } from 'zustand';
import { JukugoDefinition } from '@/features/kanji-core/types';

export interface StageSlice {
  levelIndex: number;        // 現在プレイ中のレベル
  maxReachedLevel: number;   // ★追加: 到達した最高レベル
  currentJukugo: JukugoDefinition | null;
  isCleared: boolean;
  filledIndices: number[];
  historyIds: string[];

  setLevelIndex: (index: number) => void;
  setStage: (jukugo: JukugoDefinition) => void;
  setCleared: (cleared: boolean) => void;
  checkAndFillSlot: (char: string) => boolean;
  resetStage: () => void;
}

export const createStageSlice: StateCreator<StageSlice> = (set, get) => ({
  levelIndex: 0,
  maxReachedLevel: 0, // 初期値
  currentJukugo: null,
  isCleared: false,
  filledIndices: [],
  historyIds: [],

  setLevelIndex: (index) => set({ levelIndex: index }),

  setStage: (jukugo) => {
    const { historyIds } = get();
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
    // クリアした時、もし現在レベルが最高到達点なら更新する
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

    const targetIndex = state.currentJukugo.components.findIndex(
      (c, idx) => c === char && !state.filledIndices.includes(idx)
    );

    if (targetIndex !== -1) {
      const newFilled = [...state.filledIndices, targetIndex];
      set({ filledIndices: newFilled });
      if (newFilled.length === state.currentJukugo.components.length) {
        // ここで setCleared を呼ぶことで maxReachedLevel 更新ロジックが走る
        get().setCleared(true);
      }
      return true;
    }
    return false;
  },

  resetStage: () => set({ isCleared: false, filledIndices: [] }),
});