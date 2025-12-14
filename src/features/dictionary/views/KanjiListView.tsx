// src/features/dictionary/views/KanjiListView.tsx
"use client";

import { useGameStore } from "@/features/game-board/stores/store";
import jukugoData from "@/features/kanji-core/data/jukugo-db-auto.json";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function KanjiListView() {
  const unlockedIds = useGameStore((state) => state.unlockedIds); // 単純な発見ID
  const unlockedJukugos = useGameStore((state) => state.unlockedJukugos);
  const data = jukugoData as JukugoDefinition[];

  // ゲーム内で収集対象となる漢字リスト（熟語から逆算）
  const validKanjiList = useMemo(() => {
    const usedChars = new Set<string>();
    data.forEach((jukugo) => {
      jukugo.components.forEach((char) => usedChars.add(char));
    });

    // ▼ 修正: 漢字(一-龠)、々、〆、ヵ、ヶ 以外（③などの記号）を除外してソート
    return Array.from(usedChars)
      .filter((char) => char.match(/^[一-龠々〆ヵヶ]+$/))
      .sort();
  }, []);

  const [selectedKanji, setSelectedKanji] = useState<string | null>(null);

  return (
    <>
      <div className="pb-20">
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-3">
          {validKanjiList.map((char) => {
            const isUnlocked = unlockedIds.includes(char);
            return (
              <motion.button
                key={char}
                disabled={!isUnlocked}
                whileHover={isUnlocked ? { scale: 1.1, zIndex: 10 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                onClick={() => isUnlocked && setSelectedKanji(char)}
                className={`
                  aspect-square rounded-lg flex items-center justify-center 
                  text-xl md:text-2xl font-serif font-bold shadow-sm border
                  transition-colors duration-300
                  ${
                    isUnlocked
                      ? "bg-white text-[#3d3330] border-[#3d3330]/20 cursor-pointer hover:border-[#d94a38] hover:shadow-md"
                      : "bg-[#e0dcd5] text-transparent border-transparent cursor-default"
                  }
                `}
              >
                {isUnlocked ? char : "?"}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 逆引きモーダル */}
      <AnimatePresence>
        {selectedKanji && (
          <KanjiDetailModal
            kanji={selectedKanji}
            allData={data}
            unlockedIds={unlockedJukugos}
            onClose={() => setSelectedKanji(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function KanjiDetailModal({
  kanji,
  allData,
  unlockedIds,
  onClose,
}: {
  kanji: string;
  allData: JukugoDefinition[];
  unlockedIds: string[];
  onClose: () => void;
}) {
  // この漢字を含む熟語を検索
  const relatedJukugos = useMemo(() => {
    return allData.filter((item) => item.components.includes(kanji));
  }, [kanji, allData]);

  return (
    // ▼ 修正: z-100 -> z-[100] (Tailwindの任意値記法)
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#3d3330]/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-[#fdfcf8] rounded-xl shadow-2xl overflow-hidden border border-[#3d3330]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#f5f2eb] p-6 text-center border-b border-[#3d3330]/10">
          <div className="text-xs text-stone-500 font-bold tracking-widest mb-2">
            SELECTED KANJI
          </div>
          <div className="text-6xl font-serif font-bold text-[#3d3330]">
            {kanji}
          </div>
        </div>
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <h3 className="text-sm font-bold text-stone-400 mb-4 flex items-center gap-2">
            <span>使用されている熟語</span>
            <span className="bg-stone-200 text-stone-600 px-2 rounded-full text-[10px]">
              {relatedJukugos.length}
            </span>
          </h3>
          <div className="flex flex-col gap-3">
            {relatedJukugos.map((jukugo) => {
              const isUnlocked = unlockedIds.includes(jukugo.id);
              return (
                <div
                  key={jukugo.id}
                  className={`flex items-center gap-3 p-3 rounded border ${
                    isUnlocked
                      ? "bg-white border-[#3d3330]/10"
                      : "bg-stone-100 border-dashed border-stone-300 opacity-60"
                  }`}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded text-lg font-serif font-bold ${
                      isUnlocked
                        ? "bg-[#d94a38] text-white"
                        : "bg-stone-300 text-stone-500"
                    }`}
                  >
                    {isUnlocked ? jukugo.kanji[0] : "?"}
                  </div>
                  <div>
                    <div className="font-serif font-bold text-[#3d3330]">
                      {isUnlocked ? jukugo.kanji : "???"}
                    </div>
                    <div className="text-xs text-stone-500">
                      {isUnlocked ? jukugo.reading : "未発見"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-4 bg-[#f5f2eb] text-center border-t border-[#3d3330]/10">
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-[#3d3330] text-sm font-bold transition-colors"
          >
            閉じる
          </button>
        </div>
      </motion.div>
    </div>
  );
}
