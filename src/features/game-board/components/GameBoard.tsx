"use client";

import { useGameStore } from "../stores/store";
import { GridSlot } from "./GridSlot";
import { useGridInteraction } from "../hooks/useGridInteraction";
import { cn } from "@/lib/utils/tw-merge";

export function GameBoard() {
  const parts = useGameStore((state) => state.parts);
  const { handleSlotClick } = useGridInteraction();

  const gridSize = 16;
  const slots = Array.from({ length: gridSize }, (_, i) => i);

  return (
    <div className="w-full h-full flex items-center justify-center touch-none select-none">
      <div
        className={cn(
          "grid grid-cols-4 w-full h-full",
          "gap-1.5 md:gap-3 lg:gap-4",
          "p-2 md:p-3",
          "bg-white/40 backdrop-blur-sm rounded-xl border border-stone-200/50 shadow-inner"
        )}
      >
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
