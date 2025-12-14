import { JukugoDefinition, DifficultyMode } from '../types';
import jukugoData from '../data/jukugo-db-auto.json';

/**
 * 難易度調整＆ステージ生成
 * @param levelIndex 現在のレベル
 * @param excludeIds 出題履歴にあるIDリスト (これらは候補から除外)
 */
export function generateRandomStage(
  levelIndex: number, 
  excludeIds: string[] = [], 
  mode: DifficultyMode = 'NORMAL'
): JukugoDefinition {
  
  const data = jukugoData as JukugoDefinition[];
  let candidates: JukugoDefinition[] = [];

  if (mode === 'EASY') {
    // 【初級モード】
    // 1. 構成パーツが2つ以下（2文字熟語 or 1文字漢字）に限定
    // 2. 難易度(difficulty)が低いものに限定 (例: 3以下)
    candidates = data.filter(j => 
      j.components.length <= 2 && j.difficulty <= 3
    );
  } else {
    // 【標準モード】(既存のロジック + レベル補正)
    let minDiff = 1;
    let maxDiff = 1;

    // レベルカーブ設定
    if (levelIndex < 5) { minDiff = 1; maxDiff = 2; } 
    else if (levelIndex < 15) { minDiff = 2; maxDiff = 4; } 
    else if (levelIndex < 25) { minDiff = 4; maxDiff = 7; } 
    else if (levelIndex < 40) { minDiff = 6; maxDiff = 9; } 
    else { minDiff = 8; maxDiff = 10; }
    
    candidates = data.filter(j => j.difficulty >= minDiff && j.difficulty <= maxDiff);
  }

  // --- 共通: 履歴フィルタリング ---
  const freshCandidates = candidates.filter(j => !excludeIds.includes(j.id));
  if (freshCandidates.length > 0) {
    candidates = freshCandidates;
  } else if (candidates.length === 0) {
    // 候補がない場合のフォールバック（全データから簡単なものを探す）
    candidates = data.filter(j => j.components.length === 2);
  }
  
  // 安全策
  if (candidates.length === 0) {
    return {
      id: "fallback",
      kanji: "平和",
      reading: "へいわ",
      difficulty: 1,
      components: ["平", "和"],
      meaning: "穏やかな状態",
      // ▼ 追加: フォールバック用文章
      sentence: "世界の{{target}}を祈る"
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