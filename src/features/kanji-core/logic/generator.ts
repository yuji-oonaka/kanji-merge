import jukugoDataRaw from '../data/jukugo-db-auto.json';
import { JukugoDefinition, DifficultyMode } from '../types';

const jukugoData = jukugoDataRaw as JukugoDefinition[];

const BLACKLIST_KANJI = ["穏", "隠", "勉"];

const CONFUSING_PAIRS: Record<string, string[]> = {
  "右": ["石", "左"],
  "左": ["右", "工"],
  "石": ["右", "百"],
  "白": ["日", "自"],
  "自": ["白", "目"],
  "目": ["日", "自", "月"],
  "日": ["目", "白", "田"],
  "田": ["由", "甲", "申", "日"],
  "由": ["田", "甲", "申"],
  "甲": ["田", "由", "申"],
  "申": ["田", "由", "甲"],
  "牛": ["午", "手"],
  "午": ["牛", "干"],
  "干": ["午", "千"],
  "千": ["干", "十"],
  "未": ["末"],
  "末": ["未"],
  "土": ["士", "工"],
  "士": ["土", "工"],
  "工": ["土", "士", "左"],
  "木": ["本", "禾"],
  "本": ["木"],
  "禾": ["木"],
  "力": ["刀", "九"],
  "刀": ["力", "刃"],
  "人": ["入", "八"],
  "入": ["人", "八"],
  "八": ["人", "入"],
  "大": ["犬", "太"],
  "犬": ["大", "太"],
  "太": ["大", "犬"],
  "王": ["玉", "主"],
  "玉": ["王", "宝"],
  "主": ["王"],
  "鳥": ["烏", "島"],
  "烏": ["鳥", "島"],
  "島": ["鳥", "烏"],
  "微": ["徴"],
  "徴": ["微"],
};

const DEFAULT_DISTRACTORS = [
  "一", "二", "三", "十", "日", "月", "木", "人", "口", "目", "田", "力"
];

export function generateRandomStage(
  levelIndex: number, 
  excludeIds: string[] = [], 
  mode: DifficultyMode = 'NORMAL'
): JukugoDefinition {
  
  // ▼▼▼ チュートリアル固定ステージ (あなたのコードを維持) ▼▼▼

  // ステージ1: ゴールは「二」
  if (mode === 'NORMAL' && levelIndex === 0) {
    return {
      id: "tutorial-01",
      kanji: "二",
      reading: "に",
      difficulty: 1,
      components: ["二"],
      meaning: "数字の2",
      sentence: "一に一を足すと{{target}}になる。"
    };
  }

  // ステージ2: ゴールは「三」 (素材: 二、一)
  if (mode === 'NORMAL' && levelIndex === 1) {
    return {
      id: "tutorial-02",
      kanji: "三",
      reading: "さん",
      difficulty: 1,
      components: ["三"],
      meaning: "数字の3",
      sentence: "二本の線にもう一本加えて{{target}}にする。"
    };
  }

  // ステージ3: ゴールは「三」 (素材: 一、一、一)
  if (mode === 'NORMAL' && levelIndex === 2) {
    return {
      id: "tutorial-03",
      kanji: "三",
      reading: "さん",
      difficulty: 2,
      components: ["三"],
      meaning: "数字の3",
      sentence: "まず二を作り、それに一を足して{{target}}にする。"
    };
  }

  // ▲▲▲ チュートリアル修正ここまで ▲▲▲

  // ▼▼▼ 以下、ランダム生成ロジック (難易度調整版) ▼▼▼
  
  const currentStage = levelIndex + 1;
  let candidates: JukugoDefinition[] = [];

  // ブラックリスト除外済みのデータを用意
  const validData = jukugoData.filter(j => 
    !BLACKLIST_KANJI.includes(j.kanji) &&
    !j.components.some(c => BLACKLIST_KANJI.some(bk => c.includes(bk)))
  );

  if (mode === 'EASY') {
    // 【初級】常に簡単 (文字数少なめ、難易度低)
    candidates = validData.filter(j => 
      j.components.length <= 2 && j.difficulty <= 3
    );
  } else {
    // 【標準】
    // ステージ10以降は、難易度制限なしでランダム出題
    if (currentStage >= 10) {
       candidates = validData;
    } 
    else {
      // ステージ4〜9: 段階的に難しくする
      // (Lv0~2は上の固定チュートリアルで処理済み)
      const isBossLevel = currentStage % 5 === 0;
      let minDiff = 1;
      let maxDiff = 10;

      if (currentStage <= 5) {
        minDiff = 1; 
        maxDiff = 3;
      } else if (isBossLevel) {
        minDiff = 4; // ボスは少し難しく
        maxDiff = 10;
      } else {
        minDiff = 1;
        maxDiff = 5;
      }
      
      candidates = validData.filter(j => j.difficulty >= minDiff && j.difficulty <= maxDiff);
    }
  }

  // 履歴除外 (直前に出た問題は出さない)
  const freshCandidates = candidates.filter(j => !excludeIds.includes(j.id));
  if (freshCandidates.length > 0) {
    candidates = freshCandidates;
  } else if (candidates.length === 0) {
    // 候補が尽きたら全データから再抽選
    candidates = validData;
  }
  
  // 安全策: それでも空ならフォールバック
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

/**
 * ★修正: 引数を (欲しい個数, 正解リスト) に変更
 * これで decomposer.ts からのエラーが消えます
 */
export function getDistractorParts(count: number, correctParts: string[]): string[] {
  const candidates = new Set<string>();
  
  // 1. 正解パーツに似ている紛らわしい文字を候補に追加
  correctParts.forEach(char => {
    if (CONFUSING_PAIRS[char]) {
      CONFUSING_PAIRS[char].forEach(d => candidates.add(d));
    }
  });
  
  // 2. 汎用のダミーパーツも候補に追加
  DEFAULT_DISTRACTORS.forEach(d => candidates.add(d));

  // 3. 正解パーツそのものは候補から除外
  // (SetからArrayにしてフィルタリング)
  const validCandidates = Array.from(candidates).filter(c => !correctParts.includes(c));
  
  const result: string[] = [];
  
  // 4. 指定された数になるまでランダムに抽出
  // 無限ループ防止のため attempts を制限
  let attempts = 0;
  while (result.length < count && attempts < 100) {
    if (validCandidates.length === 0) break;
    
    const idx = Math.floor(Math.random() * validCandidates.length);
    const selected = validCandidates[idx];
    
    result.push(selected);
    
    // 選んだものは候補から削除（重複防止）
    validCandidates.splice(idx, 1);
    attempts++;
  }
  
  return result;
}

// 古い関数（もう使わないので削除しても良いですが、念のため互換性として残すなら空配列を返す）
export function getRandomDistractors(count: number, exclude: string[]): string[] {
  return getDistractorParts(count, exclude);
}