import { useGameStore } from "../stores/store";
// ★修正1: 辞書ストアをインポート
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
  
  // ★修正2: useGameStore ではなく useDictionaryStore から関数を取得
  // これで "is not a function" エラーは確実に消えます
  const unlockKanji = useDictionaryStore((state) => state.unlockKanji);
  const unlockJukugo = useDictionaryStore((state) => state.unlockJukugo);
  
  const currentJukugo = useGameStore((state) => state.currentJukugo);

  // 確定処理（合体）
  const confirmMerge = () => {
    if (!pendingMerge) return;

    soundEngine.playGoal(); // 決定音
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
      // 合体先のパーツ位置を取得
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
    if (!constituents) return; // 分解できない文字

    // 空きマスを探す（分解するとパーツが1つ増えるため、1つ空きが必要）
    // 現在のパーツがいた場所(1) + 空きマス(1) = 計2マス必要
    const occupiedIndices = parts.map(p => p.gridIndex);
    // 4x4=16マスと仮定 (storeで定数化すべきだが一旦マジックナンバー)
    const gridSize = 16;
    let emptyIndex = -1;
    
    for (let i = 0; i < gridSize; i++) {
      if (!occupiedIndices.includes(i)) {
        emptyIndex = i;
        break;
      }
    }

    if (emptyIndex === -1) {
      // 空きがないので分解不可（エラー音など鳴らすと良い）
      return;
    }

    // 分解実行
    soundEngine.playSelect(); // 分解音（仮）
    removePart(targetPart.id);
    
    // パーツAを元の位置に
    addPart({
      id: Math.random().toString(36).substring(2, 9),
      char: constituents[0],
      type: "RADICAL", // 便宜上RADICALに戻す（実際はKANJIかもだが）
      gridIndex: targetPart.gridIndex,
    });
    
    // パーツBを空き位置に
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
        confirmMerge(); // 確定
        return;
      }
      setPendingMerge(null);
      // キャンセルして通常処理へ
    }

    // --- B. 通常時 ---
    const clickedPart = parts.find((p) => p.gridIndex === index);

    // ★ クリックしたパーツがゴール対象なら即回収（これは維持）
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

    // 2. 選択中、同じパーツをタップ → ★分解判定★
    if (clickedPart && clickedPart.id === selectedPartId) {
      // 選択中のものをもう一度タップしたら分解を試みる
      const constituents = getConstituents(clickedPart.char);
      if (constituents) {
        handleSplit(clickedPart.id);
      } else {
        // 分解できないなら選択解除
        selectPart(null);
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
        selectPart(clickedPart.id);
      }
    }
  };

  return { handleSlotClick };
}