"use client";

import { motion } from "framer-motion";
import { GamePart } from "@/features/kanji-core/types";
import { useGameStore } from "../stores/store";
import { THEMES } from "../constants/themes";
import { cn } from "@/lib/utils/tw-merge";

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

  // 仮合体情報のチェック
  const isPendingSource = pendingMerge?.sourceId === part?.id;
  const isPendingTarget = pendingMerge?.targetId === part?.id;

  // 表示すべき文字：仮合体先なら「プレビュー文字」、それ以外は「本来の文字」
  const displayChar = isPendingTarget ? pendingMerge?.previewChar : part?.char;
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200",
        theme.colors.slotBg,
        theme.colors.slotBorder,
        "border-2",
        // ▼ 修正: 選択時の枠線をより強調（朱色のはっきりした枠線 + 拡大）
        isSelected &&
          `border-[#d94a38] ring-2 ring-[#d94a38]/50 z-10 scale-105 shadow-lg`
      )}
    >
      {/* マス番号 */}
      <span
        className={`absolute top-1 left-2 text-[10px] opacity-20 font-mono ${theme.colors.text}`}
      >
        {index + 1}
      </span>

      {/* パーツ表示 */}
      {/* 元のパーツ(Source)は、仮合体中は隠す(opacity-0) */}
      {(part || isPendingTarget) && (
        <motion.div
          layoutId={isPendingTarget ? undefined : `part-${part?.id}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: isPendingSource ? 0 : 1, // 仮合体元は消す
          }}
          // 仮合体先(Target)は点滅アニメーションさせて「仮」であることを伝える
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "flex items-center justify-center rounded-full shadow-sm select-none",
            "w-[80%] h-[80%] text-3xl md:text-4xl font-serif font-bold border",
            theme.colors.partBg,
            theme.colors.partBorder,
            theme.colors.text,

            // 漢字タイプの場合
            part?.type === "KANJI" &&
              "bg-amber-50 text-amber-900 border-amber-200",

            // ▼ 仮合体中のプレビュー表示スタイル（点滅 + 色変化）
            isPendingTarget &&
              "animate-pulse border-dashed border-[#d94a38] text-[#d94a38] bg-[#d94a38]/10"
          )}
        >
          {displayChar}
        </motion.div>
      )}

      {/* 仮合体中の「？」マークや「決定」ガイドを出しても親切かも（今回はシンプルに） */}
    </div>
  );
}
