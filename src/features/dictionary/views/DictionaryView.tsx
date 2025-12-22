"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
// ★修正1: useGameStore ではなく、図鑑専用の useDictionaryStore を使う
import { useDictionaryStore } from "@/features/dictionary/stores/dictionarySlice";
// ★修正2: 熟語データだけでなく、合体レシピデータも使う
import idsMapData from "@/features/kanji-core/data/ids-map-auto.json";
import jukugoDataRaw from "@/features/kanji-core/data/jukugo-db-auto.json";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { JukugoListView } from "./JukugoListView";
import { KanjiListView } from "./KanjiListView";

const jukugoData = jukugoDataRaw as JukugoDefinition[];
// JSONを適切な型として扱う
const idsMap = idsMapData as Record<string, string[]>;

export function DictionaryView() {
  const [activeTab, setActiveTab] = useState<"kanji" | "jukugo">("kanji");

  // マウント確認用（ハイドレーションエラー防止）
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ★修正3: ストアからデータを取得し、未ロード時は空配列 [] を返す安全策を追加
  const unlockedIds = useDictionaryStore((state) => state.unlockedIds) || [];
  const unlockedJukugos =
    useDictionaryStore((state) => state.unlockedJukugos) || [];

  // ★修正4: 分母の計算ロジックを KanjiListView と統一
  // 「熟語に使われている漢字」ではなく「辞書(ids-map)に載っている全漢字」を対象にする
  const validKanjiList = useMemo(() => {
    const usedChars = new Set<string>();

    // 1. レシピの「成果物」を追加 (例: 意, 恵...)
    Object.keys(idsMap).forEach((key) => usedChars.add(key));

    // 2. レシピの「素材」も追加 (例: 日, 月, 田...)
    // これを含めないと、原子パーツが分母から漏れてしまう
    Object.values(idsMap).forEach((parts) => {
      parts.forEach((char) => usedChars.add(char));
    });

    // 3. フィルタリング (中間パーツや記号を除外)
    return Array.from(usedChars)
      .filter((char) => char.match(/^[一-龠々〆ヵヶ]+$/))
      .sort();
  }, []);

  const totalKanji = validKanjiList.length;

  // ★これで includes エラーは消えます
  const collectedKanji = validKanjiList.filter((k) =>
    unlockedIds.includes(k)
  ).length;

  const totalJukugo = jukugoData.length;
  const collectedJukugo = unlockedJukugos.length;

  const currentCollected =
    activeTab === "kanji" ? collectedKanji : collectedJukugo;
  const currentTotal = activeTab === "kanji" ? totalKanji : totalJukugo;

  const percentage =
    currentTotal > 0
      ? ((currentCollected / currentTotal) * 100).toFixed(1)
      : "0.0";

  // マウント前はレイアウト崩れを防ぐためローディングなどを出すか、
  // あるいは枠だけ表示する（ここでは元のUIを崩さないようそのまま描画します）
  if (!isMounted) {
    return (
      <div className="fixed inset-0 w-full h-dvh bg-[#f5f2eb] flex items-center justify-center text-[#3d3330]">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-dvh bg-[#f5f2eb] text-[#3d3330] flex flex-col overflow-hidden">
      {/* --- ヘッダーエリア (固定) --- */}
      <div className="w-full max-w-5xl mx-auto px-4 pt-4 pb-2 md:pt-8 md:pb-4 flex-none z-10 bg-[#f5f2eb]">
        <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-[#3d3330]/10 pb-4 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold mb-1 md:mb-2 tracking-widest text-[#3d3330]">
              収集図鑑
            </h1>
            <p className="text-xs md:text-sm text-stone-500 font-serif">
              {activeTab === "kanji" ? "漢字" : "熟語"}収集率:{" "}
              <span className="text-xl md:text-2xl font-bold text-[#d94a38]">
                {percentage}%
              </span>{" "}
              <span className="text-10px md:text-sm opacity-80">
                ({currentCollected}/{currentTotal})
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            {/* タブ切り替え */}
            <div className="bg-[#e0dcd5] p-1 rounded-full flex text-xs md:text-sm font-bold shadow-inner flex-1 md:flex-none justify-center">
              <button
                onClick={() => setActiveTab("kanji")}
                className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full transition-all w-full md:w-auto ${
                  activeTab === "kanji"
                    ? "bg-[#3d3330] text-white shadow-md"
                    : "text-stone-600 hover:text-stone-800"
                }`}
              >
                漢字
              </button>
              <button
                onClick={() => setActiveTab("jukugo")}
                className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full transition-all w-full md:w-auto ${
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
              className="px-4 md:px-6 py-1.5 md:py-2 bg-stone-200 rounded-full hover:bg-stone-300 transition-colors font-bold text-stone-600 text-xs md:text-sm shadow-sm whitespace-nowrap"
            >
              戻る
            </Link>
          </div>
        </div>
      </div>

      {/* --- コンテンツエリア (スクロール) --- */}
      {/* pb-20 で下部の余白を確保し、スクロール最下部でもコンテンツが見切れないようにする */}
      <div className="flex-1 w-full max-w-5xl mx-auto overflow-y-auto px-4 pb-20">
        <div className="py-4 min-h-full">
          {activeTab === "kanji" ? <KanjiListView /> : <JukugoListView />}
        </div>
      </div>
    </div>
  );
}
