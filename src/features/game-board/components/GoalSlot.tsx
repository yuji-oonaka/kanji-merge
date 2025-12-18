"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { useGameStore } from "../stores/store";
import { getSentenceParts } from "@/features/kanji-core/logic/sentenceHelper";
import { THEMES } from "../constants/themes";
import { getDisplayChar } from "@/features/game-board/utils/charDisplay";
import { cn } from "@/lib/utils/tw-merge";

interface GoalSlotProps {
  target: JukugoDefinition | null;
}

type HintLevel = 0 | 1 | 2;

export function GoalSlot({ target }: GoalSlotProps) {
  const filledIndices = useGameStore((state) => state.filledIndices);
  const currentTheme = useGameStore((state) => state.currentTheme);
  const difficultyMode = useGameStore((state) => state.difficultyMode);

  const theme = THEMES[currentTheme];
  const [hintLevel, setHintLevel] = useState<HintLevel>(0);

  const isCompleted = target
    ? target.components.length === filledIndices.length
    : false;
  const hasSentence = !!target?.sentence;

  useEffect(() => {
    if (difficultyMode === "EASY") {
      setHintLevel(1);
    } else {
      setHintLevel(0);
    }
  }, [target?.id, difficultyMode]);

  useEffect(() => {
    if (isCompleted) {
      setHintLevel(2);
    }
  }, [isCompleted]);

  if (!target) return null;

  const sentenceParts = getSentenceParts(target);

  const handleNextHint = () => {
    setHintLevel((prev) => (prev < 2 ? ((prev + 1) as HintLevel) : 2));
  };

  const showMeaning = hintLevel >= 1;
  const showReading = hintLevel >= 2;
  const effectiveHintLevel = !hasSentence && hintLevel === 0 ? 1 : hintLevel;

  return (
    <motion.div
      layout
      // PC修正: h-full を削除。flex-colのみにして、コンテンツの高さに合わせる。
      className="w-full flex flex-col relative overflow-visible"
    >
      {/* ラベル */}
      <div className="hidden md:block absolute -top-8 left-0 opacity-50 pointer-events-none z-10">
        <div
          className={`text-xs lg:text-sm font-serif font-bold tracking-widest ${theme.colors.text}`}
        >
          文脈読解 Lv.{target.difficulty}
        </div>
      </div>

      {/* --- メインエリア (文章・スロット) --- */}
      {/* PC修正: flex-1, overflow-y-auto を削除。スクロールさせず、全部見せるスタイルへ */}
      <div className="w-full flex flex-col items-center justify-center py-2 min-h-[120px]">
        {!hasSentence ? (
          <div className="text-center my-auto">
            <h2
              className={`font-serif text-4xl md:text-6xl font-bold ${theme.colors.text} mb-4 leading-snug`}
            >
              {target.meaning || "???"}
            </h2>
            <div className="flex justify-center gap-2 mt-2">
              <SlotGroup
                target={target}
                filledIndices={filledIndices}
                theme={theme}
                isCompleted={isCompleted}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center my-auto w-full">
            {/* 文章表示 */}
            <div className="flex flex-wrap items-center justify-center content-center w-full gap-x-1 gap-y-3 leading-relaxed text-center px-1">
              {sentenceParts.map((part, pIndex) => {
                if (part.type === "TEXT") {
                  return (
                    <span
                      key={`text-${pIndex}`}
                      className={cn(
                        "font-serif font-bold opacity-95 mx-0.5",
                        theme.colors.text,
                        "text-[clamp(1.2rem,4vmin,3rem)]"
                      )}
                    >
                      {part.text}
                    </span>
                  );
                }
                return (
                  <SlotGroup
                    key="slots"
                    target={target}
                    filledIndices={filledIndices}
                    theme={theme}
                    isCompleted={isCompleted}
                  />
                );
              })}
            </div>

            {/* ★ 第1ヒント: 意味の表示エリア */}
            <AnimatePresence>
              {showMeaning && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="w-full max-w-lg px-4"
                >
                  <div className="bg-white/40 border border-stone-200/50 rounded-lg p-3 text-center shadow-sm backdrop-blur-sm">
                    <span className="text-xs text-stone-500 font-bold block mb-1">
                      意味
                    </span>
                    <span
                      className={`text-sm md:text-base font-serif font-bold ${theme.colors.text}`}
                    >
                      {target.meaning}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- ヒント / 読み表示エリア --- */}
      {/* PC修正: mt-2 -> mt-6。少し間隔を空けつつ、離れすぎないように固定 */}
      <div className="shrink-0 flex flex-col items-center justify-center z-10 pb-2 gap-2 mt-6">
        {/* ★ 第2ヒント: 読み (答え) */}
        <AnimatePresence mode="wait">
          {showReading ? (
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              className={`font-serif tracking-[0.2em] font-bold ${
                isCompleted ? "text-amber-600" : theme.colors.sub
              } text-lg md:text-2xl`}
            >
              {target.reading}
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleNextHint}
              className={cn(
                "text-xs border rounded-full px-4 py-1.5 transition-colors flex items-center gap-2 shadow-sm",
                effectiveHintLevel === 0
                  ? "bg-white/80 text-stone-500 border-stone-300 hover:bg-white hover:text-stone-700"
                  : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
              )}
            >
              <span className="text-sm">
                {effectiveHintLevel === 0 ? "💡" : "👁️"}
              </span>
              <span className="font-bold">
                {effectiveHintLevel === 0 ? "ヒント(意味)を見る" : "読みを見る"}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SlotGroup({ target, filledIndices, theme, isCompleted }: any) {
  // ... (ここは変更なし)
  return (
    <div className="inline-flex items-center gap-1 mx-0.5 align-middle">
      {target.components.map((char: string, cIndex: number) => {
        const isFilled = filledIndices.includes(cIndex);
        return (
          <SingleSlot
            key={`slot-${cIndex}`}
            char={char}
            isFilled={isFilled}
            isCompleted={isCompleted}
          />
        );
      })}
    </div>
  );
}

function SingleSlot({
  char,
  isFilled,
  isCompleted,
}: {
  char: string;
  isFilled: boolean;
  isCompleted: boolean;
}) {
  const displayChar = getDisplayChar(char);
  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-all duration-300",
        // PC修正: スロットサイズを少し大きく調整
        "w-[clamp(2.5rem,8vmin,5.5rem)] h-[clamp(2.5rem,8vmin,5.5rem)]"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-lg md:rounded-xl",
          isFilled
            ? "border-2 border-stone-800 bg-white shadow-md transform -rotate-1"
            : "border-2 border-dashed border-stone-400 bg-stone-100/40",
          isCompleted && "border-amber-500 bg-amber-50"
        )}
      />

      <AnimatePresence>
        {isFilled && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "z-10 font-serif font-bold select-none",
              "text-[clamp(1.5rem,5vmin,3.5rem)]",
              isCompleted ? "text-amber-700" : "text-stone-800"
            )}
          >
            {displayChar}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
