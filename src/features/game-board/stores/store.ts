import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PartsSlice, createPartsSlice } from './slices/partsSlice';
import { StageSlice, createStageSlice } from './slices/stageSlice';
import { DictionarySlice, createDictionarySlice } from '@/features/dictionary/stores/dictionarySlice';
import { EffectSlice, createEffectSlice } from './slices/effectSlice';

// 型定義に EffectSlice を追加
type GameStore = PartsSlice & StageSlice & DictionarySlice & EffectSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createPartsSlice(...a),
      ...createStageSlice(...a),
      ...createDictionarySlice(...a),
      ...createEffectSlice(...a),
    }),
    {
      name: 'kanji-merge-storage',
      // エフェクト自体は保存する必要がないので除外する
      partialize: (state) => ({ 
        unlockedIds: state.unlockedIds,
        levelIndex: state.levelIndex 
      }),
    }
  )
);