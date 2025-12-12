import { MergeResult, IdsMap } from '../types';
// ★修正: 自動生成された辞書を読み込む
import idsMapData from '../data/ids-map-auto.json';

const IDS_MAP: IdsMap = idsMapData as unknown as IdsMap;

export function judgeMerge(charA: string, charB: string): MergeResult {
  for (const [targetKanji, parts] of Object.entries(IDS_MAP)) {
    // データが配列でない、または要素数が2でない場合はスキップ
    if (!Array.isArray(parts) || parts.length !== 2) continue;

    const [p1, p2] = parts;

    // 順不同で一致チェック
    const isMatch = 
      (p1 === charA && p2 === charB) || 
      (p1 === charB && p2 === charA);

    if (isMatch) {
      return {
        success: true,
        newChar: targetKanji,
        soundType: 'KANJI'
      };
    }
  }

  return { success: false, reason: 'INVALID_COMBINATION' };
}