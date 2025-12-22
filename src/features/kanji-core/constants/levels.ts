// ステージの構成設定
export const LEVEL_SETTINGS = {
  TOTAL_STAGES: 100, // 仮の上限（無限にするなら不要ですが、マップ表示用などで使用）
  TUTORIAL_COUNT: 3, // チュートリアルの数（generator.tsのロジックと合わせる）
};

export interface StageConfig {
  levelIndex: number;
  displayId: string;
}

// UI表示用（マップ画面などで使う場合）に、IDを固定せずインデックスだけ定義します
// ここで jukugoId を指定するのは廃止します
export const STAGE_LIST: StageConfig[] = Array.from({ length: 10 }, (_, i) => ({
  levelIndex: i,
  displayId: `STAGE ${i + 1}`,
}));

// 旧コードとの互換性のために残す場合（もし他のファイルで LEVEL_LIST を使っているなら）
// ただし jukugoId はもう使わないので削除または無視されるようにします
export const LEVEL_LIST = STAGE_LIST.map(s => ({
  id: `stage-${s.levelIndex + 1}`,
  // jukugoId は generator が決めるので、ここは空にするか削除してください
  // jukugoId: 'REMOVED', 
}));