"use client";

import { useGameStore } from "../stores/store";
import { GridSlot } from "./GridSlot";
import { useGridInteraction } from "../hooks/useGridInteraction";

export function GameBoard() {
  const parts = useGameStore((state) => state.parts);
  const { handleSlotClick } = useGridInteraction();

  const gridSize = 16;
  const slots = Array.from({ length: gridSize }, (_, i) => i);

  return (
    // ★修正: max-w制限を削除し、親コンテナ(StageView)の制御に従うようにする
    <div className="w-full flex items-center justify-center">
      <div className="grid grid-cols-4 gap-2 md:gap-4 lg:gap-6 aspect-square w-full shadow-sm">
        {slots.map((index) => {
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
