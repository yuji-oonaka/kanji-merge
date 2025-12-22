import { create } from 'zustand';
// 自動生成されたJSONデータを読み込む
import idsMapData from '@/features/kanji-core/data/ids-map-auto.json';

interface IdsMapState {
  idsMap: Record<string, string[]>;
}

// 辞書データ専用のストア
// コンポーネント側で useIdsMapStore(s => s.idsMap) のように使う
export const useIdsMapStore = create<IdsMapState>(() => ({
  idsMap: idsMapData as Record<string, string[]>,
}));