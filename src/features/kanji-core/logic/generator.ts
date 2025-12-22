import { JukugoDefinition, DifficultyMode } from '../types';
import jukugoData from '../data/jukugo-db-auto.json';

// 表示上の違和感が強い熟語、または文字化けが解消できない熟語
const BLACKLIST_KANJI = [
  "穏", "隠", "勉", 
];

// 紛らわしいパーツの定義
const CONFUSING_PAIRS: Record<string, string[]> = {
  "日": ["目", "田", "白", "旧", "旦"],
  "月": ["円", "用", "且", "目"],
  "木": ["禾", "本", "未", "末", "米"],
  "土": ["士", "工", "干"],
  "王": ["玉", "主", "五"],
  "力": ["刀", "九", "カ"],
  "口": ["回"],
  "人": ["入", "八", "久"],
  "大": ["犬", "太", "天"],
  "小": ["少"],
  "牛": ["午", "手"],
  "石": ["右"],
  "右": ["石", "左"],
  "左": ["右", "在"],
};
const DEFAULT_DISTRACTORS = ["日", "月", "木", "山", "石", "田", "力", "口", "イ", "シ", "女", "王", "糸", "金", "土", "寸"];

/**
 * 難易度調整＆ステージ生成
 */
export function generateRandomStage(
  levelIndex: number, 
  excludeIds: string[] = [], 
  mode: DifficultyMode = 'NORMAL'
): JukugoDefinition {
  
  const data = jukugoData as JukugoDefinition[];
  let candidates: JukugoDefinition[] = [];

  // ブラックリスト除外
  const validData = data.filter(j => {
    const hasBlacklistedChar = j.components.some(c => BLACKLIST_KANJI.some(bk => c.includes(bk))) || BLACKLIST_KANJI.some(bk => j.kanji.includes(bk));
    return !hasBlacklistedChar;
  });

  // 現在のステージ数(1始まり)
  const currentStage = levelIndex + 1;

  if (mode === 'EASY') {
    // 【初級】常に簡単
    candidates = validData.filter(j => 
      j.components.length <= 2 && j.difficulty <= 3
    );
  } else {
    // 【標準】
    
    // ★変更点: ステージ10以降は完全ランダム（全難易度開放）
    if (currentStage >= 10) {
       // minDiff=1, maxDiff=10 で全範囲から抽選
       candidates = validData.filter(j => j.difficulty >= 1 && j.difficulty <= 10);
    } 
    else {
      // ステージ1〜9: メリハリ型ロジック (既存維持)
      const isBossLevel = currentStage % 5 === 0;
      let minDiff = 1;
      let maxDiff = 10;

      if (currentStage <= 5) {
        // 序盤: Lv1〜3 (2文字メイン)
        minDiff = 1; 
        maxDiff = 3;
      } else if (isBossLevel) {
        // ボス回: Lv4〜 (少し歯ごたえあり)
        minDiff = 4;
        maxDiff = 10;
      } else {
        // 通常回: Lv1〜5
        minDiff = 1;
        maxDiff = 5;
      }
      
      candidates = validData.filter(j => j.difficulty >= minDiff && j.difficulty <= maxDiff);
    }

    // 候補不足時のセーフティ
    if (candidates.length === 0) {
      candidates = validData; 
    }
  }

  // --- 履歴フィルタリング ---
  const freshCandidates = candidates.filter(j => !excludeIds.includes(j.id));
  if (freshCandidates.length > 0) {
    candidates = freshCandidates;
  } else if (candidates.length === 0) {
    // フォールバック: どうしても無ければ2文字熟語から選ぶ
    candidates = validData.filter(j => j.components.length === 2);
  }
  
  // 最終セーフティ
  if (candidates.length === 0) {
    return {
      id: "fallback",
      kanji: "平和",
      reading: "へいわ",
      difficulty: 1,
      components: ["平", "和"],
      meaning: "穏やかな状態",
      sentence: "世界の{{target}}を祈る"
    };
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

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