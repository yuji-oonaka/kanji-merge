import { StateCreator } from 'zustand';
import { GamePart } from '@/features/kanji-core/types';

// UI上でのパーツ型（グリッド版）
export interface PartState extends GamePart {
  gridIndex: number; // 0 ~ 15 (4x4の場合)
}

// 仮合体（プレビュー）の状態
export interface PendingMergeState {
  sourceId: string;    // 元のパーツ（手札）
  targetId: string;    // 合体先のパーツ（場のパーツ）
  previewChar: string; // 合体後の予測漢字（例："明"）
}

export interface PartsSlice {
  parts: PartState[];
  selectedPartId: string | null;     // 選択中のパーツID
  pendingMerge: PendingMergeState | null; // 仮合体中の情報

  setParts: (parts: PartState[]) => void;
  selectPart: (id: string | null) => void;
  setPendingMerge: (state: PendingMergeState | null) => void;
  
  // パーツ移動（グリッド間移動や合体確定時）
  movePart: (id: string, toIndex: number) => void;
  removePart: (id: string) => void;
  addPart: (part: PartState) => void;
}

export const createPartsSlice: StateCreator<PartsSlice> = (set) => ({
  parts: [],
  selectedPartId: null,
  pendingMerge: null,
  
  setParts: (parts) => set({ parts, selectedPartId: null, pendingMerge: null }),
  
  selectPart: (id) => set({ selectedPartId: id }),
  
  setPendingMerge: (state) => set({ pendingMerge: state }),

  movePart: (id, toIndex) => 
    set((state) => ({
      parts: state.parts.map((p) => 
        p.id === id ? { ...p, gridIndex: toIndex } : p
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