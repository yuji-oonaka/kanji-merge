import { StateCreator } from 'zustand';

// エフェクトの定義
export interface EffectData {
  id: string;
  x: number;
  y: number;
  type: 'MERGE' | 'GOAL';
  char?: string; // ★追加: 表示する文字情報
}

export interface EffectSlice {
  effects: EffectData[];
  // 引数に char を追加
  triggerEffect: (x: number, y: number, type: 'MERGE' | 'GOAL', char?: string) => void;
  removeEffect: (id: string) => void;
}

export const createEffectSlice: StateCreator<EffectSlice> = (set) => ({
  effects: [],

  triggerEffect: (x, y, type, char) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      effects: [...state.effects, { id, x, y, type, char }],
    }));
  },

  removeEffect: (id) => {
    set((state) => ({
      effects: state.effects.filter((e) => e.id !== id),
    }));
  },
});