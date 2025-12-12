"use client";

import Link from "next/link";
// パスエイリアス(@/)を使用して正しくimport
import { useGameStore } from "@/features/game-board/stores";
// ★修正: 自動生成された辞書を読み込む
import idsMapData from "@/features/kanji-core/data/ids-map-auto.json";

export function DictionaryView() {
  const unlockedIds = useGameStore((state) => state.unlockedIds);

  const allKanjiList = Object.keys(idsMapData);

  const total = allKanjiList.length;
  const collected = allKanjiList.filter((k) => unlockedIds.includes(k)).length;
  const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#3d3330] p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-end mb-8 border-b-2 border-[#3d3330]/10 pb-4">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">漢字図鑑</h1>
            <p className="text-stone-500">
              収集率:{" "}
              <span className="text-2xl font-bold text-[#d94a38]">
                {percentage}%
              </span>{" "}
              ({collected}/{total})
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-2 bg-stone-200 rounded-full hover:bg-stone-300 transition-colors font-bold text-stone-600"
          >
            戻る
          </Link>
        </div>

        {/* グリッド表示 */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
          {allKanjiList.map((char) => {
            const isUnlocked = unlockedIds.includes(char);

            return (
              <div
                key={char}
                className={`
                  aspect-square rounded-xl flex items-center justify-center text-3xl font-serif font-bold shadow-sm
                  transition-all duration-300
                  ${
                    isUnlocked
                      ? "bg-white text-[#3d3330] border-2 border-[#3d3330]/20"
                      : "bg-[#e0dcd5] text-transparent border border-transparent"
                  }
                `}
              >
                {/* 未発見なら「？」を表示、発見済みなら漢字を表示 */}
                {isUnlocked ? (
                  char
                ) : (
                  <span className="text-stone-400 text-xl">?</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
