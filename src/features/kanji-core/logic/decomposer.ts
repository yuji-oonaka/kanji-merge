import { GamePart, JukugoDefinition, IdsMap, DifficultyMode } from '../types';
import idsMapData from '../data/ids-map-auto.json';
import { getDistractorParts } from './generator';

const IDS_MAP: IdsMap = idsMapData as unknown as IdsMap;

const generateId = () => Math.random().toString(36).substring(2, 9);

const ATOMIC_PARTS = new Set([
  "雨", "木", "日", "月", "田", "力", "山", "石", "土", "火", "水", "金", 
  "王", "玉", "貝", "車", "馬", "魚", "鳥", "虫", "犬", "羊", "牛", 
  "人", "イ", "女", "子", "口", "目", "耳", "手", "足", "心", "身", "言", "食", 
  "刀", "弓", "矢", "糸", "巾", "衣", "門", "尸", "广", "厂", "辶", "亠", "宀", "艹", "竹"
]);

function decomposeKanji(char: string): string[] {
  if (ATOMIC_PARTS.has(char)) return [char];
  const parts = IDS_MAP[char];
  if (parts && Array.isArray(parts) && parts.length > 0) {
    return parts.flatMap(p => decomposeKanji(p));
  }
  return [char];
}

export function getConstituents(char: string): [string, string] | null {
  if (ATOMIC_PARTS.has(char)) return null;
  const parts = IDS_MAP[char];
  if (parts && Array.isArray(parts) && parts.length === 2) {
    return [parts[0], parts[1]];
  }
  return null;
}

/**
 * ステージ生成
 */
export function generateStageParts(
  jukugo: JukugoDefinition, 
  currentStageIndex: number = 0,
  mode: DifficultyMode = 'NORMAL'
): GamePart[] {
  const kanjis = jukugo.components;
  let rawParts: string[] = [];

  if (mode === 'NORMAL') {
    rawParts = kanjis.flatMap(k => decomposeKanji(k));
  } else {
    // EASY
    rawParts = kanjis.flatMap((k, index) => {
      if (index === kanjis.length - 1 && !ATOMIC_PARTS.has(k)) {
        return [k];
      }
      return decomposeKanji(k);
    });
  }
  
  // --- ダミーパーツ数の計算 ---
  let distractorCount = 0;
  const gridSize = 16; // 4x4

  if (mode === 'EASY') {
    distractorCount = 0;
  } else {
    // 【標準モード】
    // 難易度Lv5以上の「ボス問題」または ステージ20以降の偶数回などは
    // グリッドをダミーで埋め尽くす
    // (Lv5以上 = 4文字熟語などが多いため、盤面が埋まるとかなり難しくなる)
    const isHighDifficulty = jukugo.difficulty >= 5;
    const isLateGame = currentStageIndex >= 19; // 20ステージ目以降(indexは0始まり)

    if (isHighDifficulty || (isLateGame && currentStageIndex % 2 === 0)) {
      // 16マス - 正解パーツ数 = 必要なダミー数
      // ※ 正解パーツだけで16を超えることはほぼない想定だが、Math.maxで0以上を保証
      distractorCount = Math.max(0, gridSize - rawParts.length);
    } else {
      // 通常時は少しだけ混ぜる (既存ロジックを少し緩和)
      if (currentStageIndex >= 3) distractorCount = 1;
      if (currentStageIndex >= 10) distractorCount = 3;
      if (currentStageIndex >= 20) distractorCount = 5;
    }
  }

  const distractors = getDistractorParts(distractorCount, rawParts);
  const allPartsChars = [...rawParts, ...distractors];

  const indices = Array.from({ length: gridSize }, (_, i) => i);
  // シャッフル
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return allPartsChars.map((char, i) => {
    // 16個を超えた分はグリッド外(-1)になるが、実質表示されないかエラーになるため
    // jukugo-db 側で構成パーツが多すぎる熟語（16個超）は作らない前提
    const gridIndex = indices[i] !== undefined ? indices[i] : -1;
    
    // 画面全体に散らす用の座標 (互換性)
    const relativeX = 0.1 + Math.random() * 0.8;
    const relativeY = 0.25 + Math.random() * 0.55;

    const isAtom = ATOMIC_PARTS.has(char);

    return {
      id: generateId(),
      char: char,
      type: isAtom ? 'RADICAL' : 'KANJI',
      x: relativeX,
      y: relativeY,
      gridIndex: gridIndex,
    } as any;
  });
}