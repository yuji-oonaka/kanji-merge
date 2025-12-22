import { GamePart, JukugoDefinition, IdsMap, DifficultyMode } from '../types';
import idsMapData from '../data/ids-map-auto.json';
// generator.ts からダミー生成関数をインポート
import { getDistractorParts } from './generator';

const IDS_MAP: IdsMap = idsMapData as unknown as IdsMap;

const generateId = () => Math.random().toString(36).substring(2, 9);

// 原子パーツ（これ以上分解しない文字）
const ATOMIC_PARTS = new Set([
  "雨", "木", "日", "月", "田", "力", "山", "石", "土", "火", "水", "金", 
  "王", "玉", "貝", "車", "馬", "魚", "鳥", "虫", "犬", "羊", "牛", 
  "人", "イ", "女", "子", "口", "目", "耳", "手", "足", "心", "身", "言", "食", 
  "刀", "弓", "矢", "糸", "巾", "衣", "門", "尸", "广", "厂", "辶", "亠", "宀", "艹", "竹",
  "一", "二", "三", "十", "至", "立", "大", "小", "士" // ← DictionaryConfigに合わせて少し追加
]);

// 通常の再帰的な分解ロジック
function decomposeKanji(char: string): string[] {
  if (ATOMIC_PARTS.has(char)) return [char];
  
  const parts = IDS_MAP[char];
  if (parts && Array.isArray(parts) && parts.length > 0) {
    // 再帰的に分解
    return parts.flatMap(p => decomposeKanji(p));
  }
  
  // 辞書になければそのまま返す
  return [char];
}

/**
 * 外部から呼び出す用: 構成要素を取得（1段階のみ）
 */
export function getConstituents(char: string): string[] | null {
  const parts = IDS_MAP[char];
  if (!parts || parts.length < 2) return null;
  return parts;
}

/**
 * ステージ生成のメイン関数
 */
export function generateStageParts(
  jukugo: JukugoDefinition, 
  currentStageIndex: number = 0,
  mode: DifficultyMode = 'NORMAL'
): GamePart[] {
  const kanjis = jukugo.components; 
  let rawParts: string[] = [];

  // ▼▼▼ チュートリアル特別対応（手動指定） ▼▼▼

  // ステージ1 (Index 0): 「二」を作る -> ["一", "一"]
  if (mode === 'NORMAL' && currentStageIndex === 0) {
    rawParts = ["一", "一"];
  }
  // ステージ2 (Index 1): 「三」を作る -> ["二", "一"]
  else if (mode === 'NORMAL' && currentStageIndex === 1) {
    rawParts = ["二", "一"];
  }
  // ステージ3 (Index 2): 「三」を作る -> ["一", "一", "一"]
  else if (mode === 'NORMAL' && currentStageIndex === 2) {
    rawParts = ["一", "一", "一"];
  }
  
  // ▲▲▲ チュートリアルここまで ▲▲▲

  // 通常ステージ（ステージ4以降）
  else if (mode === 'NORMAL') {
    // ATOMIC_PARTS に従い分解
    rawParts = kanjis.flatMap(k => decomposeKanji(k));
  }
  // EASYモード
  else {
    rawParts = kanjis.flatMap((k, index) => {
      // 最後の1文字は分解しない（ヒント的に残す）などの処理
      if (index === kanjis.length - 1 && !ATOMIC_PARTS.has(k)) {
        return [k];
      }
      return decomposeKanji(k);
    });
  }

  // --- ダミーパーツ (Distractor) 配置ロジック ---
  let distractorCount = 0;
  
  // ステージ数 (1始まり)
  const currentStage = currentStageIndex + 1;

  if (mode === 'EASY') {
    distractorCount = 0;
  } else {
    // チュートリアル期間はダミーなし
    if (currentStage <= 5) {
      distractorCount = 0;
    } 
    // ステージ6〜: 徐々に増やす
    else {
      if (currentStage >= 30) {
        distractorCount = 6;
      } else if (currentStage >= 20) {
        distractorCount = 4;
      } else if (currentStage >= 10) {
        distractorCount = 2;
      } else {
        // ステージ6〜9 は 1個だけ混ぜてみる（慣らし）
        distractorCount = 1; 
      }
      
      // 安全策: 盤面あふれ防止 (最大16マス - 正解パーツ数)
      const maxSlots = 16;
      const emptySlots = Math.max(0, maxSlots - rawParts.length);
      distractorCount = Math.min(distractorCount, emptySlots);
    }
  }

  // ★修正: getDistractorParts の正しい呼び出し方
  // (個数, 正解パーツリスト) を渡して、まとめて取得します
  let distractors: string[] = [];
  if (distractorCount > 0) {
    distractors = getDistractorParts(distractorCount, rawParts);
  }

  // --- 統合とシャッフル ---
  const allChars = [...rawParts, ...distractors];
  
  // Fisher-Yates Shuffle
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  // GamePart型に変換して返す
  return allChars.map((char, index) => ({
    id: generateId(),
    char,
    type: 'RADICAL', 
    gridIndex: index,
    // 互換性プロパティが必要なら以下も
    x: 0,
    y: 0
  }));
}