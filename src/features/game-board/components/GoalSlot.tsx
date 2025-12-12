"use client";

import { motion } from "framer-motion";
import { JukugoDefinition } from "@/features/kanji-core/types";
// ★修正: 正しいパスを指定
import { useGameStore } from "../stores/store";

interface GoalSlotProps {
  target: JukugoDefinition | null;
}

export function GoalSlot({ target }: GoalSlotProps) {
  const filledIndices = useGameStore((state) => state.filledIndices);

  if (!target) return null;

  const charCount = target.components.length;
  // 文字数が多い場合はスロットサイズを小さくする
  const isLong = charCount >= 4;
  const isMedium = charCount === 3;

  // サイズクラスの決定
  let slotSizeClass = "w-20 h-20"; // デフォルト(2文字)
  let textSizeClass = "text-4xl";

  if (isLong) {
    slotSizeClass = "w-14 h-14 md:w-16 md:h-16";
    textSizeClass = "text-2xl md:text-3xl";
  } else if (isMedium) {
    slotSizeClass = "w-16 h-16 md:w-20 md:h-20";
    textSizeClass = "text-3xl md:text-4xl";
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-stone-200 transition-all duration-500 mx-4">
      <div className="text-xs font-bold text-stone-400 tracking-widest">
        TARGET
      </div>

      <div className="flex gap-2 md:gap-4 justify-center">
        {target.components.map((char, index) => {
          const isFilled = filledIndices.includes(index);

          return (
            <div
              key={`${target.id}-slot-${index}`}
              className={`relative ${slotSizeClass} border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center bg-stone-50/50 overflow-hidden transition-all`}
            >
              {/* 正解の漢字 */}
              {isFilled && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className={`w-full h-full bg-amber-100 flex items-center justify-center ${textSizeClass} text-amber-900 font-bold font-serif`}
                >
                  {char}
                </motion.div>
              )}

              {/* 未正解時のヒント */}
              {!isFilled && (
                <span
                  className={`text-stone-200 font-serif opacity-20 ${textSizeClass}`}
                >
                  ?
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-sm font-medium text-stone-500 mt-1">
        読み: {target.reading}
      </div>
    </div>
  );
}
