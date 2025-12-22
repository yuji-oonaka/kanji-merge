import { StateCreator } from 'zustand';
import { GamePart } from '@/features/kanji-core/types';

// 仮合体（プレビュー）の状態
export interface PendingMergeState {
  sourceId: string;    // 元のパーツ（手札）
  targetId: string;    // 合体先のパーツ（場のパーツ）
  previewChar: string; // 合体後の予測漢字（例："明"）
}

export interface PartsSlice {
  parts: GamePart[];
  selectedPartId: string | null;
  pendingMerge: PendingMergeState | null;
  
  // ★追加: 震えているパーツのIDリスト
  shakingPartIds: string[];

  setParts: (parts: GamePart[]) => void;
  selectPart: (id: string | null) => void;
  setPendingMerge: (state: PendingMergeState | null) => void;
  
  movePart: (id: string, toIndex: number) => void;
  removePart: (id: string) => void;
  addPart: (part: GamePart) => void;
  updatePart: (id: string, updates: Partial<GamePart>) => void;

  // ★追加: 名前を shakeParts に統一しました
  shakeParts: (ids: string[]) => void;
}

export const createPartsSlice: StateCreator<PartsSlice> = (set) => ({
  parts: [],
  selectedPartId: null,
  pendingMerge: null,
  shakingPartIds: [],
  
  setParts: (parts) => set({ parts, selectedPartId: null, pendingMerge: null, shakingPartIds: [] }),
  
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

  updatePart: (id, updates) =>
    set((state) => ({
      parts: state.parts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  // ★実装: アニメーション用のフラグ管理
  shakeParts: (ids) => {
    // 1. リストに追加（震え開始）
    set((state) => ({
      shakingPartIds: [...state.shakingPartIds, ...ids],
    }));
    
    // 2. 0.5秒後にリストから削除（震え停止）
    setTimeout(() => {
      set((state) => ({
        shakingPartIds: state.shakingPartIds.filter((id) => !ids.includes(id)),
      }));
    }, 500);
  },
});