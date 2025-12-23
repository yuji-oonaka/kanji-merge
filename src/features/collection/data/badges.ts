export interface Badge {
  id: string;
  char: string;
  isMessage: boolean; // ひらがな（メッセージ構成文字）かどうか
}

// 10ステージにつき1文字獲得（全400ステージ想定）
export const STAGES_PER_BADGE = 10;

// 全40文字の定義
// ひらがなだけを拾うと「あそんでくれてありがとう」になります
const RAW_CHARS = [
  // 1行目: "あ"
  "あ", "歩", "空", "静", "思", "考", "巡", "旅", "道", "知",
  // 2行目: "そ", "ん", "で"
  "そ", "理", "解", "ん", "結", "束", "で", "水", "流", "時",
  // 3行目: "く", "れ", "て"
  "く", "雲", "光", "れ", "歴", "史", "て", "手", "触", "感",
  // 4行目: "あ", "り", "が", "と", "う"
  "あ", "り", "在", "が", "画", "と", "都", "う", "有", "終"
];

export const BADGES: Badge[] = RAW_CHARS.map((char, index) => ({
  id: `badge_${index}`,
  char,
  // ひらがな判定
  isMessage: /^[ぁ-ん]+$/.test(char),
}));