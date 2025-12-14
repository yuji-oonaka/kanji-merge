// src/features/game-board/components/GoalSlot.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { useGameStore } from "../stores/store";
import { getSentenceParts } from "@/features/kanji-core/logic/sentenceHelper";
import { THEMES } from "../constants/themes";

interface GoalSlotProps {
  target: JukugoDefinition | null;
}

export function GoalSlot({ target }: GoalSlotProps) {
  const filledIndices = useGameStore((state) => state.filledIndices);
  const currentTheme = useGameStore((state) => state.currentTheme);
  const difficultyMode = useGameStore((state) => state.difficultyMode);

  const theme = THEMES[currentTheme];
  const [showReading, setShowReading] = useState(false);

  // ターゲットが変わったら読みを隠す
  useEffect(() => {
    setShowReading(difficultyMode === "EASY");
  }, [target?.id, difficultyMode]);

  if (!target) return null;

  const sentenceParts = getSentenceParts(target);
  const isCompleted = target.components.length === filledIndices.length;
  const hasSentence = !!target.sentence;

  return (
    <motion.div
      layout
      className="w-full max-w-3xl mx-auto flex flex-col items-center py-6 relative"
    >
      {/* ラベル */}
      <div className="absolute top-0 left-4 opacity-50">
        <div
          className={`text-xs font-serif font-bold tracking-widest ${theme.colors.text}`}
        >
          文脈読解 Lv.{target.difficulty}
        </div>
      </div>

      {/* --- メインエリア --- */}
      <div className="w-full px-2 mt-8 mb-4">
        {!hasSentence ? (
          // 文章がない場合 (意味を表示)
          <div className="text-center">
            <h2
              className={`font-serif text-3xl md:text-4xl font-bold ${theme.colors.text} mb-6`}
            >
              {target.meaning || "???"}
            </h2>
            <div className="flex justify-center gap-2 mt-4">
              <SlotGroup
                target={target}
                filledIndices={filledIndices}
                theme={theme}
                isCompleted={isCompleted}
              />
            </div>
          </div>
        ) : (
          // 文章がある場合 (テキストとスロットを混ぜて表示)
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-6 leading-loose text-center">
            {sentenceParts.map((part, pIndex) => {
              if (part.type === "TEXT") {
                return (
                  <span
                    key={`text-${pIndex}`}
                    // ▼ 文字サイズを拡大: text-xl (スマホ) / text-3xl (PC)
                    className={`font-serif text-xl md:text-3xl font-bold ${theme.colors.text} opacity-80 mx-1`}
                  >
                    {part.text}
                  </span>
                );
              }
              // スロット
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
        )}
      </div>

      {/* --- 読みヒント --- */}
      <div className="h-10 mt-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {showReading || isCompleted ? (
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              // ▼ 読み仮名も少し大きく
              className={`font-serif text-lg md:text-xl tracking-[0.2em] font-bold ${
                isCompleted ? "text-amber-600" : theme.colors.sub
              }`}
            >
              {target.reading}
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReading(true)}
              className="text-xs text-stone-400 hover:text-stone-600 border border-stone-300 rounded-full px-4 py-1.5 transition-colors flex items-center gap-1"
            >
              <span>👁️</span> 読みヒント
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// スロットグループ
function SlotGroup({ target, filledIndices, theme, isCompleted }: any) {
  return (
    <div className="inline-flex items-center gap-1 mx-1 align-middle">
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

// 個別のスロット (サイズ拡大版)
function SingleSlot({
  char,
  isFilled,
  isCompleted,
}: {
  char: string;
  isFilled: boolean;
  isCompleted: boolean;
}) {
  return (
    <div
      className={`
        relative flex items-center justify-center
        transition-all duration-300
        
        /* ▼ サイズ変更箇所 */
        w-16 h-16      /* スマホ: 48px -> 64px */
        md:w-20 md:h-20 /* PC: 64px -> 80px */
      `}
    >
      {/* 枠線 */}
      <div
        className={`
          absolute inset-0 rounded-lg
          ${
            isFilled
              ? "border-2 border-stone-800 bg-white shadow-sm transform -rotate-1"
              : "border-2 border-dashed border-stone-400 bg-stone-100/30"
          }
          ${isCompleted ? "border-amber-500 bg-amber-50" : ""}
        `}
      />

      <AnimatePresence>
        {isFilled && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
              z-10 font-serif font-bold select-none 
              /* ▼ フォントサイズ変更箇所 */
              text-4xl       /* スマホ: 2xl -> 4xl */
              md:text-5xl    /* PC: 3xl -> 5xl */
              
              ${isCompleted ? "text-amber-700" : "text-stone-800"}
            `}
          >
            {char}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
