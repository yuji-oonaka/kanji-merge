import { StateCreator } from 'zustand';
import { JukugoDefinition, DifficultyMode } from '@/features/kanji-core/types';
import { BADGES, STAGES_PER_BADGE } from '@/features/collection/data/badges';

export interface StageSlice {
  levelIndex: number;
  maxReachedLevel: number;
  currentJukugo: JukugoDefinition | null;
  isCleared: boolean;
  filledIndices: number[];
  historyIds: string[];
  difficultyMode: DifficultyMode;

  hintLevel: number;
  lastActionTime: number;

  gaugeCurrent: number;
  unlockedBadgeCount: number;

  setLevelIndex: (index: number) => void;
  setStage: (jukugo: JukugoDefinition) => void;
  setCleared: (cleared: boolean) => void;
  checkAndFillSlot: (char: string) => boolean;
  resetStage: () => void;
  setDifficultyMode: (mode: DifficultyMode) => void;
  updateLastActionTime: () => void;
  incrementHintLevel: () => void;
  
  addGaugeProgress: () => void;
  // ★追加: ゲージを消費してバッジを確定させるアクション
  resolveBadge: () => void;
}

export const createStageSlice: StateCreator<StageSlice> = (set, get) => ({
  levelIndex: 0,
  maxReachedLevel: 0,
  currentJukugo: null,
  isCleared: false,
  filledIndices: [],
  historyIds: [],
  difficultyMode: 'NORMAL',
  hintLevel: 0,
  lastActionTime: Date.now(),

  gaugeCurrent: 0,
  unlockedBadgeCount: 0,

  setLevelIndex: (index) => set({ levelIndex: index }),

  setStage: (jukugo) => {
    const { historyIds } = get();
    const newHistory = [...historyIds, jukugo.id].slice(-50);
    set({ 
      currentJukugo: jukugo, 
      isCleared: false, 
      filledIndices: [],
      historyIds: newHistory,
      hintLevel: 0,
      lastActionTime: Date.now(),
    });
  },

  setCleared: (cleared) => {
    const state = get();
    if (cleared && !state.isCleared) {
      if (state.levelIndex >= state.maxReachedLevel) {
        set({ isCleared: cleared, maxReachedLevel: state.levelIndex + 1 });
        get().addGaugeProgress();
        return;
      }
    }
    set({ isCleared: cleared });
  },

  checkAndFillSlot: (char) => {
    const state = get();
    if (!state.currentJukugo) return false;

    set({ lastActionTime: Date.now() });

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

  resetStage: () => set({ 
    isCleared: false, 
    filledIndices: [],
    hintLevel: 0, 
    lastActionTime: Date.now() 
  }),

  setDifficultyMode: (mode) => set({ difficultyMode: mode }),

  updateLastActionTime: () => set({ lastActionTime: Date.now() }),
  incrementHintLevel: () => set((state) => ({ hintLevel: Math.min(state.hintLevel + 1, 3) })),

  addGaugeProgress: () => {
    const state = get();
    if (state.unlockedBadgeCount >= BADGES.length) return;

    // ★修正: ここではリセットせず、上限(10)で止める
    // リセット(resolveBadge)はUI側のアニメーション後に行う
    const nextGauge = Math.min(state.gaugeCurrent + 1, STAGES_PER_BADGE);
    set({ gaugeCurrent: nextGauge });
  },

  // ★追加: 満タン時の確定処理
  resolveBadge: () => {
    const state = get();
    if (state.gaugeCurrent >= STAGES_PER_BADGE) {
      set({
        gaugeCurrent: 0,
        unlockedBadgeCount: Math.min(state.unlockedBadgeCount + 1, BADGES.length)
      });
    }
  }
});