"use client";

import { useGameStore } from "../stores/store";
import { GridSlot } from "./GridSlot";
import { useGridInteraction } from "../hooks/useGridInteraction";

export function GameBoard() {
  const parts = useGameStore((state) => state.parts);
  const { handleSlotClick } = useGridInteraction();

  // 4x4 = 16マス (難易度によって可変にするならここをprops化)
  const gridSize = 16;
  const slots = Array.from({ length: gridSize }, (_, i) => i);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* 4列グリッド */}
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {slots.map((index) => {
          // このマスにいるパーツを探す
          const part = parts.find((p) => p.gridIndex === index);

          return (
            <GridSlot
              key={index}
              index={index}
              part={part}
              onClick={() => handleSlotClick(index)}
            />
          );
        })}
      </div>
    </div>
  );
}
