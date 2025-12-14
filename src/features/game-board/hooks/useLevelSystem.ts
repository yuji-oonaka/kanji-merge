import { useEffect, useCallback, useRef } from "react";
import { useGameStore } from "../stores/store";
import { generateRandomStage } from "@/features/kanji-core/logic/generator";
import { generateStageParts } from "@/features/kanji-core/logic/decomposer";

export function useLevelSystem() {
  const currentLevelIndex = useGameStore((state) => state.levelIndex);
  // ★追加: 現在の難易度モードを監視
  const difficultyMode = useGameStore((state) => state.difficultyMode);

  const setLevelIndex = useGameStore((state) => state.setLevelIndex);
  const setParts = useGameStore((state) => state.setParts);
  const setStage = useGameStore((state) => state.setStage);
  const resetStage = useGameStore((state) => state.resetStage);
  
  const loadedLevelRef = useRef<number | null>(null);
  // ★追加: ロードした時のモードも記録しておく（モード切替時の再ロード判定用）
  const loadedModeRef = useRef<string | null>(null);

  const loadLevel = useCallback((index: number) => {
    // ストアから直接最新の状態を取得
    const state = useGameStore.getState();
    const currentHistoryIds = state.historyIds;
    // ★追加: モードを取得
    const mode = state.difficultyMode;

    // ★修正: 第3引数に mode を渡す
    const jukugoDef = generateRandomStage(index, currentHistoryIds, mode);

    console.log(`📥 Loading Level ${index + 1} [${mode}]: ${jukugoDef.kanji} (Diff: ${jukugoDef.difficulty})`);

    resetStage();
    setStage(jukugoDef);

    // ★修正: 第3引数に mode を渡す
    const initialParts = generateStageParts(jukugoDef, index, mode);
    setParts(initialParts as any);
    
    loadedLevelRef.current = index;
    loadedModeRef.current = mode; // ★記録
  }, [setParts, setStage, resetStage]); 

  useEffect(() => {
    // レベルが変わった、またはモードが変わった場合にロードを実行
    if (
      loadedLevelRef.current === currentLevelIndex && 
      loadedModeRef.current === difficultyMode
    ) {
      return;
    }
    
    loadLevel(currentLevelIndex);
  }, [currentLevelIndex, difficultyMode, loadLevel]); // ★difficultyMode を依存配列に追加

  const nextLevel = () => {
    setLevelIndex(currentLevelIndex + 1);
  };

  return {
    currentLevelIndex,
    nextLevel,
    reloadLevel: () => loadLevel(currentLevelIndex)
  };
}