import { StateCreator } from 'zustand';
import { JukugoDefinition, DifficultyMode } from '@/features/kanji-core/types';
import { BADGES, STAGES_PER_BADGE } from '@/features/collection/data/badges';

// ★修正: 熟語総数に合わせて 405 に設定
export const TOTAL_STAGES = 405; 

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

  // ★追加: ループ（周回）管理
  loopCount: number;

  setLevelIndex: (index: number) => void;
  setStage: (jukugo: JukugoDefinition) => void;
  setCleared: (cleared: boolean) => void;
  checkAndFillSlot: (char: string) => boolean;
  resetStage: () => void;
  setDifficultyMode: (mode: DifficultyMode) => void;
  updateLastActionTime: () => void;
  incrementHintLevel: () => void;
  addGaugeProgress: () => void;
  resolveBadge: () => void;

  // ★追加
  incrementLoop: () => void;
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
  
  // ★追加: 1周目からスタート
  loopCount: 1,

  setLevelIndex: (index) => set({ levelIndex: index }),

  setStage: (jukugo) => {
    const { historyIds } = get();
    // 履歴管理（直近50件）
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
      // 現在の到達度を超えてクリアした場合のみ進行
      if (state.levelIndex >= state.maxReachedLevel) {
        set({ isCleared: cleared, maxReachedLevel: state.levelIndex + 1 });
        // 新規クリアなのでゲージ加算
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
    // ※バッジコンプ後もゲージ演出を楽しみたい場合は、このif文を外してもOKです
    if (state.unlockedBadgeCount >= BADGES.length) return;

    const nextGauge = Math.min(state.gaugeCurrent + 1, STAGES_PER_BADGE);
    set({ gaugeCurrent: nextGauge });
  },

  resolveBadge: () => {
    const state = get();
    if (state.gaugeCurrent >= STAGES_PER_BADGE) {
      set({
        gaugeCurrent: 0,
        unlockedBadgeCount: Math.min(state.unlockedBadgeCount + 1, BADGES.length)
      });
    }
  },

  // ★追加: ループ処理
  incrementLoop: () => {
    set((state) => ({
      loopCount: state.loopCount + 1, // 周回数を増やす
      levelIndex: 0,      // 最初のステージに戻す
      maxReachedLevel: 0, // 進行度もリセット（これで2周目もゲージが溜まるようになる）
      isCleared: false,   // クリア状態解除
      // historyIds は保持（直前の問題と被らないようにするため）
    }));
  },
});