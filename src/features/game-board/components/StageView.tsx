"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../stores/store";
import { GameBoard } from "./GameBoard";
import { GoalSlot } from "./GoalSlot";
import { ResultOverlay } from "./ResultOverlay";
import { soundEngine } from "@/lib/sounds/SoundEngine";
import { THEMES } from "../constants/themes";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { getDisplayChar } from "../utils/charDisplay";
import { useIdsMapStore } from "@/features/dictionary/stores/idsMapStore";
import { ExperienceGauge } from "./ExperienceGauge";
import { TOTAL_STAGES } from "../stores/slices/stageSlice";
import { LoopTransition } from "./LoopTransition";

interface StageViewProps {
  levelDisplay?: number;
  onNextLevel?: () => void;
}

// ... (縦積み判定ロジックなどは変更なし) ...
const VERTICAL_TOPS = new Set([
  "艹",
  "宀",
  "竹",
  "雨",
  "罒",
  "穴",
  "亠",
  "立",
  "尸",
]);
const isVerticalLayout = (p1: string, p2: string): boolean => {
  if (VERTICAL_TOPS.has(p1)) return true;
  if (p1 === "土" && p2 === "土") return true;
  if (p1 === "火" && p2 === "火") return true;
  if (p1 === "日" && p2 === "日") return true;
  return false;
};

export function StageView({ levelDisplay = 1, onNextLevel }: StageViewProps) {
  const currentJukugo = useGameStore((state) => state.currentJukugo);
  const isCleared = useGameStore((state) => state.isCleared);
  const currentTheme = useGameStore((state) => state.currentTheme);
  const storeHintLevel = useGameStore((state) => state.hintLevel);
  const filledIndices = useGameStore((state) => state.filledIndices);
  const idsMap = useIdsMapStore((state) => state.idsMap);
  const incrementLoop = useGameStore((state) => state.incrementLoop);
  const internalLevelIndex = useGameStore((state) => state.levelIndex);
  const setLevelIndex = useGameStore((state) => state.setLevelIndex);

  const [showHintModal, setShowHintModal] = useState(false);
  const [viewStep, setViewStep] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  const theme = THEMES[currentTheme];

  useEffect(() => {
    if (isCleared) {
      if (soundEngine && typeof soundEngine.playClear === "function") {
        soundEngine.playClear();
      }
    }
  }, [isCleared]);

  const handleOpenHint = () => {
    setViewStep(0);
    setShowHintModal(true);
  };

  const handleNextLevel = () => {
    if (internalLevelIndex >= TOTAL_STAGES - 1) {
      setIsLooping(true);
    } else {
      if (onNextLevel) onNextLevel();
    }
  };

  const handleLoopComplete = () => {
    incrementLoop();
    setIsLooping(false);
    if (onNextLevel) onNextLevel();
  };

  const handleDebugSkip = () => {
    // 現在のインデックス + 1 に強制セット
    setLevelIndex(internalLevelIndex + 1);
    // ループフラグをリセット（念のため）
    setIsLooping(false);
  };

  // ★ヒントに表示するべきパーツがあるか事前にチェック（全パーツ原子or埋まってる場合のメッセージ用）
  const hasVisibleRecipes = currentJukugo?.components.some((char, idx) => {
    const isFilled = filledIndices.includes(idx);
    const isAtomic = !idsMap[char];
    return !isFilled && !isAtomic;
  });

  return (
    <div
      className={`fixed inset-0 w-full h-dvh overflow-hidden flex flex-col touch-none overscroll-none ${theme.colors.background}`}
    >
      {/* ... (ヘッダー〜メインコンテンツ〜リザルト〜ループ演出は変更なし) ... */}

      <div className="w-full h-14 shrink-0 flex justify-between items-center px-4 z-30 relative">
        <div className="flex gap-2 items-center pointer-events-auto">
          <Link
            href="/"
            className={`
              backdrop-blur border px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-colors flex items-center gap-1
              ${theme.colors.partBg} ${theme.colors.partBorder} ${theme.colors.sub}
            `}
          >
            <span>🏠</span>
          </Link>
          <div
            className={`font-bold tracking-widest text-xs pl-1 ${theme.colors.sub} opacity-70`}
          >
            STAGE {levelDisplay}
          </div>
        </div>

        <div className="flex gap-3 items-center pointer-events-auto">
          <ExperienceGauge />
          {storeHintLevel > 0 && (
            <button
              onClick={handleOpenHint}
              className={`
                w-8 h-8 flex items-center justify-center rounded-full border shadow-sm transition-all
                hover:scale-110 active:scale-95
                ${theme.colors.partBg} ${theme.colors.partBorder} text-amber-500
              `}
            >
              <span className="text-sm">💡</span>
            </button>
          )}
          <ThemeSwitcher />
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto min-h-0 flex flex-col landscape:flex-row items-center justify-center p-2 pb-safe-offset gap-4 landscape:gap-12 lg:gap-20">
        <div className="flex-1 w-full flex items-center justify-center p-2 landscape:p-0 landscape:justify-end">
          <div className="w-full max-w-2xl landscape:max-w-lg lg:landscape:max-w-xl flex flex-col justify-center">
            <GoalSlot target={currentJukugo} />
          </div>
        </div>

        <div className="shrink-0 w-full landscape:w-auto h-[45dvh] landscape:h-full lg:landscape:h-auto lg:landscape:w-[540px] xl:landscape:w-[600px] p-2 landscape:p-4 landscape:pl-0 flex items-start landscape:items-center justify-center landscape:justify-start">
          <div className="aspect-square h-full max-h-full w-auto max-w-full shadow-xl rounded-xl">
            <GameBoard />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-0 bg-linear-to-t from-black/5 to-transparent landscape:hidden" />

      <AnimatePresence>
        {isCleared && !isLooping && (
          <ResultOverlay onNextLevel={handleNextLevel} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLooping && <LoopTransition onComplete={handleLoopComplete} />}
      </AnimatePresence>

      {/* --- ヒントモーダル --- */}
      <AnimatePresence>
        {showHintModal && currentJukugo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowHintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className={`
                w-full max-w-md p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-6 text-center
                ${theme.colors.partBg} border ${theme.colors.partBorder}
                max-h-[85vh] overflow-y-auto
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* --- Step 0: 構造レシピ --- */}
              {viewStep === 0 && (
                <>
                  <div className="text-4xl mb-2">💡</div>

                  <div className="w-full">
                    <div className="text-xs font-bold text-stone-400 mb-4">
                      合成レシピ（構造図）
                    </div>

                    <div className="flex flex-col gap-8 w-full">
                      {currentJukugo.components.map((targetChar, idx) => {
                        // 1. 既に埋まっているなら表示しない
                        if (filledIndices.includes(idx)) return null;

                        // 2. ★追加: 合体レシピがない（原子パーツ）なら表示しない
                        if (!idsMap[targetChar]) return null;

                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center gap-2 w-full"
                          >
                            <div className="w-full flex justify-center">
                              <RecursiveRecipe
                                char={targetChar}
                                idsMap={idsMap}
                                depth={0}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* すべてのパーツが原子パーツ or 埋まっている場合 */}
                      {!hasVisibleRecipes && (
                        <div className="py-8 text-stone-400 text-sm">
                          <p>合体が必要なパーツはありません。</p>
                          <p className="text-xs mt-2 opacity-70">
                            そのままの形のパーツを探してみましょう
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 mt-2">
                    色のついた箱ごとにパーツをくっつけましょう
                  </p>

                  <div className="w-full h-px bg-stone-200 my-2" />

                  <button
                    onClick={() => setViewStep(1)}
                    className="text-xs text-stone-400 underline hover:text-stone-600"
                  >
                    これでもわからない（答えを見る）
                  </button>
                </>
              )}

              {/* Step 1: 答え */}
              {viewStep === 1 && (
                <>
                  <div className="text-4xl">🔑</div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-bold text-stone-400 mb-1">
                        正解の漢字
                      </div>
                      <div
                        className={`text-6xl font-serif font-bold ${theme.colors.accent}`}
                      >
                        {currentJukugo.kanji}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-400 mb-1">
                        読み方
                      </div>
                      <div
                        className={`text-2xl font-bold ${theme.colors.text}`}
                      >
                        {currentJukugo.reading}
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-xs text-stone-500">
                    答えを参考に、パズルを完成させてください
                  </p>
                </>
              )}

              <button
                onClick={() => setShowHintModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={handleDebugSkip}
          // ヘッダー(h-14=56px)のすぐ下に配置します
          className="fixed top-16 right-4 z-50 font-bold text-xs px-4 py-2 rounded-full shadow-md border border-white/50 backdrop-blur-sm bg-orange-500/90 text-white hover:bg-orange-600 transition-all active:scale-95 pointer-events-auto flex items-center gap-1"
          title="開発用機能: 現在の問題を強制的にスキップして次の問題へ進みます"
        >
          <span>🚧</span>
          <span>開発用: 次へ進む ▶</span>
        </button>
      )}
    </div>
  );
}

// ... (RecursiveRecipe は変更なし) ...
function RecursiveRecipe({
  char,
  idsMap,
  depth,
}: {
  char: string;
  idsMap: any;
  depth: number;
}) {
  const parts = idsMap[char];
  if (!parts) {
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-white rounded border-2 border-stone-300 shadow-sm relative z-10">
        <span className="font-serif font-bold text-lg text-stone-800">
          {getDisplayChar(char)}
        </span>
      </div>
    );
  }
  const getGroupStyle = (d: number) => {
    const styles = [
      "bg-stone-100/80 border-stone-300",
      "bg-amber-100/60 border-amber-300",
      "bg-sky-100/60 border-sky-300",
      "bg-rose-100/60 border-rose-300",
    ];
    return styles[d % styles.length];
  };
  const isVertical = isVerticalLayout(parts[0], parts[1]);
  const groupStyle = getGroupStyle(depth);
  return (
    <div
      className={`
      flex items-center gap-2 p-2 rounded-lg border-2 border-dashed
      ${isVertical ? "flex-col" : "flex-row"}
      ${groupStyle}
    `}
    >
      <RecursiveRecipe char={parts[0]} idsMap={idsMap} depth={depth + 1} />
      <span className="text-stone-400 font-bold text-xs select-none opacity-60">
        +
      </span>
      <RecursiveRecipe char={parts[1]} idsMap={idsMap} depth={depth + 1} />
    </div>
  );
}
