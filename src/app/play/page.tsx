"use client";

// パス修正: featuresディレクトリへの相対パスを正しく指定
// play(1) -> app(2) -> src -> features -> ...
import { StageView } from "../../features/game-board/components/StageView";
import { useLevelSystem } from "../../features/game-board/hooks/useLevelSystem";

export default function PlayPage() {
  // ゲームのレベル管理システムを初期化
  const { nextLevel, currentLevelIndex } = useLevelSystem();

  return (
    <StageView levelDisplay={currentLevelIndex + 1} onNextLevel={nextLevel} />
  );
}
