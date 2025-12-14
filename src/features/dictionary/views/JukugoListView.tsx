// src/features/dictionary/views/JukugoListView.tsx
"use client";

import { useGameStore } from "@/features/game-board/stores/store";
import jukugoData from "@/features/kanji-core/data/jukugo-db-auto.json";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 五十音インデックス
const SYLLABARY_ROWS = [
  { label: "全", value: "all" },
  { label: "あ", value: "a" },
  { label: "か", value: "ka" },
  { label: "さ", value: "sa" },
  { label: "た", value: "ta" },
  { label: "な", value: "na" },
  { label: "は", value: "ha" },
  { label: "ま", value: "ma" },
  { label: "や", value: "ya" },
  { label: "ら", value: "ra" },
  { label: "わ", value: "wa" },
];

export function JukugoListView() {
  const unlockedJukugos = useGameStore((state) => state.unlockedJukugos);
  const data = jukugoData as JukugoDefinition[];

  const [filterRow, setFilterRow] = useState<string>("all");
  const [selectedJukugo, setSelectedJukugo] = useState<JukugoDefinition | null>(
    null
  );

  // フィルタリング処理
  const filteredJukugos = useMemo(() => {
    if (filterRow === "all") return data;

    const checkRow = (reading: string, row: string) => {
      if (row === "a") return /^[あ-お]/.test(reading);
      if (row === "ka") return /^[か-こが-ご]/.test(reading);
      if (row === "sa") return /^[さ-そざ-ぞ]/.test(reading);
      if (row === "ta") return /^[た-とだ-ど]/.test(reading);
      if (row === "na") return /^[な-の]/.test(reading);
      if (row === "ha") return /^[は-ほば-ぼぱ-ぽ]/.test(reading);
      if (row === "ma") return /^[ま-も]/.test(reading);
      if (row === "ya") return /^[や-よ]/.test(reading);
      if (row === "ra") return /^[ら-ろ]/.test(reading);
      if (row === "wa") return /^[わ-ん]/.test(reading);
      return true;
    };

    return data.filter((j) => checkRow(j.reading, filterRow));
  }, [data, filterRow]);

  // 現在表示中のリストでの収集済みカウント
  const currentUnlockedCount = filteredJukugos.filter((item) =>
    unlockedJukugos.includes(item.id)
  ).length;

  return (
    <>
      {/* --- あかさたなフィルター (追従ヘッダー) --- */}
      <div className="sticky top-0 z-30 bg-[#f5f2eb]/95 backdrop-blur pt-2 pb-4 mb-4 border-b border-[#3d3330]/10">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 min-w-max px-1">
            {SYLLABARY_ROWS.map((row) => (
              <button
                key={row.value}
                onClick={() => setFilterRow(row.value)}
                className={`
                    w-10 h-10 rounded-full font-serif font-bold text-sm transition-all border shrink-0
                    ${
                      filterRow === row.value
                        ? "bg-[#d94a38] text-white border-[#d94a38] shadow-md scale-110"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                    }
                  `}
              >
                {row.label}
              </button>
            ))}
          </div>
        </div>
        {/* 件数表示 */}
        <div className="text-right text-xs font-serif text-stone-500 px-2 mt-1">
          {currentUnlockedCount} / {filteredJukugos.length} 件 表示中
        </div>
      </div>

      {/* --- リスト本体 --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
        <AnimatePresence mode="popLayout">
          {filteredJukugos.map((jukugo) => {
            const isUnlocked = unlockedJukugos.includes(jukugo.id);
            return (
              <motion.div
                layout
                key={jukugo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => isUnlocked && setSelectedJukugo(jukugo)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all flex items-center justify-between
                  ${
                    isUnlocked
                      ? "bg-white border-[#3d3330]/10 shadow-sm cursor-pointer hover:border-[#d94a38]/50 hover:shadow-md hover:-translate-y-0.5"
                      : "bg-[#e0dcd5]/40 border-dashed border-stone-300 opacity-60 pointer-events-none"
                  }
                `}
              >
                <div>
                  <div className="text-2xl font-serif font-bold text-[#3d3330] mb-1">
                    {isUnlocked ? jukugo.kanji : "???"}
                  </div>
                  <div className="text-xs text-[#d94a38] font-bold tracking-widest">
                    {isUnlocked ? jukugo.reading : "???"}
                  </div>
                </div>

                {isUnlocked && (
                  <div className="text-[10px] bg-stone-100 text-stone-400 px-2 py-1 rounded border border-stone-200">
                    Lv.{jukugo.difficulty}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredJukugos.length === 0 && (
          <div className="col-span-full text-center py-20 text-stone-400 font-serif">
            該当する熟語はありません
          </div>
        )}
      </div>

      {/* --- 詳細モーダル (共通) --- */}
      <AnimatePresence>
        {selectedJukugo && (
          <JukugoDetailModal
            item={selectedJukugo}
            onClose={() => setSelectedJukugo(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// モーダル (前回の最強z-index版と同じもの)
function JukugoDetailModal({
  item,
  onClose,
}: {
  item: JukugoDefinition;
  onClose: () => void;
}) {
  const formattedSentence = useMemo(() => {
    if (!item.sentence) return null;
    const parts = item.sentence.split("{{target}}");
    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="text-[#d94a38] font-bold mx-1 border-b border-[#d94a38]/30">
                {item.kanji}
              </span>
            )}
          </span>
        ))}
      </>
    );
  }, [item]);

  return (
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
        className="relative w-full max-w-lg bg-[#fdfcf8] rounded-xl shadow-2xl overflow-hidden border border-[#3d3330]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-2 w-full bg-[#d94a38]" />
        <div className="p-8 flex flex-col items-center text-center">
          <div className="text-sm text-stone-500 tracking-[0.2em] font-serif mb-2">
            {item.reading}
          </div>
          <div className="text-5xl md:text-6xl font-serif font-bold text-[#3d3330] mb-6">
            {item.kanji}
          </div>
          <div className="w-12 h-px bg-[#3d3330]/20 mb-6" />
          {item.meaning && (
            <div className="text-[#3d3330] font-serif leading-relaxed mb-8 text-lg">
              {item.meaning}
            </div>
          )}
          {formattedSentence ? (
            <div className="bg-[#f5f2eb] rounded-lg p-5 w-full text-left border border-[#3d3330]/5 relative">
              <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-2 bg-white px-2 text-[10px] text-[#d94a38] font-bold tracking-widest border border-[#d94a38]/20 rounded-full">
                USAGE
              </div>
              <div className="text-stone-700 font-serif text-lg leading-loose">
                “ {formattedSentence} ”
              </div>
            </div>
          ) : (
            <div className="text-stone-400 text-sm font-serif">
              (例文データはありません)
            </div>
          )}
        </div>
        <div className="bg-[#f5f2eb] p-4 flex justify-center border-t border-[#3d3330]/10">
          <button
            onClick={onClose}
            className="px-8 py-2 rounded-full bg-[#3d3330] text-[#fdfcf8] text-sm font-bold hover:bg-[#594a46] transition-colors shadow-md"
          >
            閉じる
          </button>
        </div>
      </motion.div>
    </div>
  );
}
