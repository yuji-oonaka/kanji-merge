import { StateCreator } from 'zustand';
import { JukugoDefinition } from '@/features/kanji-core/types';

// ▼ 追加
export type DifficultyMode = 'EASY' | 'NORMAL';

export interface StageSlice {
  levelIndex: number;
  maxReachedLevel: number;
  currentJukugo: JukugoDefinition | null;
  isCleared: boolean;
  filledIndices: number[];
  historyIds: string[];
  difficultyMode: DifficultyMode; // ▼ 追加

  setLevelIndex: (index: number) => void;
  setStage: (jukugo: JukugoDefinition) => void;
  setCleared: (cleared: boolean) => void;
  checkAndFillSlot: (char: string) => boolean;
  resetStage: () => void;
  setDifficultyMode: (mode: DifficultyMode) => void; // ▼ 追加
}

export const createStageSlice: StateCreator<StageSlice> = (set, get) => ({
  levelIndex: 0,
  maxReachedLevel: 0,
  currentJukugo: null,
  isCleared: false,
  filledIndices: [],
  historyIds: [],
  difficultyMode: 'NORMAL', // ▼ 初期値はNORMALにしておきます

  setLevelIndex: (index) => set({ levelIndex: index }),

  // ... (setStage, setCleared, checkAndFillSlot は変更なし) ...
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
        get().setCleared(true);
      }
      return true;
    }
    return false;
  },

  resetStage: () => set({ isCleared: false, filledIndices: [] }),

  // ▼ 追加
  setDifficultyMode: (mode) => set({ difficultyMode: mode }),
});