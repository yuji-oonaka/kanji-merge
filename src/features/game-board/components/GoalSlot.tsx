"use client";

import { motion } from "framer-motion";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { useGameStore } from "../stores/store";
import { THEMES } from "../constants/themes"; // 追加

interface GoalSlotProps {
  target: JukugoDefinition | null;
}

export function GoalSlot({ target }: GoalSlotProps) {
  const filledIndices = useGameStore((state) => state.filledIndices);
  const currentTheme = useGameStore((state) => state.currentTheme); // 追加
  const theme = THEMES[currentTheme]; // 追加

  if (!target) return null;

  const charCount = target.components.length;
  const isLong = charCount >= 4;
  const isMedium = charCount === 3;

  let slotSizeClass = "w-20 h-20";
  let textSizeClass = "text-4xl";

  if (isLong) {
    slotSizeClass = "w-14 h-14 md:w-16 md:h-16";
    textSizeClass = "text-2xl md:text-3xl";
  } else if (isMedium) {
    slotSizeClass = "w-16 h-16 md:w-20 md:h-20";
    textSizeClass = "text-3xl md:text-4xl";
  }

  return (
    <div
      className={`
      flex flex-col items-center gap-2 p-4 rounded-xl shadow-sm border transition-all duration-500 mx-4 backdrop-blur-sm
      ${theme.colors.partBg} ${theme.colors.partBorder}
    `}
    >
      <div className={`text-xs font-bold tracking-widest ${theme.colors.sub}`}>
        TARGET
      </div>

      <div className="flex gap-2 md:gap-4 justify-center">
        {target.components.map((char, index) => {
          const isFilled = filledIndices.includes(index);

          return (
            <div
              key={`${target.id}-slot-${index}`}
              // ▼ テーマ色を適用
              className={`
                relative ${slotSizeClass} border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden transition-all
                ${theme.colors.slotBg} ${theme.colors.slotBorder}
              `}
            >
              {/* 正解の漢字 */}
              {isFilled && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  // ▼ 正解時の色は強調色(accent)を使うか、視認性重視で固定にするか
                  // ここでは視認性を重視して、和風:薄橙、その他:テーマ色に合わせて調整
                  className={`
                    w-full h-full flex items-center justify-center font-bold font-serif
                    ${textSizeClass}
                    ${
                      currentTheme === "paper"
                        ? "bg-amber-100 text-amber-900"
                        : `${theme.colors.accent} bg-white/10`
                    }
                  `}
                >
                  {char}
                </motion.div>
              )}

              {/* 未正解時のヒント */}
              {!isFilled && (
                <span
                  className={`font-serif opacity-20 ${textSizeClass} ${theme.colors.text}`}
                >
                  ?
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className={`text-sm font-medium ${theme.colors.sub}`}>
        読み: {target.reading}
      </div>
    </div>
  );
}
