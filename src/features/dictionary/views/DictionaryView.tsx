// src/features/dictionary/views/DictionaryView.tsx
"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useGameStore } from "@/features/game-board/stores/store";
import idsMapData from "@/features/kanji-core/data/ids-map-auto.json";
import jukugoData from "@/features/kanji-core/data/jukugo-db-auto.json";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { JukugoListView } from "./JukugoListView";
import { KanjiListView } from "./KanjiListView";

export function DictionaryView() {
  const [activeTab, setActiveTab] = useState<"kanji" | "jukugo">("kanji");

  const unlockedIds = useGameStore((state) => state.unlockedIds);
  const unlockedJukugos = useGameStore((state) => state.unlockedJukugos);

  // --- 統計データの計算 ---

  // 1. ゲーム内で実際に登場する漢字のリストを計算
  const validKanjiList = useMemo(() => {
    const usedChars = new Set<string>();
    const data = jukugoData as JukugoDefinition[];

    data.forEach((jukugo) => {
      // 熟語の構成パーツをセットに追加
      jukugo.components.forEach((char) => usedChars.add(char));
    });

    // ids-mapにあるキーのうち、実際に使われているものだけをリスト化
    return (
      Object.keys(idsMapData)
        .filter((key) => usedChars.has(key))
        // ▼ 追加: 漢字(一-龠)、々、〆、ヵ、ヶ 以外を除外する強力なフィルター
        .filter((key) => key.match(/^[一-龠々〆ヵヶ]+$/))
    );
  }, []);

  // 2. 収集率の計算
  const totalKanji = validKanjiList.length;
  const collectedKanji = validKanjiList.filter((k) =>
    unlockedIds.includes(k)
  ).length;

  const totalJukugo = jukugoData.length;
  const collectedJukugo = unlockedJukugos.length;

  // 表示用データ
  const currentCollected =
    activeTab === "kanji" ? collectedKanji : collectedJukugo;
  const currentTotal = activeTab === "kanji" ? totalKanji : totalJukugo;

  // 小数点第1位まで表示 (例: 0.3%)
  const percentage =
    currentTotal > 0
      ? ((currentCollected / currentTotal) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#3d3330] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* --- ヘッダーエリア --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-2 border-[#3d3330]/10 pb-4 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 tracking-widest text-[#3d3330]">
              収集図鑑
            </h1>
            <p className="text-stone-500 font-serif">
              {activeTab === "kanji" ? "漢字" : "熟語"}収集率:{" "}
              <span className="text-2xl font-bold text-[#d94a38]">
                {percentage}%
              </span>{" "}
              <span className="text-sm">
                ({currentCollected}/{currentTotal})
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* タブ切り替え */}
            <div className="bg-[#e0dcd5] p-1 rounded-full flex text-sm font-bold shadow-inner">
              <button
                onClick={() => setActiveTab("kanji")}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeTab === "kanji"
                    ? "bg-[#3d3330] text-white shadow-md"
                    : "text-stone-600 hover:text-stone-800"
                }`}
              >
                漢字
              </button>
              <button
                onClick={() => setActiveTab("jukugo")}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeTab === "jukugo"
                    ? "bg-[#3d3330] text-white shadow-md"
                    : "text-stone-600 hover:text-stone-800"
                }`}
              >
                熟語
              </button>
            </div>

            <Link
              href="/"
              className="px-6 py-2 bg-stone-200 rounded-full hover:bg-stone-300 transition-colors font-bold text-stone-600 shadow-sm"
            >
              戻る
            </Link>
          </div>
        </div>

        {/* --- コンテンツエリア --- */}
        <div className="min-h-[50vh]">
          {activeTab === "kanji" ? <KanjiListView /> : <JukugoListView />}
        </div>
      </div>
    </div>
  );
}
