// src/features/adventure/types.ts

/**
 * 冒険モードのステージデータ定義
 * 文章体験を壊さないよう、テキストの呼吸と余韻を重視した構造
 */
export interface AdventureStage {
  /** ステージの一意なID (例: "a1-l0-s1") */
  id: string;
  
  /** 所属レベル (0-9) */
  level: number;
  
  /** レベル内の表示順序 (1~) */
  sequence: number;
  
  /** * 表示テキストの分割
   * [0]: 前の文
   * [1]: 空欄（ここが埋まる）
   * [2]: 後の文
   */
  textParts: string[];
  
  /** * 正解の漢字
   * undefined の場合は「空欄なし（読み専用）」ステージとして扱う
   */
  correct?: string;
  
  /** * 混同候補（ダミー選択肢）
   * 意味や形が似ているものを優先して選定
   */
  distractors: string[];
  
  /** * ボスステージフラグ
   * trueの場合、章の締めくくりとしての演出制御に使用
   */
  isBoss?: boolean;
}