"use client";

import { motion, useDragControls } from "framer-motion";
import { useState } from "react";

// エイリアス(@)を使わず、相対パスで確実に指定
// components -> game-board -> features -> src -> kanji-core...
import { GamePart } from "../../kanji-core/types";
import { useMergeJudge } from "../hooks/useMergeJudge";
// components -> game-board -> features -> src -> lib -> utils...
import { cn } from "../../../lib/utils/tw-merge";

interface FloatingPartProps {
  part: GamePart;
  x: number;
  y: number;
}

// 指で隠れないようにずらす量 (px)
const DRAG_OFFSET_Y = -60;

export function FloatingPart({ part, x, y }: FloatingPartProps) {
  const controls = useDragControls();
  const { handleDragEnd } = useMergeJudge();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag
      dragControls={controls}
      dragMomentum={false} // 慣性を切って吸い付きを良くする
      dragElastic={0} // ゴム紐効果も切る
      // 座標は初期値のみ渡し、あとはFramer Motionに任せる
      initial={{ x, y, scale: 0, opacity: 0 }}
      animate={{
        x,
        y,
        scale: isDragging ? 1.2 : 1, // ドラッグ中は大きく
        opacity: 1,
        zIndex: isDragging ? 50 : 0, // ドラッグ中は最前面
        filter: isDragging
          ? "drop-shadow(0px 10px 10px rgba(0,0,0,0.3))"
          : "none", // 持ち上げてる感の影
      }}
      // ドラッグ開始・終了の検知
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);

        // ドロップ時の絶対座標を計算
        // x, y = ストア上の初期位置
        // info.offset = ドラッグ開始位置からの移動量
        const currentFingerX = x + info.offset.x;
        const currentFingerY = y + info.offset.y;

        // ★重要: 判定座標を「指の位置」ではなく「表示されている漢字の位置」に補正する
        // 見た目を上にずらしているので、判定も上にずらさないと直感とズレる
        const dropX = currentFingerX;
        const dropY = currentFingerY + DRAG_OFFSET_Y;

        handleDragEnd(part, dropX, dropY);
      }}
      className="absolute touch-none select-none flex items-center justify-center cursor-grab active:cursor-grabbing"
    >
      {/* ドラッグのヒット判定(親div)と、見た目の表示(子div)を分けることで
        「判定は指の位置だが、見た目は上」を実現する
      */}
      <motion.div
        animate={{
          y: isDragging ? DRAG_OFFSET_Y : 0, // ドラッグ中だけ上にずらす
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "flex items-center justify-center",
          "w-16 h-16 rounded-full shadow-lg",
          "bg-white border-2 border-stone-200 text-stone-800",
          "font-serif text-3xl font-bold",
          "transition-colors",
          part.type === "KANJI"
            ? "bg-amber-50 border-amber-200 text-amber-900 w-20 h-20 text-4xl"
            : "bg-white"
        )}
      >
        {part.char}
      </motion.div>
    </motion.div>
  );
}
