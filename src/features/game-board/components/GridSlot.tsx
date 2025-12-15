"use client";

import { motion } from "framer-motion";
import { GamePart } from "@/features/kanji-core/types";
import { useGameStore } from "../stores/store";
import { THEMES } from "../constants/themes";
import { cn } from "@/lib/utils/tw-merge";
// ★追加: 変換関数をインポート
import { getDisplayChar } from "@/features/game-board/utils/charDisplay";

interface GridSlotProps {
  index: number;
  part?: GamePart;
  onClick: () => void;
}

export function GridSlot({ index, part, onClick }: GridSlotProps) {
  const selectedPartId = useGameStore((state) => state.selectedPartId);
  const currentTheme = useGameStore((state) => state.currentTheme);
  const pendingMerge = useGameStore((state) => state.pendingMerge);

  const theme = THEMES[currentTheme];
  const isSelected = part && selectedPartId === part.id;
  const isPendingSource = pendingMerge?.sourceId === part?.id;
  const isPendingTarget = pendingMerge?.targetId === part?.id;

  // ★修正: 生の文字データではなく、表示用に変換した文字を使う
  const rawChar = isPendingTarget ? pendingMerge?.previewChar : part?.char;
  const displayChar = rawChar ? getDisplayChar(rawChar) : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200",
        theme.colors.slotBg,
        theme.colors.slotBorder,
        "border-2",
        isSelected &&
          `border-[#d94a38] ring-2 ring-[#d94a38]/50 z-10 scale-105 shadow-lg`
      )}
    >
      <span
        className={`absolute top-1 left-2 text-[10px] md:text-xs opacity-20 font-mono ${theme.colors.text}`}
      >
        {index + 1}
      </span>

      {(part || isPendingTarget) && (
        <motion.div
          layoutId={isPendingTarget ? undefined : `part-${part?.id}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: isPendingSource ? 0 : 1,
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "flex items-center justify-center rounded-full shadow-sm select-none",
            "w-[88%] h-[88%] border",
            "text-5xl sm:text-6xl lg:text-7xl font-serif font-bold pb-1.5",
            theme.colors.partBg,
            theme.colors.partBorder,
            theme.colors.text,
            part?.type === "KANJI" &&
              "bg-amber-50 text-amber-900 border-amber-200",
            isPendingTarget &&
              "animate-pulse border-dashed border-[#d94a38] text-[#d94a38] bg-[#d94a38]/10"
          )}
        >
          {/* ★修正: displayChar を表示 */}
          {displayChar}
        </motion.div>
      )}
    </div>
  );
}
