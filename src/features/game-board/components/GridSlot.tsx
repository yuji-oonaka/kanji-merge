"use client";

import { motion } from "framer-motion";
import { GamePart } from "@/features/kanji-core/types";
import { useGameStore } from "../stores/store";
import { useIdsMapStore } from "@/features/dictionary/stores/idsMapStore";
import { THEMES } from "../constants/themes";
import { cn } from "@/lib/utils/tw-merge";
import { getDisplayChar } from "@/features/game-board/utils/charDisplay";

// 縦積み判定ロジック
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

interface GridSlotProps {
  index: number;
  part?: GamePart;
  onClick: (e: React.MouseEvent) => void;
}

export function GridSlot({ index, part, onClick }: GridSlotProps) {
  const selectedPartId = useGameStore((state) => state.selectedPartId);
  const currentTheme = useGameStore((state) => state.currentTheme);
  const pendingMerge = useGameStore((state) => state.pendingMerge);
  const shakingPartIds = useGameStore((state) => state.shakingPartIds);
  const idsMap = useIdsMapStore((state) => state.idsMap);

  const theme = THEMES[currentTheme];
  const isSelected = part && selectedPartId === part.id;
  const isPendingSource = pendingMerge?.sourceId === part?.id;
  const isPendingTarget = pendingMerge?.targetId === part?.id;
  const isShaking = part && shakingPartIds.includes(part.id);

  const rawChar = isPendingTarget ? pendingMerge?.previewChar : part?.char;
  const displayChar = rawChar ? getDisplayChar(rawChar) : null;
  const isIntermediate = rawChar?.startsWith("&");

  // ★修正: 中間パーツの解決ロジックを強化
  // idsMapに定義がなくても、IDの文字列からパーツを推測して表示する
  let intermediateParts: string[] | null = null;

  if (isIntermediate && rawChar) {
    // 1. まず辞書を引く
    if (idsMap[rawChar]) {
      intermediateParts = idsMap[rawChar];
    } else {
      // 2. 辞書になければ、IDから推測する (例: "&美土_0" -> "美"と"土")
      // "&" と末尾の "_数字" を除去
      const cleanStr = rawChar.replace(/^&/, "").replace(/_\d+$/, "");
      // サロゲートペア対応で文字配列に変換
      const chars = Array.from(cleanStr);

      // ちょうど2文字なら、それをパーツとして扱う
      if (chars.length === 2) {
        intermediateParts = [chars[0], chars[1]];
      } else {
        // 解析不能なら?を表示
        intermediateParts = ["?", "?"];
      }
    }
  }

  // レイアウト方向の決定
  const isVertical = intermediateParts
    ? isVerticalLayout(intermediateParts[0], intermediateParts[1])
    : true;

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
          animate={
            isShaking
              ? {
                  x: [0, -5, 5, -5, 5, 0],
                  scale: 1,
                  opacity: 1,
                }
              : {
                  scale: 1,
                  opacity: isPendingSource ? 0 : 1,
                  x: 0,
                }
          }
          whileTap={{ scale: 0.9 }}
          transition={
            isShaking
              ? { duration: 0.4, ease: "easeInOut" }
              : { type: "spring", stiffness: 300, damping: 25 }
          }
          className={cn(
            "flex items-center justify-center rounded-full shadow-sm select-none",
            "w-[92%] h-[92%] border",
            theme.colors.partBg,
            theme.colors.partBorder,
            theme.colors.text,
            part?.type === "KANJI" &&
              "bg-amber-50 text-amber-900 border-amber-200",

            isPendingTarget &&
              "animate-pulse border-dashed border-[#d94a38] text-[#c03525] bg-[#d94a38]/20 font-black",

            isShaking && "border-red-400 bg-red-50",

            !isIntermediate &&
              "text-[clamp(1.5rem,8vmin,4rem)] font-serif font-bold pb-1 leading-none"
          )}
        >
          {isIntermediate && intermediateParts ? (
            <div
              className={cn(
                "flex w-full h-full items-center justify-center p-1 font-serif",
                isVertical ? "flex-col gap-0" : "flex-row gap-0"
              )}
            >
              {/* --- 1つ目のパーツ --- */}
              <div
                className={cn(
                  "flex-1 w-full h-full flex items-center justify-center",
                  isVertical ? "items-end -mb-1" : "justify-end -mr-0.5"
                )}
              >
                <span className="text-[clamp(1.2rem,5vmin,2.4rem)] font-bold leading-none">
                  {getDisplayChar(intermediateParts[0])}
                </span>
              </div>

              {/* --- 2つ目のパーツ --- */}
              <div
                className={cn(
                  "flex-1 w-full h-full flex items-center justify-center",
                  isVertical ? "items-start -mt-1" : "justify-start -mr-0.5"
                )}
              >
                <span className="text-[clamp(1.2rem,5vmin,2.4rem)] font-bold leading-none">
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
