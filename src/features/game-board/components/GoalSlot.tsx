"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { useGameStore } from "../stores/store";
import { getSentenceParts } from "@/features/kanji-core/logic/sentenceHelper";
import { THEMES } from "../constants/themes";
import { getDisplayChar } from "@/features/game-board/utils/charDisplay";

interface GoalSlotProps {
  target: JukugoDefinition | null;
}

export function GoalSlot({ target }: GoalSlotProps) {
  const filledIndices = useGameStore((state) => state.filledIndices);
  const currentTheme = useGameStore((state) => state.currentTheme);
  const difficultyMode = useGameStore((state) => state.difficultyMode);

  const theme = THEMES[currentTheme];
  const [showReading, setShowReading] = useState(false);

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
      className="w-full max-w-5xl mx-auto flex flex-col items-center relative"
    >
      {/* ラベル */}
      <div className="hidden md:block absolute -top-4 lg:-top-8 left-4 opacity-50">
        <div
          className={`text-xs lg:text-sm font-serif font-bold tracking-widest ${theme.colors.text}`}
        >
          文脈読解 Lv.{target.difficulty}
        </div>
      </div>

      {/* --- メインエリア --- */}
      <div className="w-full my-1 md:my-4">
        {!hasSentence ? (
          <div className="text-center">
            <h2
              className={`font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold ${theme.colors.text} mb-4 lg:mb-8 leading-snug`}
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
          // 文章表示
          <div className="flex flex-wrap items-center justify-center gap-x-0.5 sm:gap-x-1 gap-y-2 sm:gap-y-4 lg:gap-y-6 leading-relaxed text-center px-1">
            {sentenceParts.map((part, pIndex) => {
              if (part.type === "TEXT") {
                return (
                  <span
                    key={`text-${pIndex}`}
                    // ★修正: 大画面(lg/xl)でさらに大きく表示
                    className={`font-serif text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold ${theme.colors.text} opacity-95 mx-0.5 md:mx-1 lg:mx-2`}
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
        )}
      </div>

      {/* --- 読みヒント --- */}
      <div className="h-8 lg:h-12 mt-4 lg:mt-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {showReading || isCompleted ? (
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              className={`font-serif text-xl md:text-3xl lg:text-4xl tracking-[0.2em] font-bold ${
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
              className="text-xs lg:text-base text-stone-400 hover:text-stone-600 border border-stone-300 rounded-full px-4 py-1.5 lg:px-6 lg:py-2 transition-colors flex items-center gap-2 bg-white/50"
            >
              <span className="text-base lg:text-lg">👁️</span>
              <span className="font-bold">読みヒント</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SlotGroup({ target, filledIndices, theme, isCompleted }: any) {
  return (
    <div className="inline-flex items-center gap-1 md:gap-2 mx-0.5 align-middle">
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
  // ★追加: 表示用変換
  const displayChar = getDisplayChar(char);

  return (
    <div
      className={`
        relative flex items-center justify-center
        transition-all duration-300
        w-12 h-12       /* SE3 (base) */
        sm:w-16 sm:h-16 /* iPhone14 */
        md:w-24 md:h-24 /* iPad/PC */
        lg:w-28 lg:h-28 /* Large PC */
        xl:w-32 xl:h-32 /* Extra Large */
      `}
    >
      {/* ... (枠線のdivはそのまま) ... */}
      <div
        className={`
          absolute inset-0 rounded-xl
          ${
            isFilled
              ? "border-2 border-stone-800 bg-white shadow-md transform -rotate-1"
              : "border-2 border-dashed border-stone-400 bg-stone-100/40"
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
              text-3xl       
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
              xl:text-8xl
              ${isCompleted ? "text-amber-700" : "text-stone-800"}
            `}
          >
            {/* ★修正: displayChar を表示 */}
            {displayChar}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
