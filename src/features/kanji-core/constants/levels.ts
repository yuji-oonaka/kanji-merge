export interface LevelConfig {
  id: string;
  jukugoId: string; // jukugo-db.json の ID と紐づく
}

// ステージの順番リスト (全10ステージ)
export const LEVEL_LIST: LevelConfig[] = [
  { id: 'stage-1', jukugoId: 'tutorial-01' }, // 明 (2パーツ)
  { id: 'stage-2', jukugoId: 'level-03' },    // 花火 (3パーツ)
  { id: 'stage-3', jukugoId: 'level-04' },    // 休日 (4パーツ: イ+木+日)
  { id: 'stage-4', jukugoId: 'level-02' },    // 岩石 (3パーツ)
  { id: 'stage-5', jukugoId: 'level-01' },    // 森林 (5パーツ: 木x3...ではなく森定義による)
  { id: 'stage-6', jukugoId: 'level-05' },    // 青空 (青=主+月, 空=ウ+工 -> 4パーツ)
  { id: 'stage-7', jukugoId: 'level-06' },    // 天気 (天=一+大, 気=そのまま -> 3パーツ)
  { id: 'stage-8', jukugoId: 'level-10' },    // 多々 (タx4 -> 4パーツ)
  { id: 'stage-9', jukugoId: 'level-09' },    // 名前 (名=夕+口, 前=そのまま -> 3パーツ)
  { id: 'stage-10', jukugoId: 'level-08' },   // 暗室 (暗=日+音(立+日), 室=そのまま -> 4-5パーツ)
];