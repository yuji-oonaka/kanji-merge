import { GamePart, JukugoDefinition, IdsMap, DifficultyMode } from '../types'; // ★修正: typesから読み込む
import idsMapData from '../data/ids-map-auto.json';
import { getDistractorParts } from './generator';

// 安全に型アサーション
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

// 構成要素の取得（1段階だけ分解）
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
 * mode: 'NORMAL' なら完全分解
 * mode: 'EASY' なら一部の漢字を分解せずにそのまま出す + ダミーなし
 */
export function generateStageParts(
  jukugo: JukugoDefinition, 
  currentStageIndex: number = 0,
  mode: DifficultyMode = 'NORMAL' // 引数に追加
): GamePart[] {
  const kanjis = jukugo.components;
  let rawParts: string[] = [];

  if (mode === 'NORMAL') {
    // ノーマル: 全てを容赦なく分解
    rawParts = kanjis.flatMap(k => decomposeKanji(k));
  } else {
    // イージー: 最後の1文字だけは分解せずに残す（難易度緩和）
    rawParts = kanjis.flatMap((k, index) => {
      // 最後の1文字、かつ原子パーツでなければ、そのまま返す
      if (index === kanjis.length - 1 && !ATOMIC_PARTS.has(k)) {
        return [k];
      }
      return decomposeKanji(k);
    });
  }
  
  // ★修正: ダミーパーツの計算ロジック
  let distractorCount = 0;

  if (mode === 'EASY') {
    // 初級モード: ダミーなし (0個固定)
    distractorCount = 0;
  } else {
    // 標準モード: ステージ進行に合わせて増やす
    if (currentStageIndex >= 3) distractorCount = 1;
    if (currentStageIndex >= 8) distractorCount = 2;
    if (currentStageIndex >= 15) distractorCount = 3;
  }

  const distractors = getDistractorParts(distractorCount, rawParts);
  const allPartsChars = [...rawParts, ...distractors];

  // ★注意: ここは元のコードが「x, y (浮動小数点)」を使っていたか「gridIndex」を使っていたかによります。
  // ご提示いただいたコードは「gridIndex」を使っているので、そちらのロジックを採用して返します。
  // (もし StageView 側が x,y を期待している場合は修正が必要です)

  const gridSize = 16; // 固定または引数化
  const indices = Array.from({ length: gridSize }, (_, i) => i);
  // シャッフル
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return allPartsChars.map((char, i) => {
    // グリッド位置、もしくはランダム配置
    const gridIndex = indices[i] !== undefined ? indices[i] : -1;
    
    // 画面全体に散らす用の座標 (StageViewが x,y を使う場合への互換性)
    const relativeX = 0.1 + Math.random() * 0.8;
    const relativeY = 0.25 + Math.random() * 0.55;

    const isAtom = ATOMIC_PARTS.has(char);

    return {
      id: generateId(),
      char: char,
      type: isAtom ? 'RADICAL' : 'KANJI',
      x: relativeX, // 互換性のため追加
      y: relativeY, // 互換性のため追加
      gridIndex: gridIndex, // ご提示コードの仕様
    } as any;
  });
}