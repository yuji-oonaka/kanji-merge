import { useEffect, useCallback, useRef } from "react";
import { useGameStore } from "../stores/store";
import { generateRandomStage } from "@/features/kanji-core/logic/generator";
import { generateStageParts } from "@/features/kanji-core/logic/decomposer";

// 15秒経ったら「ヒントボタン」だけ出す（中身は勝手に進めない）
const HINT_APPEAR_MS = 15000;

export function useLevelSystem() {
  const currentLevelIndex = useGameStore((state) => state.levelIndex);
  const difficultyMode = useGameStore((state) => state.difficultyMode);
  
  const hintLevel = useGameStore((state) => state.hintLevel);
  // incrementHintLevel はもう使いません
  const isCleared = useGameStore((state) => state.isCleared);

  const setLevelIndex = useGameStore((state) => state.setLevelIndex);
  const setParts = useGameStore((state) => state.setParts);
  const setStage = useGameStore((state) => state.setStage);
  const resetStage = useGameStore((state) => state.resetStage);
  
  // ★追加: 特定のレベルにセットする関数を使う（stageSliceに既存でなければ追加が必要だが、store経由で操作する）
  // ここでは暫定的に useGameStore.setState を使わず、storeにアクションを追加するのが筋ですが、
  // 既存の incrementHintLevel を「1にするだけ」のロジックに変えるか、直接操作します。
  // 今回は安全に、useEffect内で条件分岐します。
  
  const loadedLevelRef = useRef<number | null>(null);
  const loadedModeRef = useRef<string | null>(null);

  const loadLevel = useCallback((index: number) => {
    const state = useGameStore.getState();
    const currentHistoryIds = state.historyIds;
    const mode = state.difficultyMode;

    const jukugoDef = generateRandomStage(index, currentHistoryIds, mode);

    console.log(`📥 Loading Level ${index + 1} [${mode}]: ${jukugoDef.kanji} (Diff: ${jukugoDef.difficulty})`);

    resetStage();
    setStage(jukugoDef);

    const initialParts = generateStageParts(jukugoDef, index, mode);
    setParts(initialParts as any);
    
    loadedLevelRef.current = index;
    loadedModeRef.current = mode; 
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

  // ★修正: ヒントタイマー
  // 「勝手にどんどん進む」のではなく、「0なら1にする」だけ。
  useEffect(() => {
    if (isCleared || hintLevel >= 1) return; // 既にボタンが出ていれば何もしない

    const timer = setTimeout(() => {
      // ストアの incrementHintLevel を呼ぶ（0→1になる）
      useGameStore.getState().incrementHintLevel();
    }, HINT_APPEAR_MS);

    return () => clearTimeout(timer);
  }, [hintLevel, isCleared]);

  const nextLevel = () => {
    setLevelIndex(currentLevelIndex + 1);
  };

  return {
    currentLevelIndex,
    nextLevel,
    reloadLevel: () => loadLevel(currentLevelIndex)
  };
}