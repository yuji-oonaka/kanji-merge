import { useGameStore } from "../stores/store";
import { useDictionaryStore } from "@/features/dictionary/stores/dictionarySlice";
import { judgeMerge } from "@/features/kanji-core/logic/merger";
import { getConstituents } from "@/features/kanji-core/logic/decomposer";
import { soundEngine } from "@/lib/sounds/SoundEngine";
import React from "react";

export function useGridInteraction() {
  const parts = useGameStore((state) => state.parts);
  const selectedPartId = useGameStore((state) => state.selectedPartId);
  const selectPart = useGameStore((state) => state.selectPart);
  
  const pendingMerge = useGameStore((state) => state.pendingMerge);
  const setPendingMerge = useGameStore((state) => state.setPendingMerge);
  const movePart = useGameStore((state) => state.movePart);
  const removePart = useGameStore((state) => state.removePart);
  const addPart = useGameStore((state) => state.addPart);
  const checkAndFillSlot = useGameStore((state) => state.checkAndFillSlot);
  
  const triggerShake = useGameStore((state) => state.shakeParts);
  const triggerEffect = useGameStore((state) => state.triggerEffect);
  
  const unlockKanji = useDictionaryStore((state) => state.unlockKanji);
  const unlockJukugo = useDictionaryStore((state) => state.unlockJukugo);
  
  const currentJukugo = useGameStore((state) => state.currentJukugo);

  // 確定処理（合体）
  const confirmMerge = (x: number, y: number) => {
    if (!pendingMerge) return;

    soundEngine.playGoal(); // ここは成功音でOK（あとでplayMergeに変えても良い）
    unlockKanji(pendingMerge.previewChar);
    removePart(pendingMerge.sourceId);
    removePart(pendingMerge.targetId);

    triggerEffect(x, y, "MERGE", pendingMerge.previewChar);

    // 1. ゴール判定
    const isGoal = checkAndFillSlot(pendingMerge.previewChar);
    if (isGoal) {
      soundEngine.playGoal();
      triggerEffect(x, y, "GOAL"); 
      
      if (useGameStore.getState().isCleared && currentJukugo) {
        unlockJukugo(currentJukugo.id);
      }
    } else {
      // 2. ゴールじゃないけど合体成功（盤面に置く）
      const targetPart = parts.find(p => p.id === pendingMerge.targetId);
      if (targetPart) {
        addPart({
          id: Math.random().toString(36).substring(2, 9),
          char: pendingMerge.previewChar,
          type: "KANJI",
          gridIndex: targetPart.gridIndex,
        });
      }
    }

    setPendingMerge(null);
    selectPart(null);
  };

  // 分解処理
  const handleSplit = (partId: string) => {
    const targetPart = parts.find(p => p.id === partId);
    if (!targetPart) return;

    const constituents = getConstituents(targetPart.char);
    
    // ★追加: 分解できない場合（原子パーツ）
    if (!constituents) {
      soundEngine.playInvalid(); // 失敗音
      triggerShake([partId]);
      return;
    }

    const occupiedIndices = parts.map(p => p.gridIndex);
    const gridSize = 16;
    let emptyIndex = -1;
    for (let i = 0; i < gridSize; i++) {
      if (!occupiedIndices.includes(i)) {
        emptyIndex = i;
        break;
      }
    }

    // ★追加: 空きマスがない場合
    if (emptyIndex === -1) {
      soundEngine.playInvalid(); // 失敗音
      triggerShake([partId]);
      return;
    }

    // 成功時
    soundEngine.playSelect(); // または playSplit 的な音
    removePart(targetPart.id);
    addPart({
      id: Math.random().toString(36).substring(2, 9),
      char: constituents[0],
      type: "RADICAL",
      gridIndex: targetPart.gridIndex,
    });
    addPart({
      id: Math.random().toString(36).substring(2, 9),
      char: constituents[1],
      type: "RADICAL",
      gridIndex: emptyIndex,
    });
    selectPart(null);
  };

  const handleSlotClick = (index: number, e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;

    soundEngine.init();

    // --- A. 仮合体中 ---
    if (pendingMerge) {
      const targetPart = parts.find(p => p.id === pendingMerge.targetId);
      if (targetPart && targetPart.gridIndex === index) {
        confirmMerge(x, y);
        return;
      }
      setPendingMerge(null);
    }

    // --- B. 通常時 ---
    const clickedPart = parts.find((p) => p.gridIndex === index);

    if (clickedPart) {
      const isSelfTap = clickedPart.id === selectedPartId;
      if (!isSelfTap) {
        const isGoal = checkAndFillSlot(clickedPart.char);
        if (isGoal) {
          soundEngine.playGoal();
          triggerEffect(x, y, "GOAL");
          
          removePart(clickedPart.id);
          selectPart(null);
          if (useGameStore.getState().isCleared && currentJukugo) {
            unlockJukugo(currentJukugo.id);
          }
          return;
        }
      }
    }

    // 1. 何も選択していない時
    if (!selectedPartId) {
      if (clickedPart) {
        selectPart(clickedPart.id);
      }
      return;
    }

    // 2. 選択中、同じパーツをタップ → 分解判定
    if (clickedPart && clickedPart.id === selectedPartId) {
      const constituents = getConstituents(clickedPart.char);
      if (constituents) {
        handleSplit(clickedPart.id);
      } else {
        // ★追加: 分解不可（原子パーツ）
        selectPart(null);
        soundEngine.playInvalid(); // 失敗音
        triggerShake([clickedPart.id]);
      }
      return;
    }

    const sourcePart = parts.find((p) => p.id === selectedPartId);
    if (!sourcePart) {
      selectPart(null);
      return;
    }

    // 3. 空きマスへ移動
    if (!clickedPart) {
      movePart(sourcePart.id, index);
      soundEngine.playSelect(); // 移動音
      selectPart(null);
      return;
    }

    // 4. 別のパーツと合体判定
    if (clickedPart) {
      const result = judgeMerge(sourcePart.char, clickedPart.char);
      if (result.success && result.newChar) {
        setPendingMerge({
          sourceId: sourcePart.id,
          targetId: clickedPart.id,
          previewChar: result.newChar,
        });
        soundEngine.playMerge(); // 合体準備音
      } else {
        // ★追加: 合体不成立
        selectPart(null); 
        soundEngine.playInvalid(); // 失敗音
        triggerShake([sourcePart.id, clickedPart.id]); 
      }
    }
  };

  return { handleSlotClick };
}