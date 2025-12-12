import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartsSlice, createPartsSlice } from './slices/partsSlice';
import { StageSlice, createStageSlice } from './slices/stageSlice';
import { DictionarySlice, createDictionarySlice } from '@/features/dictionary/stores/dictionarySlice';

type GameStore = PartsSlice & StageSlice & DictionarySlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createPartsSlice(...a),
      ...createStageSlice(...a),
      ...createDictionarySlice(...a),
    }),
    {
      name: 'kanji-merge-storage',
      partialize: (state) => ({ 
        unlockedIds: state.unlockedIds,
        unlockedJukugos: state.unlockedJukugos,
        levelIndex: state.levelIndex,
        maxReachedLevel: state.maxReachedLevel, // ★追加
        historyIds: state.historyIds
      }),
    }
  )
);