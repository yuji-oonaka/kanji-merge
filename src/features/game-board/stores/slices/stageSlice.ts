import { StateCreator } from 'zustand';
import { JukugoDefinition, DifficultyMode } from '@/features/kanji-core/types';
import { BADGES, STAGES_PER_BADGE } from '@/features/collection/data/badges';
import jukugoDataRaw from '@/features/kanji-core/data/jukugo-db-auto.json';

const jukugoData = jukugoDataRaw as JukugoDefinition[];

export const TOTAL_STAGES = 405; 

export interface StageSlice {
  // ... (ここは変更なし)
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
  loopCount: number;
  playlist: string[]; // IDリスト

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
  incrementLoop: () => void;
  generatePlaylist: () => void;
}

export const createStageSlice: StateCreator<StageSlice> = (set, get) => ({
  // ... (初期値などは変更なし) ...
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
  loopCount: 1,
  playlist: [],

  // ... (既存のアクションはそのまま) ...
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
  incrementLoop: () => {
    set((state) => ({
      loopCount: state.loopCount + 1,
      levelIndex: 0,
      maxReachedLevel: 0,
      isCleared: false,
    }));
    get().generatePlaylist();
  },

  // ★修正箇所: generatePlaylist
  generatePlaylist: () => {
    const poolByDiff: Record<number, JukugoDefinition[]> = {};
    for (let d = 1; d <= 10; d++) poolByDiff[d] = [];
    
    jukugoData.forEach(item => {
      const diff = Math.min(10, Math.max(1, item.difficulty));
      poolByDiff[diff].push(item);
    });

    const shuffle = <T>(array: T[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };
    Object.values(poolByDiff).forEach(list => shuffle(list));

    const newPlaylist: string[] = [];
    
    const popProblem = (targetDiff: number): string | null => {
      const searchOrder = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8];
      for (const offset of searchOrder) {
        const d = targetDiff + offset;
        if (d >= 1 && d <= 10 && poolByDiff[d].length > 0) {
          return poolByDiff[d].pop()!.id;
        }
      }
      return null;
    };

    for (let i = 0; i < TOTAL_STAGES; i++) {
      // ★★★ チュートリアルIDを強制挿入 ★★★
      if (i === 0) { newPlaylist.push("tutorial-01"); continue; }
      if (i === 1) { newPlaylist.push("tutorial-02"); continue; }
      if (i === 2) { newPlaylist.push("tutorial-03"); continue; }
      // ★★★★★★★★★★★★★★★★★★★★★

      let targetDiff = 1;
      if (i < 30) {
        targetDiff = 2 + Math.floor((i - 5) / 12); 
      } else {
        const progress = (i - 30) / (TOTAL_STAGES - 30);
        const baseDiff = 3.5 + (progress * 6.5);
        const wave = Math.sin(i * (Math.PI / 10)) * 1.5;
        targetDiff = Math.round(baseDiff + wave);
      }
      targetDiff = Math.max(1, Math.min(10, targetDiff));

      const id = popProblem(targetDiff);
      if (!id) {
        const randomFallback = jukugoData[Math.floor(Math.random() * jukugoData.length)].id;
        newPlaylist.push(randomFallback);
      } else {
        newPlaylist.push(id);
      }
    }

    set({ playlist: newPlaylist });
  },
});