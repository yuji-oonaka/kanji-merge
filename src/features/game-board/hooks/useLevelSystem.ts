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
  const generatePlaylist = useGameStore((state) => state.generatePlaylist);
  
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

    // 2. IDを取得して検索
    let targetId = currentPlaylist[index % currentPlaylist.length];
    let targetJukugo = jukugoData.find(j => j.id === targetId);

    // ★★★ 修正箇所: データが見つからない場合の自動修復ロジック ★★★
    if (!targetJukugo) {
      console.warn(`Old data detected (${targetId}). Regenerating playlist...`);
      
      // (1) 強制的にプレイリストを作り直す
      state.generatePlaylist();
      
      // (2) 新しいリストを取り直す
      currentPlaylist = useGameStore.getState().playlist;
      targetId = currentPlaylist[index % currentPlaylist.length];
      
      // (3) もう一度検索する
      targetJukugo = jukugoData.find(j => j.id === targetId);
    }
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

    // それでも見つからない場合（最終手段：フリーズ回避）
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