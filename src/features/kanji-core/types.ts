/**
 * 漢字マージ: Core Type Definitions
 */

// パーツの種類
export type PartType = 'RADICAL' | 'KANJI';

// 画面上を浮遊する個々のパーツ
export interface GamePart {
  id: string;
  char: string;
  type: PartType;
  // グリッド表示用
  gridIndex?: number;
  x?: number; // 互換性のため残存
  y?: number; // 互換性のため残存
}

// マージ判定の結果
export type MergeResult = 
  | { success: true; newChar: string; soundType: 'KANJI' | 'JUKUGO' }
  | { success: false; reason?: 'INVALID_COMBINATION' | 'ALREADY_EXISTS' };

// 熟語定義 (Goal)
export interface JukugoDefinition {
  id: string;
  kanji: string;
  reading: string;
  difficulty: number;
  components: string[];
  meaning?: string;
  // ▼ 追加: 穴埋め用の文章
  // 例: "明暗"の場合 -> "勝敗の{target}が分かれる"
  sentence?: string; 
}

// 分解辞書型
export interface IdsMap {
  [key: string]: string[];
}

export type DifficultyMode = 'EASY' | 'NORMAL';