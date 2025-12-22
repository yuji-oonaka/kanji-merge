import { useGameStore } from "../stores/store";
import { useDictionaryStore } from "@/features/dictionary/stores/dictionarySlice";
import { judgeMerge } from "@/features/kanji-core/logic/merger";
import { getConstituents } from "@/features/kanji-core/logic/decomposer";
import { soundEngine } from "@/lib/sounds/SoundEngine";

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
  
  // ★追加: シェイク関数を取得
  const triggerShake = useGameStore((state) => state.triggerShake);
  
  const unlockKanji = useDictionaryStore((state) => state.unlockKanji);
  const unlockJukugo = useDictionaryStore((state) => state.unlockJukugo);
  
  const currentJukugo = useGameStore((state) => state.currentJukugo);

  // 確定処理（合体）
  const confirmMerge = () => {
    if (!pendingMerge) return;

    soundEngine.playGoal();
    unlockKanji(pendingMerge.previewChar);
    removePart(pendingMerge.sourceId);
    removePart(pendingMerge.targetId);

    // 1. ゴール判定
    const isGoal = checkAndFillSlot(pendingMerge.previewChar);
    if (isGoal) {
      soundEngine.playGoal();
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

    // 構成パーツを取得
    const constituents = getConstituents(targetPart.char);
    
    // ★修正: 分解できない場合は震わせる
    if (!constituents) {
      triggerShake([partId]);
      return;
    }

    // 空きマスを探す
    const occupiedIndices = parts.map(p => p.gridIndex);
    const gridSize = 16;
    let emptyIndex = -1;
    for (let i = 0; i < gridSize; i++) {
      if (!occupiedIndices.includes(i)) {
        emptyIndex = i;
        break;
      }
    }

    // ★修正: 空きがない場合も震わせる
    if (emptyIndex === -1) {
      triggerShake([partId]);
      return;
    }

    // 分解実行
    soundEngine.playSelect();
    removePart(targetPart.id);
    addPart({
      id: Math.random().toString(36).substring(2, 9),
      char: constituents[0],
      type: "RADICAL", // 便宜上RADICAL
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

  const handleSlotClick = (index: number) => {
    soundEngine.init();

    // --- A. 仮合体中（プレビュー中） ---
    if (pendingMerge) {
      const targetPart = parts.find(p => p.id === pendingMerge.targetId);
      if (targetPart && targetPart.gridIndex === index) {
        confirmMerge();
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
        // ★修正: 分解できないなら選択解除して震わせる
        selectPart(null);
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
        soundEngine.playMerge();
      } else {
        // ★修正: 合体失敗時は両方を震わせる！
        selectPart(null); // 選択状態を解除
        triggerShake([sourcePart.id, clickedPart.id]); 
      }
    }
  };

  return { handleSlotClick };
}