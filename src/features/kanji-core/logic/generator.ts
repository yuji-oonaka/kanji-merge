import { JukugoDefinition, DifficultyMode } from '../types';
import jukugoData from '../data/jukugo-db-auto.json';

// 表示上の違和感が強い熟語、または文字化けが解消できない熟語
const BLACKLIST_KANJI = [
  "穏", "隠", "勉", 
];

/**
 * 難易度調整＆ステージ生成
 * * 変更点: レベルが上がっても常に難しい問題ばかり出すのではなく、
 * 緩急（波）をつけて、基本は気持ちよく解ける問題を出すように調整。
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

  if (mode === 'EASY') {
    // 【初級】常に簡単
    candidates = validData.filter(j => 
      j.components.length <= 2 && j.difficulty <= 3
    );
  } else {
    // 【標準】メリハリ型ロジックに変更
    
    // 現在のステージ数(1始まり)
    const currentStage = levelIndex + 1;
    
    // 5ステージごとに「ボス（難しめ）」、それ以外は「通常（ランダム）」
    const isBossLevel = currentStage % 5 === 0;

    let minDiff = 1;
    let maxDiff = 10;

    if (currentStage <= 5) {
      // 序盤: Lv1〜3 (2文字メイン)
      minDiff = 1; 
      maxDiff = 3;
    } else if (isBossLevel) {
      // ★ボス回: Lv4〜10 (3文字・4文字熟語など歯ごたえあり)
      // レベルが進むほどボスの下限も上がる
      minDiff = currentStage > 20 ? 5 : 4;
      maxDiff = 10;
    } else {
      // ★通常回: Lv1〜5 (高レベル帯でも、息抜きできる2文字熟語を混ぜる)
      // どんなに進んでも、簡単な問題(Lv2程度)は候補に残す
      minDiff = 1;
      maxDiff = currentStage > 30 ? 6 : 5;
    }
    
    // 候補をフィルタリング
    candidates = validData.filter(j => j.difficulty >= minDiff && j.difficulty <= maxDiff);

    // もし候補が少なすぎたら、難易度幅を広げて再検索 (詰み防止)
    if (candidates.length === 0) {
      candidates = validData.filter(j => j.difficulty >= 1 && j.difficulty <= 10);
    }
  }

  // --- 履歴フィルタリング ---
  const freshCandidates = candidates.filter(j => !excludeIds.includes(j.id));
  if (freshCandidates.length > 0) {
    candidates = freshCandidates;
  } else if (candidates.length === 0) {
    // フォールバック
    candidates = validData.filter(j => j.components.length === 2);
  }
  
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

// ... (getDistractorPartsなどは変更なし) ...
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