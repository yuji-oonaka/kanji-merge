// src/features/adventure/data/stages_area1.ts

import { AdventureStage } from "../types";

export const AREA1_STAGES: AdventureStage[] = [
  // ==========================================
  // Level 0: 目覚めと音
  // テーマ: 聴覚への意識
  // ==========================================
  {
    id: "a1-l0-s1",
    level: 0,
    sequence: 1,
    textParts: ["目を開けると、", "", "の流れる音が鼓膜を揺らした。"],
    correct: "水",
    distractors: ["氷", "木", "川"]
  },
  {
    id: "a1-l0-s2",
    level: 0,
    sequence: 2,
    textParts: ["冷たく澄んだ、絶え間ない", "", "だ。"],
    correct: "音",
    distractors: ["声", "暗", "言"]
  },
  {
    id: "a1-l0-s3",
    level: 0,
    sequence: 3,
    textParts: ["足元には湿った", "", "の感触があり、"],
    correct: "土",
    distractors: ["士", "工", "止"]
  },
  {
    id: "a1-l0-s4",
    level: 0,
    sequence: 4,
    textParts: ["見上げれば木々の梢が", "", "を切り取っている。"],
    correct: "空",
    distractors: ["天", "究", "穴"]
  },

  // ==========================================
  // Level 1: 里の輪郭
  // テーマ: 人の不在と痕跡
  // ==========================================
  {
    id: "a1-l1-s1",
    level: 1,
    sequence: 1,
    textParts: ["どこにでもありそうな、けれど初めて訪れる場所だった。", "", ""],
    correct: undefined, // 読むだけのステージ（間）
    distractors: []
  },
  {
    id: "a1-l1-s2",
    level: 1,
    sequence: 2,
    textParts: ["地図には「", "", "」と記されているが、"],
    correct: "里",
    distractors: ["黒", "野", "重"]
  },
  {
    id: "a1-l1-s3",
    level: 1,
    sequence: 3,
    textParts: ["今のところ", "", "の気配はない。"],
    correct: "人",
    distractors: ["入", "大", "欠"]
  },
  {
    id: "a1-l1-s4",
    level: 1,
    sequence: 4,
    textParts: ["ただ、誰かが長い時間をかけて踏み固めたであろう小道が、", "", "沿いに続いているだけだ。"],
    correct: "川",
    distractors: ["州", "順", "三"]
  },

  // ==========================================
  // Level 2: 歩みと霧
  // テーマ: 流れる風景
  // ==========================================
  {
    id: "a1-l2-s1",
    level: 2,
    sequence: 1,
    textParts: ["私は荷物を背負い直し、その道を", "", "き始めた。"],
    correct: "歩",
    distractors: ["走", "止", "少"]
  },
  {
    id: "a1-l2-s2",
    level: 2,
    sequence: 2,
    textParts: ["朝霧がまだ晴れきっておらず、視界の端が", "", "くぼやけている。"],
    correct: "白",
    distractors: ["日", "百", "自"]
  },
  {
    id: "a1-l2-s3",
    level: 2,
    sequence: 3,
    textParts: ["歩を進めるたびに、風景がゆっくりと後方へ流れていく。", "", ""],
    correct: undefined,
    distractors: []
  },

  // ==========================================
  // Level 3: 風の言葉
  // テーマ: 自然音の擬人化
  // ==========================================
  {
    id: "a1-l3-s1",
    level: 3,
    sequence: 1,
    textParts: ["", "", "が吹くと、頭上の葉が擦れ合い、"],
    correct: "風",
    distractors: ["嵐", "凧", "凪"]
  },
  {
    id: "a1-l3-s2",
    level: 3,
    sequence: 2,
    textParts: ["さざ波のような音を立てた。その音が、時折人の話し", "", "のように聞こえるのは気のせいだろうか。"],
    correct: "声",
    distractors: ["音", "売", "色"]
  },
  {
    id: "a1-l3-s3",
    level: 3,
    sequence: 3,
    textParts: ["", "", "を澄ませてみるが、意味のある言葉としては結ばれない。"],
    correct: "耳",
    distractors: ["目", "身", "取"]
  },

  // ==========================================
  // Level 4: 原初の響き
  // テーマ: 言語以前の感覚
  // ==========================================
  {
    id: "a1-l4-s1",
    level: 4,
    sequence: 1,
    textParts: ["けれど、今ここで耳を塞げば、取り返しのつかない何かを", "", "う気がした。"],
    correct: "失",
    distractors: ["先", "矢", "夫"]
  },
  {
    id: "a1-l4-s2",
    level: 4,
    sequence: 2,
    textParts: ["それは、まだ", "", "葉になる前の、原初の響きに似ていた。"],
    correct: "言",
    distractors: ["音", "吉", "計"]
  },

  // ==========================================
  // Level 5: 刻まれた意志
  // テーマ: 人工物と自然物の境界
  // ==========================================
  {
    id: "a1-l5-s1",
    level: 5,
    sequence: 1,
    textParts: ["道端に、苔むした", "", "が転がっていた。"],
    correct: "石",
    distractors: ["右", "岩", "占"]
  },
  {
    id: "a1-l5-s2",
    level: 5,
    sequence: 2,
    textParts: ["何気なく目を落としたとき、そこに不自然な", "", "が刻まれていることに気づく。"],
    correct: "線",
    distractors: ["緑", "組", "絵"]
  },
  {
    id: "a1-l5-s3",
    level: 5,
    sequence: 3,
    textParts: ["自然の風化にしてはあまりに鋭く、そして意志を感じさせる直", "", "と曲線。"],
    correct: "線",
    distractors: ["緑", "泉", "綿"]
  },
  {
    id: "a1-l5-s4",
    level: 5,
    sequence: 4,
    textParts: ["誰かが何かを伝えようとして、ここに刃を立てたのだろうか。", "", ""],
    correct: undefined,
    distractors: []
  },

  // ==========================================
  // Level 6: 接触と記憶
  // テーマ: 触覚を通じた同調
  // ==========================================
  {
    id: "a1-l6-s1",
    level: 6,
    sequence: 1,
    textParts: ["それとも、この土地そのものが記憶を", "", "に残そうとしているのだろうか。"],
    correct: "形",
    distractors: ["彫", "彩", "影"]
  },
  {
    id: "a1-l6-s2",
    level: 6,
    sequence: 2,
    textParts: ["指でその痕跡をなぞってみると、指先に微かな温かみが伝わってくる。", "", ""],
    correct: undefined,
    distractors: []
  },
  {
    id: "a1-l6-s3",
    level: 6,
    sequence: 3,
    textParts: ["不思議と、指を離したくないと思った。この感触を", "", "放してしまえば、"],
    correct: "手",
    distractors: ["毛", "牛", "午"]
  },
  {
    id: "a1-l6-s4",
    level: 6,
    sequence: 4,
    textParts: ["大事な約束を忘れてしまうような、奇妙な焦燥に駆られたのだ。", "", ""],
    correct: undefined,
    distractors: []
  },

  // ==========================================
  // Level 7: 認識の変容
  // テーマ: 背景から実体へ
  // ==========================================
  {
    id: "a1-l7-s1",
    level: 7,
    sequence: 1,
    textParts: ["ふと、世界の", "", "え方が変わる感覚に襲われる。"],
    correct: "見",
    distractors: ["貝", "児", "具"]
  },
  {
    id: "a1-l7-s2",
    level: 7,
    sequence: 2,
    textParts: ["これまで私は、風景をただの「背景」として見ていたのかもしれない。", "", ""],
    correct: undefined,
    distractors: []
  },
  {
    id: "a1-l7-s3",
    level: 7,
    sequence: 3,
    textParts: ["木は木であり、川は川であると、", "", "前というラベルを貼り付けるだけで満足し、"],
    correct: "名",
    distractors: ["各", "夕", "多"]
  },
  {
    id: "a1-l7-s4",
    level: 7,
    sequence: 4,
    textParts: ["その実体を直視していなかったのではないか。", "", ""],
    correct: undefined,
    distractors: []
  },

  // ==========================================
  // Level 8: 秩序と断片
  // テーマ: 結合のエネルギー
  // ==========================================
  {
    id: "a1-l8-s1",
    level: 8,
    sequence: 1,
    textParts: ["この里の空気は、そうした私の怠惰な認識を静かに揺さぶってくる。", "", ""],
    correct: undefined,
    distractors: []
  },
  {
    id: "a1-l8-s2",
    level: 8,
    sequence: 2,
    textParts: ["石の配置、枝の重なり、流れる", "", "の形。"],
    correct: "雲",
    distractors: ["雪", "雷", "電"]
  },
  {
    id: "a1-l8-s3",
    level: 8,
    sequence: 3,
    textParts: ["それら一つひとつが、単なる偶然の産物ではなく、何か大きな秩序の一部を担っているように思えてくる。", "", ""],
    correct: undefined,
    distractors: []
  },
  {
    id: "a1-l8-s4",
    level: 8,
    sequence: 4,
    textParts: ["川面を覗き込むと、水底の小石が揺らめいて見えた。二つの石が寄り添い、一つの意味ある形を作ろうとしているように見える瞬間がある。", "", ""],
    correct: undefined,
    distractors: []
  },
  {
    id: "a1-l8-s5",
    level: 8,
    sequence: 5,
    textParts: ["まばたきをすると、それはまたただの石に戻ってしまう。けれど、一度感じた違和感は消えない。", "", ""],
    correct: undefined,
    distractors: []
  },
  {
    id: "a1-l8-s6",
    level: 8,
    sequence: 6,
    textParts: ["世界は私の知っている", "", "純な姿ではなく、もっと複雑で、無数の断片が結合しようとするエネルギーに満ちているのかもしれない。"],
    correct: "単",
    distractors: ["早", "車", "巣"]
  },

  // ==========================================
  // Level 9: BOSS - 旅立ちと問い
  // テーマ: 音から意へ（意味の発生）
  // ==========================================
  {
    id: "a1-l9-s1",
    level: 9,
    sequence: 1,
    textParts: ["里の", "", "口に差し掛かると、霧が少し晴れ、その先に広がる深い森の輪郭が浮かび上がった。"],
    correct: "出",
    distractors: ["山", "生", "凹"]
  },
  {
    id: "a1-l9-s2",
    level: 9,
    sequence: 2,
    textParts: ["ここから先は、より深く、より複雑な世界が待っている予感がする。", "", ""],
    correct: undefined,
    distractors: []
  },
  {
    id: "a1-l9-s3",
    level: 9,
    sequence: 3,
    textParts: ["私は振り返り、今まで歩いてきた穏やかな里の風景をもう一度眺めた。何も変わらない、静かな", "", "の景色だ。"],
    correct: "朝",
    distractors: ["乾", "萌", "明"]
  },
  {
    id: "a1-l9-s4",
    level: 9,
    sequence: 4,
    textParts: ["しかし、私の目にはもう、先ほどと同じようには", "", "らない。"],
    correct: "映",
    distractors: ["決", "央", "英"]
  },
  {
    id: "a1-l9-s5",
    level: 9,
    sequence: 5,
    isBoss: true,
    textParts: ["風景の中に隠された", "", "味を読み解く準備は、本当にできているのだろうか？"],
    correct: "意",
    distractors: ["音", "憶", "識"]
  }
];