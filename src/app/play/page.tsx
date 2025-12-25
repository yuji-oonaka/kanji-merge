"use client";

import { StageView } from "../../features/game-board/components/StageView";
import { useLevelSystem } from "../../features/game-board/hooks/useLevelSystem";

export default function PlayPage() {
  // ★ levelNumberForDisplay を受け取る
  const { nextLevel, levelNumberForDisplay } = useLevelSystem();

  return (
    // ★ ここに渡す
    <StageView levelDisplay={levelNumberForDisplay} onNextLevel={nextLevel} />
  );
}
