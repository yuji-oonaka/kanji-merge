import { StateCreator } from 'zustand';
import { JukugoDefinition, DifficultyMode } from '@/features/kanji-core/types';
import { BADGES, STAGES_PER_BADGE } from '@/features/collection/data/badges';
// ★追加: 自動生成された問題データをインポート
import jukugoDataRaw from '@/features/kanji-core/data/jukugo-db-auto.json';

// 型アサーション（jsonインポート用）
const jukugoData = jukugoDataRaw as JukugoDefinition[];

// ステージ総数
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

  loopCount: number;

  // ★追加: 出題順リスト（IDの配列）
  playlist: string[];

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

  // ★追加: プレイリスト生成アクション
  generatePlaylist: () => void;
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
  loopCount: 1,
  
  // ★初期値は空
  playlist: [],

  setLevelIndex: (index) => set({ levelIndex: index }),

  setStage: (jukugo) => {
    const { historyIds } = get();
    // 履歴は直近50件を残すが、playlistがあれば重複は防げるため補助的な役割になる
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
    // ★周回時にプレイリストも再構築（新しいシャッフルで遊べるように）
    get().generatePlaylist();
  },

  // ★追加: プレイリスト生成ロジック（難易度曲線と波を適用）
  generatePlaylist: () => {
    // 1. 全データを難易度別にバケット分け (Deep Copyしてプールとして使う)
    const poolByDiff: Record<number, JukugoDefinition[]> = {};
    for (let d = 1; d <= 10; d++) {
      poolByDiff[d] = [];
    }

    // データの振り分け
    jukugoData.forEach(item => {
      // 念のため難易度範囲を1-10に収める
      const diff = Math.min(10, Math.max(1, item.difficulty));
      poolByDiff[diff].push(item);
    });

    // 配列をシャッフルするヘルパー
    const shuffle = <T>(array: T[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    // 各バケットをシャッフル
    Object.values(poolByDiff).forEach(list => shuffle(list));

    const newPlaylist: string[] = [];
    
    // ヘルパー: 指定された難易度に近い問題を取り出す
    const popProblem = (targetDiff: number): string | null => {
      // 優先順位: target -> target+1 -> target-1 -> target+2 ...
      const searchOrder = [
        0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8
      ];
      
      for (const offset of searchOrder) {
        const d = targetDiff + offset;
        if (d >= 1 && d <= 10 && poolByDiff[d].length > 0) {
          // 見つかったら取り出してIDを返す
          return poolByDiff[d].pop()!.id;
        }
      }
      return null; // 在庫切れ（通常ありえないが念のため）
    };

    // 2. ステージごとに問題を割り当て
    for (let i = 0; i < TOTAL_STAGES; i++) {
      let targetDiff = 1;

      // --- 難易度曲線の定義 ---
      
      if (i < 5) {
        // チュートリアル: 最も簡単
        targetDiff = 1;
      } else if (i < 30) {
        // 序盤: 2〜3
        targetDiff = 2 + Math.floor((i - 5) / 12); 
      } else {
        // 本編 (30〜404)
        // 基本カーブ: ステージ進行度(0.0〜1.0) に応じて 3 → 10 まで上昇
        const progress = (i - 30) / (TOTAL_STAGES - 30);
        // 線形補間でベース難易度を決定 (3.5 スタート、最後は 10.0)
        const baseDiff = 3.5 + (progress * 6.5);
        
        // --- 波（Wave）の適用 ---
        // 20ステージ周期でサイン波を適用し、±1.5程度の揺らぎを作る
        // これにより「ずっと難しい」を防ぎ、定期的に「少し簡単な問題」が混ざる
        const wave = Math.sin(i * (Math.PI / 10)) * 1.5;
        
        targetDiff = Math.round(baseDiff + wave);
      }

      // 範囲制限 (1〜10)
      targetDiff = Math.max(1, Math.min(10, targetDiff));

      // 問題を取得してリストに追加
      const id = popProblem(targetDiff);
      
      // 万が一在庫切れの場合は、既存のデータからランダムに埋める(ID重複許容の最終手段)
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