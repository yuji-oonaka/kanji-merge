import { useGameStore } from "../stores/store";
import { judgeMerge } from "@/features/kanji-core/logic/merger";
import { GamePart } from "@/features/kanji-core/types";
import { soundEngine } from "@/lib/sounds/SoundEngine";

// 判定距離を少し広げて吸着しやすくする
const MERGE_DISTANCE_THRESHOLD = 100;
const GOAL_AREA_THRESHOLD_Y = 180;

export function useMergeJudge() {
  const updatePartPosition = useGameStore((state) => state.updatePartPosition);
  const removePart = useGameStore((state) => state.removePart);
  const addPart = useGameStore((state) => state.addPart);
  const checkAndFillSlot = useGameStore((state) => state.checkAndFillSlot);
  const unlockKanji = useGameStore((state) => state.unlockKanji);
  const unlockJukugo = useGameStore((state) => state.unlockJukugo);
  const currentJukugo = useGameStore((state) => state.currentJukugo);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleDragEnd = (activePart: GamePart, x: number, y: number) => {
    // 画面サイズを取得（相対座標→絶対座標変換のため）
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    updatePartPosition(activePart.id, x, y);
    soundEngine.init();

    const currentParts = useGameStore.getState().parts;

    // 1. 合体判定
    // 自分以外のパーツ全てとの距離をチェック
    const targetPart = currentParts.find((p) => {
      if (p.id === activePart.id) return false;

      // 相手の座標をピクセルに正規化
      // (データが相対座標 0.0-1.0 なら画面サイズを掛ける、1以上ならそのまま)
      const targetX = p.x <= 1 ? p.x * screenW : p.x;
      const targetY = p.y <= 1 ? p.y * screenH : p.y;

      const distance = Math.hypot(targetX - x, targetY - y);
      return distance < MERGE_DISTANCE_THRESHOLD;
    });

    if (targetPart) {
      // 相手の正規化座標（合体後の生成位置用）
      const targetX = targetPart.x <= 1 ? targetPart.x * screenW : targetPart.x;
      const targetY = targetPart.y <= 1 ? targetPart.y * screenH : targetPart.y;

      const result = judgeMerge(activePart.char, targetPart.char);

      if (result.success) {
        soundEngine.playMerge();
        if (result.newChar) unlockKanji(result.newChar);

        removePart(activePart.id);
        removePart(targetPart.id);

        // 合体結果がいきなりゴール正解かチェック
        const isGoalPart = checkAndFillSlot(result.newChar!);

        if (isGoalPart) {
          soundEngine.playGoal();
          if (useGameStore.getState().isCleared && currentJukugo) {
             unlockJukugo(currentJukugo.id);
          }
        } else {
          // 盤面に生成 (2つのパーツの中間地点)
          const newX = (x + targetX) / 2;
          const newY = (y + targetY) / 2;
          addPart({
            id: generateId(),
            char: result.newChar!,
            type: "KANJI",
            x: newX,
            y: newY,
          });
        }
        return;
      }
    }

    // 2. ゴール判定
    if (y < GOAL_AREA_THRESHOLD_Y) {
      const isGoalPart = checkAndFillSlot(activePart.char);
      if (isGoalPart) {
        soundEngine.playGoal();
        removePart(activePart.id);
        
        if (useGameStore.getState().isCleared && currentJukugo) {
           unlockJukugo(currentJukugo.id);
        }
      }
    }
  };

  return { handleDragEnd };
}