import { useEffect, useCallback, useRef } from "react";
import { useGameStore } from "../stores/store";
import { generateStageParts } from "@/features/kanji-core/logic/decomposer";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { TOTAL_STAGES } from "../stores/slices/stageSlice";
import jukugoDataRaw from "@/features/kanji-core/data/jukugo-db-auto.json";

const jukugoData = jukugoDataRaw as JukugoDefinition[];
const HINT_APPEAR_MS = 15000;

export function useLevelSystem() {
  const currentLevelIndex = useGameStore((state) => state.levelIndex);
  const difficultyMode = useGameStore((state) => state.difficultyMode);
  const playlist = useGameStore((state) => state.playlist);
  
  const hintLevel = useGameStore((state) => state.hintLevel);
  const isCleared = useGameStore((state) => state.isCleared);

  const setLevelIndex = useGameStore((state) => state.setLevelIndex);
  const setParts = useGameStore((state) => state.setParts);
  const setStage = useGameStore((state) => state.setStage);
  const resetStage = useGameStore((state) => state.resetStage);
  
  const loadedLevelRef = useRef<number | null>(null);
  const loadedModeRef = useRef<string | null>(null);

  const loadLevel = useCallback((index: number) => {
    const state = useGameStore.getState();
    let currentPlaylist = state.playlist;

    // 1. プレイリストが空なら生成
    if (currentPlaylist.length === 0) {
      state.generatePlaylist();
      currentPlaylist = useGameStore.getState().playlist;
    }

    // 2. IDを取得
    let targetId = currentPlaylist[index % currentPlaylist.length];

    // ★★★ チュートリアル対応 (ここに追加！) ★★★
    // JSONには含まれていないデータなので、ここで手動定義してセットします
    if (targetId === "tutorial-01") {
      const t1: JukugoDefinition = {
        id: "tutorial-01",
        kanji: "二",
        reading: "に",
        difficulty: 1,
        components: ["二"], 
        meaning: "数字の2",
        sentence: "一に一を足すと{{target}}になる。"
      };
      resetStage();
      setStage(t1);
      // decomposerは index=0 を見て ["一","一"] を出してくれます
      const parts = generateStageParts(t1, 0, state.difficultyMode);
      setParts(parts as any);
      loadedLevelRef.current = index;
      return;
    }

    if (targetId === "tutorial-02") {
      const t2: JukugoDefinition = {
        id: "tutorial-02",
        kanji: "三",
        reading: "さん",
        difficulty: 1,
        components: ["三"],
        meaning: "数字の3",
        sentence: "二本の線にもう一本加えて{{target}}にする。"
      };
      resetStage();
      setStage(t2);
      // decomposerは index=1 を見て ["二","一"] を出してくれます
      const parts = generateStageParts(t2, 1, state.difficultyMode);
      setParts(parts as any);
      loadedLevelRef.current = index;
      return;
    }

    if (targetId === "tutorial-03") {
      const t3: JukugoDefinition = {
        id: "tutorial-03",
        kanji: "三",
        reading: "さん",
        difficulty: 2,
        components: ["三"],
        meaning: "数字の3",
        sentence: "まず二を作り、それに一を足して{{target}}にする。"
      };
      resetStage();
      setStage(t3);
      // decomposerは index=2 を見て ["一","一","一"] を出してくれます
      const parts = generateStageParts(t3, 2, state.difficultyMode);
      setParts(parts as any);
      loadedLevelRef.current = index;
      return;
    }
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★

    // 3. 通常の検索 (JSONから探す)
    let targetJukugo = jukugoData.find(j => j.id === targetId);

    // データが見つからない場合の自動修復
    if (!targetJukugo) {
      console.warn(`Old data detected (${targetId}). Regenerating playlist...`);
      state.generatePlaylist();
      currentPlaylist = useGameStore.getState().playlist;
      targetId = currentPlaylist[index % currentPlaylist.length];
      targetJukugo = jukugoData.find(j => j.id === targetId);
    }

    // それでも見つからない場合（最終手段）
    if (!targetJukugo) {
      console.error(`Problem ID not found: ${targetId}`);
      const fallback = jukugoData[0] || jukugoData[Math.floor(Math.random() * jukugoData.length)];
      resetStage();
      setStage(fallback);
      const parts = generateStageParts(fallback, index, state.difficultyMode);
      setParts(parts as any);
      return;
    }

    // 正常ルート
    resetStage();
    setStage(targetJukugo);

    const initialParts = generateStageParts(targetJukugo, index, state.difficultyMode);
    setParts(initialParts as any);
    
    loadedLevelRef.current = index;
    loadedModeRef.current = state.difficultyMode; 
  }, [setParts, setStage, resetStage]);

  useEffect(() => {
    if (
      loadedLevelRef.current === currentLevelIndex && 
      loadedModeRef.current === difficultyMode
    ) {
      return;
    }
    loadLevel(currentLevelIndex);
  }, [currentLevelIndex, difficultyMode, loadLevel]);

  useEffect(() => {
    if (isCleared || hintLevel >= 1) return; 
    const timer = setTimeout(() => {
      useGameStore.getState().incrementHintLevel();
    }, HINT_APPEAR_MS);
    return () => clearTimeout(timer);
  }, [hintLevel, isCleared]);

  const nextLevel = () => {
    setLevelIndex(currentLevelIndex + 1);
  };

  const levelNumberForDisplay = (currentLevelIndex % TOTAL_STAGES) + 1;

  return {
    currentLevelIndex,
    nextLevel,
    reloadLevel: () => loadLevel(currentLevelIndex),
    levelNumberForDisplay,
  };
}