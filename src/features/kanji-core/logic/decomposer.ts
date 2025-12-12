import { GamePart, JukugoDefinition, IdsMap } from '../types';
// ★修正: 自動生成された辞書を読み込む
import idsMapData from '../data/ids-map-auto.json';
import { getDistractorParts } from './generator';

// 型アサーションを追加して安全に読み込む
const IDS_MAP: IdsMap = idsMapData as unknown as IdsMap;

const generateId = () => Math.random().toString(36).substring(2, 9);

// これ以上分解しない「原子パーツ（部首）」のリスト
// ※Pythonスクリプト側でも制御していますが、フロントエンド側でも念のため保持します
const ATOMIC_PARTS = new Set([
  // 自然界・基本
  "雨", "木", "日", "月", "田", "力", "山", "石", "土", "火", "水", "金", 
  "王", "玉", "貝", "車", "馬", "魚", "鳥", "虫", "犬", "羊", "牛", 
  // 人・体
  "人", "イ", "女", "子", "口", "目", "耳", "手", "足", "心", "身", "言", "食", 
  // 道具・状態
  "刀", "弓", "矢", "糸", "巾", "衣", "門", "尸", "广", "厂", "辶", "亠", "宀", "艹", "竹"
]);

function decomposeKanji(char: string): string[] {
  // 1. 原子パーツなら、定義があっても分解せずに返す
  if (ATOMIC_PARTS.has(char)) {
    return [char];
  }

  // 2. 分解定義があれば分解する
  const parts = IDS_MAP[char];
  // 配列が存在し、かつ空でないか確認
  if (parts && Array.isArray(parts) && parts.length > 0) {
    return parts.flatMap(p => decomposeKanji(p));
  }
  
  // 3. 定義がなければそのまま返す
  return [char];
}

export function generateStageParts(jukugo: JukugoDefinition, currentStageIndex: number = 0): GamePart[] {
  const kanjis = jukugo.components;
  const rawParts = kanjis.flatMap(k => decomposeKanji(k));
  
  let distractorCount = 0;
  if (currentStageIndex >= 3) distractorCount = 1;
  if (currentStageIndex >= 8) distractorCount = 2;
  if (currentStageIndex >= 15) distractorCount = 3;

  const distractors = getDistractorParts(distractorCount, rawParts);
  const allPartsChars = [...rawParts, ...distractors];

  return allPartsChars.map((char) => {
    // 画面全体に散らす
    const relativeX = 0.1 + Math.random() * 0.8;
    const relativeY = 0.25 + Math.random() * 0.55;

    return {
      id: generateId(),
      char: char,
      type: 'RADICAL',
      x: relativeX,
      y: relativeY,
    } as any;
  });
}