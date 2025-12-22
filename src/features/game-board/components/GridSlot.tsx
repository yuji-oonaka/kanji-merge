"use client";

import { motion } from "framer-motion";
import { GamePart } from "@/features/kanji-core/types";
import { useGameStore } from "../stores/store";
// ★修正: 新しく作った辞書専用ストアからインポート
import { useIdsMapStore } from "@/features/dictionary/stores/idsMapStore";
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

  // ★修正: idsMapStoreからデータを取得
  const idsMap = useIdsMapStore((state) => state.idsMap);

  const theme = THEMES[currentTheme];
  const isSelected = part && selectedPartId === part.id;
  const isPendingSource = pendingMerge?.sourceId === part?.id;
  const isPendingTarget = pendingMerge?.targetId === part?.id;

  // 表示する文字の決定
  const rawChar = isPendingTarget ? pendingMerge?.previewChar : part?.char;
  const displayChar = rawChar ? getDisplayChar(rawChar) : null;

  // 中間パーツかどうか判定 ("&"で始まる場合)
  const isIntermediate = rawChar?.startsWith("&");

  // 中間パーツの構成要素を取得
  const intermediateParts =
    isIntermediate && rawChar ? idsMap[rawChar] || ["?", "?"] : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative aspect-square w-full rounded-lg md:rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200",
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
            "w-[92%] h-[92%] border",
            theme.colors.partBg,
            theme.colors.partBorder,
            theme.colors.text,

            part?.type === "KANJI" &&
              "bg-amber-50 text-amber-900 border-amber-200",

            isPendingTarget &&
              "animate-pulse border-dashed border-[#d94a38] text-[#d94a38] bg-[#d94a38]/10",

            // 通常のフォントサイズ設定 (中間パーツのときは無効化)
            !isIntermediate &&
              "text-[clamp(1.5rem,8vmin,4rem)] font-serif font-bold pb-1 leading-none"
          )}
        >
          {isIntermediate && intermediateParts ? (
            <div className="flex flex-col w-full h-full items-center justify-center p-[15%] gap-[2%]">
              {/* 上半分 */}
              <div className="flex-1 w-full flex items-end justify-center border-b border-black/10">
                <span className="text-[clamp(0.6rem,3vmin,1.5rem)] font-bold leading-none mb-0.5">
                  {getDisplayChar(intermediateParts[0])}
                </span>
              </div>
              {/* 下半分 */}
              <div className="flex-1 w-full flex items-start justify-center">
                <span className="text-[clamp(0.6rem,3vmin,1.5rem)] font-bold leading-none mt-0.5">
                  {getDisplayChar(intermediateParts[1])}
                </span>
              </div>
            </div>
          ) : (
            displayChar
          )}
        </motion.div>
      )}
    </div>
  );
}
