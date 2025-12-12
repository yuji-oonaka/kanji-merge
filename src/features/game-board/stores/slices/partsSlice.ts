import { StateCreator } from 'zustand';
import { GamePart } from '@/features/kanji-core/types';

// UI上でのパーツ型（ロジックの型 + 座標情報）
export interface PartState extends GamePart {
  x: number;
  y: number;
}

export interface PartsSlice {
  parts: PartState[];
  setParts: (parts: PartState[]) => void;
  updatePartPosition: (id: string, x: number, y: number) => void;
  removePart: (id: string) => void;
  addPart: (part: PartState) => void;
}

export const createPartsSlice: StateCreator<PartsSlice> = (set) => ({
  parts: [],
  
  setParts: (parts) => set({ parts }),

  updatePartPosition: (id, x, y) => 
    set((state) => ({
      parts: state.parts.map((p) => 
        p.id === id ? { ...p, x, y } : p
      ),
    })),

  removePart: (id) => 
    set((state) => ({
      parts: state.parts.filter((p) => p.id !== id),
    })),

  addPart: (part) => 
    set((state) => ({
      parts: [...state.parts, part],
    })),
});