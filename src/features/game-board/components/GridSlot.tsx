"use client";

import { motion } from "framer-motion";
import { GamePart } from "@/features/kanji-core/types";
import { useGameStore } from "../stores/store";
import { THEMES } from "../constants/themes";
import { cn } from "@/lib/utils/tw-merge";
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

  const rawChar = isPendingTarget ? pendingMerge?.previewChar : part?.char;
  const displayChar = rawChar ? getDisplayChar(rawChar) : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-lg md:rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200",
        theme.colors.slotBg,
        theme.colors.slotBorder,
        "border md:border-2",
        isSelected &&
          `border-[#d94a38] ring-2 ring-[#d94a38]/50 z-10 scale-105 shadow-lg`
      )}
    >
      <span
        className={`
          absolute top-0.5 left-1 md:top-1 md:left-2
          text-[8px] md:text-xs
          opacity-20 font-mono ${theme.colors.text}
        `}
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

            // 修正1: 画像に合わせて円を少し小さくし、スロット枠との間に明確な「隙間」を作ります。
            // 94% -> 88%
            "w-[92%] h-[92%] border",

            /* 修正2: フォントサイズを「円に収まる範囲」に厳格化
               Min: 1.75rem (28px) -> スマホ小画面用
               Val: 10vmin         -> 画面連動率を少し下げて余白確保
               Max: 4.5rem (72px)  -> PCでこれ以上大きくならないリミッター (前回6remは大きすぎました)
            */
            "text-[clamp(1.75rem,10vmin,4.5rem)]",

            "font-serif font-bold pb-1 leading-none",

            theme.colors.partBg,
            theme.colors.partBorder,
            theme.colors.text,

            // 配色は元のまま維持
            part?.type === "KANJI" &&
              "bg-amber-50 text-amber-900 border-amber-200",

            isPendingTarget &&
              "animate-pulse border-dashed border-[#d94a38] text-[#d94a38] bg-[#d94a38]/10"
          )}
        >
          {displayChar}
        </motion.div>
      )}
    </div>
  );
}
