"use client";

import { motion, useDragControls } from "framer-motion";
import { useState } from "react";
import { GamePart } from "../../kanji-core/types";
import { useMergeJudge } from "../hooks/useMergeJudge";
import { cn } from "../../../lib/utils/tw-merge";
import { useGameStore } from "../stores/store"; // 追加
import { THEMES } from "../constants/themes"; // 追加

interface FloatingPartProps {
  part: GamePart;
  x: number;
  y: number;
}

const DRAG_OFFSET_Y = -60;

export function FloatingPart({ part, x, y }: FloatingPartProps) {
  const controls = useDragControls();
  const { handleDragEnd } = useMergeJudge();
  const [isDragging, setIsDragging] = useState(false);

  // ▼ テーマ取得
  const currentTheme = useGameStore((state) => state.currentTheme);
  const theme = THEMES[currentTheme];

  return (
    <motion.div
      drag
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      initial={{ x, y, scale: 0, opacity: 0 }}
      animate={{
        x,
        y,
        scale: isDragging ? 1.2 : 1,
        opacity: 1,
        zIndex: isDragging ? 50 : 0,
        filter: isDragging
          ? "drop-shadow(0px 10px 10px rgba(0,0,0,0.3))"
          : "none",
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        const currentFingerX = x + info.offset.x;
        const currentFingerY = y + info.offset.y;
        const dropX = currentFingerX;
        const dropY = currentFingerY + DRAG_OFFSET_Y;
        handleDragEnd(part, dropX, dropY);
      }}
      className="absolute touch-none select-none flex items-center justify-center cursor-grab active:cursor-grabbing"
    >
      <motion.div
        animate={{
          y: isDragging ? DRAG_OFFSET_Y : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        // ▼ クラス名を動的に変更
        className={cn(
          "flex items-center justify-center",
          "w-16 h-16 rounded-full shadow-lg",
          "border-2",
          "font-serif text-3xl font-bold",
          "transition-colors duration-300",
          theme.colors.partBg, // 背景色
          theme.colors.partBorder, // 枠線色
          theme.colors.text, // 文字色

          // 漢字(KANJI)タイプの場合は少し大きく強調
          part.type === "KANJI" && [
            "w-20 h-20 text-4xl",
            // KANJIの場合はアクセントカラーを混ぜるなどの調整
            currentTheme === "paper"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : `border-[${theme.colors.accent}]`,
          ]
        )}
      >
        {part.char}
      </motion.div>
    </motion.div>
  );
}
