// src/features/adventure/stores/adventureStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// テーマの型定義
export type AdventureTheme = 'paper' | 'dark';

interface AdventureState {
  // 進行状況
  currentStageIndex: number;
  maxReachedIndex: number;
  
  // ▼ 追加: 表示設定
  theme: AdventureTheme;

  // アクション
  completeStage: (index: number) => void;
  resetProgress: () => void;
  // ▼ 追加: テーマ切り替え
  setTheme: (theme: AdventureTheme) => void;
}

export const useAdventureStore = create<AdventureState>()(
  persist(
    (set, get) => ({
      currentStageIndex: 0,
      maxReachedIndex: 0,
      theme: 'paper', // デフォルトは和紙（明）

      completeStage: (index: number) => {
        const { maxReachedIndex } = get();
        const nextIndex = index + 1;
        set({
          currentStageIndex: nextIndex,
          maxReachedIndex: Math.max(maxReachedIndex, nextIndex),
        });
      },

      resetProgress: () => {
        set({ currentStageIndex: 0, maxReachedIndex: 0 });
      },

      // ▼ 追加
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'adventure-storage',
      storage: createJSONStorage(() => localStorage),
      // 永続化する対象を指定（テーマも含める）
      partialize: (state) => ({
        currentStageIndex: state.currentStageIndex,
        maxReachedIndex: state.maxReachedIndex,
        theme: state.theme,
      }),
    }
  )
);