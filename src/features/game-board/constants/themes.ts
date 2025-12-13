export type ThemeId = 'paper' | 'blackboard' | 'cyber';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  colors: {
    background: string;     // 全体の背景色
    text: string;           // メイン文字色
    accent: string;         // 強調色（ボタンや正解など）
    sub: string;            // 補足文字色
    partBg: string;         // パーツの背景
    partBorder: string;     // パーツの枠線
    slotBg: string;         // ゴールスロットの背景
    slotBorder: string;     // ゴールスロットの枠
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  paper: {
    id: 'paper',
    name: '和紙',
    colors: {
      background: 'bg-[#f5f2eb]',
      text: 'text-[#3d3330]',
      accent: 'text-[#d94a38]', // 朱色
      sub: 'text-stone-500',
      partBg: 'bg-white',
      partBorder: 'border-stone-200',
      slotBg: 'bg-stone-50/50',
      slotBorder: 'border-stone-300',
    },
  },
  blackboard: {
    id: 'blackboard',
    name: '黒板',
    colors: {
      background: 'bg-[#2b4033]', // 深緑
      text: 'text-white',
      accent: 'text-[#facc15]',   // チョークの黄色
      sub: 'text-stone-300',
      partBg: 'bg-[#1a2e22]',
      partBorder: 'border-stone-400',
      slotBg: 'bg-white/10',
      slotBorder: 'border-white/30',
    },
  },
  cyber: {
    id: 'cyber',
    name: '電脳',
    colors: {
      background: 'bg-[#0f172a]', // 濃い紺
      text: 'text-[#22d3ee]',     // ネオンシアン
      accent: 'text-[#f472b6]',   // ネオンピンク
      sub: 'text-slate-400',
      partBg: 'bg-[#1e293b]',
      partBorder: 'border-[#22d3ee]/50',
      slotBg: 'bg-[#1e293b]/50',
      slotBorder: 'border-[#22d3ee]/30',
    },
  },
};