import { useEffect, useCallback, useRef } from "react";
// 修正: store.ts からインポート
import { useGameStore } from "../stores/store";
import { generateRandomStage } from "@/features/kanji-core/logic/generator";
import { generateStageParts } from "@/features/kanji-core/logic/decomposer";

export function useLevelSystem() {
  const currentLevelIndex = useGameStore((state) => state.levelIndex);
  const historyIds = useGameStore((state) => state.historyIds); // ★追加: 履歴を取得
  const setLevelIndex = useGameStore((state) => state.setLevelIndex);
  
  const setParts = useGameStore((state) => state.setParts);
  const setStage = useGameStore((state) => state.setStage);
  const resetStage = useGameStore((state) => state.resetStage);
  
  const loadedLevelRef = useRef<number | null>(null);

  const loadLevel = useCallback((index: number) => {
    // ★修正: 履歴を渡して重複を避ける
    const jukugoDef = generateRandomStage(index, historyIds);

    console.log(`📥 Loading Level ${index + 1}: ${jukugoDef.kanji} (Diff: ${jukugoDef.difficulty})`);

    resetStage();
    setStage(jukugoDef);

    const initialParts = generateStageParts(jukugoDef, index);
    setParts(initialParts as any);
    
    loadedLevelRef.current = index;
  }, [setParts, setStage, resetStage, historyIds]); // historyIdsを依存配列に追加

  useEffect(() => {
    if (loadedLevelRef.current === currentLevelIndex) return;
    loadLevel(currentLevelIndex);
  }, [currentLevelIndex, loadLevel]);

  const nextLevel = () => {
    setLevelIndex(currentLevelIndex + 1);
  };

  return {
    currentLevelIndex,
    nextLevel,
    reloadLevel: () => loadLevel(currentLevelIndex)
  };
}