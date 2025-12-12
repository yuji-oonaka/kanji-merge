export type AmbienceType = 'river' | 'wind' | 'space' | 'none';

export interface WorldArea {
  id: string;
  name: string;
  description: string;
  startLevel: number;
  endLevel: number;
  themeColor: string;
  ambience: AmbienceType;
}

export const WORLD_AREAS: WorldArea[] = [
  {
    id: "area-1",
    name: "始まりの里",
    description: "二文字の言葉を学ぶ、旅の始まり。",
    startLevel: 0,
    endLevel: 9, 
    themeColor: "from-green-100 to-green-50",
    ambience: 'river'
  },
  {
    id: "area-2",
    name: "言葉の森",
    description: "少し長い言葉が潜む深い森。",
    startLevel: 10,
    endLevel: 24, 
    themeColor: "from-emerald-100 to-teal-50",
    ambience: 'wind'
  },
  {
    id: "area-3",
    name: "四字の山脈",
    description: "険しい四字熟語が立ちはだかる。",
    startLevel: 25,
    endLevel: 49,
    themeColor: "from-stone-200 to-stone-100",
    ambience: 'wind'
  },
  {
    id: "area-4",
    name: "天空の回廊",
    description: "知識を極めし者が挑む場所。",
    startLevel: 50,
    endLevel: 99, 
    themeColor: "from-sky-200 to-indigo-50",
    ambience: 'space'
  },
  {
    id: "area-5",
    name: "無限の彼方",
    description: "終わりのない探求。",
    startLevel: 100,
    endLevel: 9999,
    themeColor: "from-purple-200 to-fuchsia-50",
    ambience: 'space'
  },
];