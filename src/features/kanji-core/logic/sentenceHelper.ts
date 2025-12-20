import { JukugoDefinition } from "../types";

export type SentencePart = 
  | { type: 'TEXT'; text: string }
  | { type: 'SLOT'; text: null };

/**
 * 熟語データから表示用の文章パーツを生成する
 */
export function getSentenceParts(jukugo: JukugoDefinition): SentencePart[] {
  // 1. sentenceデータがある場合
  let rawSentence = jukugo.sentence;

  // 2. sentenceデータがない場合
  // 無理に「〜を表す」などの文章を作らず、ターゲットのみとする
  // (GoalSlot側で、sentenceがない場合は意味を別途表示するレイアウトに切り替えるため)
  if (!rawSentence) {
    rawSentence = `{{target}}`;
  }

  // 3. {{target}} で分割して、前後のテキストとターゲット位置を特定
  // ()で囲むことで、セパレータ自体({{target}})も配列の結果に残ります
  const parts = rawSentence.split(/({{target}})/g);

  return parts.map((part) => {
    if (part === "{{target}}") {
      return { type: "SLOT" as const, text: null };
    }
    return { type: "TEXT" as const, text: part };
  });
}