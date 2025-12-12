import { JukugoDefinition } from '../types';
import jukugoData from '../data/jukugo-db-auto.json';

/**
 * 難易度調整＆ステージ生成
 * @param levelIndex 現在のレベル
 * @param excludeIds 出題履歴にあるIDリスト (これらは候補から除外)
 */
export function generateRandomStage(levelIndex: number, excludeIds: string[] = []): JukugoDefinition {
  
  let minDiff = 1;
  let maxDiff = 1;

  // レベルカーブ設定
  if (levelIndex < 5) {
    minDiff = 1; maxDiff = 2;
  } else if (levelIndex < 15) {
    minDiff = 2; maxDiff = 4;
  } else if (levelIndex < 25) {
    minDiff = 4; maxDiff = 7;
  } else if (levelIndex < 40) {
    minDiff = 6; maxDiff = 9;
  } else {
    minDiff = 8; maxDiff = 10;
  }

  const data = jukugoData as JukugoDefinition[];

  // 1. まず難易度で絞り込む
  let candidates = data.filter(j => j.difficulty >= minDiff && j.difficulty <= maxDiff);

  // 2. さらに履歴にあるものを除外する
  const freshCandidates = candidates.filter(j => !excludeIds.includes(j.id));

  // もし履歴除外後の候補が残っていれば、そこから選ぶ (優先)
  if (freshCandidates.length > 0) {
    candidates = freshCandidates;
  } else {
    // 候補が尽きてしまった場合 (履歴が多すぎる、またはデータ不足)
    // 仕方ないので履歴フィルターを解除し、難易度フィルターのみで再挑戦
    // (それでもなければ全データへフォールバック)
    if (candidates.length === 0) {
       candidates = data.filter(j => j.difficulty <= maxDiff);
    }
  }
  
  if (candidates.length === 0) {
    // 最終手段
    return {
      id: "error",
      kanji: "空気",
      reading: "くうき",
      difficulty: 1,
      components: ["空", "気"],
      meaning: "データがありません"
    };
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

// 紛らわしい漢字ペア
const CONFUSING_PAIRS: Record<string, string[]> = {
  "日": ["目", "田", "白", "旧", "旦"],
  "月": ["円", "用", "且", "目"],
  "木": ["禾", "本", "未", "末", "米"],
  "土": ["士", "工", "干"],
  "王": ["玉", "主", "五"],
  "力": ["刀", "九", "カ"],
  "口": ["ロ", "回"],
  "人": ["入", "八", "久"],
  "大": ["犬", "太", "天"],
  "小": ["少"],
  "牛": ["午", "手"],
  "石": ["右"],
  "右": ["石", "左"],
  "左": ["右", "在"],
};

const DEFAULT_DISTRACTORS = ["日", "月", "木", "山", "石", "田", "力", "口", "イ", "シ", "女", "王", "糸", "金", "土", "寸"];

export function getDistractorParts(count: number, correctParts: string[]): string[] {
  const candidates = new Set<string>();

  correctParts.forEach(char => {
    if (CONFUSING_PAIRS[char]) {
      CONFUSING_PAIRS[char].forEach(d => candidates.add(d));
    }
  });

  DEFAULT_DISTRACTORS.forEach(d => candidates.add(d));

  const candidateArray = Array.from(candidates);
  const validCandidates = candidateArray.filter(c => !correctParts.includes(c));
  
  const result: string[] = [];
  
  while (result.length < count) {
    if (validCandidates.length === 0) break;
    const idx = Math.floor(Math.random() * validCandidates.length);
    result.push(validCandidates[idx]);
    validCandidates.splice(idx, 1);
  }
  
  return result;
}