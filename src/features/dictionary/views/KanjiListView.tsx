"use client";

// ★修正1: useGameStore ではなく、図鑑専用の useDictionaryStore を使う
import { useDictionaryStore } from "@/features/dictionary/stores/dictionarySlice";
// ★修正2: 熟語データ(jukugo-db)ではなく、合体辞書データ(ids-map)を読み込む
import idsMapData from "@/features/kanji-core/data/ids-map-auto.json";
import jukugoDataRaw from "@/features/kanji-core/data/jukugo-db-auto.json";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDisplayChar } from "@/features/game-board/utils/charDisplay";

const jukugoData = jukugoDataRaw as JukugoDefinition[];
// 型アサーション (JSONを型に合わせる)
const idsMap = idsMapData as Record<string, string[]>;

export function KanjiListView() {
  // ★修正3: undefined対策の安全策
  const unlockedIds = useDictionaryStore((state) => state.unlockedIds) || [];
  const unlockedJukugos =
    useDictionaryStore((state) => state.unlockedJukugos) || [];

  const data = jukugoData;

  // ★修正4: 有効な漢字リストの生成ロジックを「辞書データ」ベースに変更
  const validKanjiList = useMemo(() => {
    const usedChars = new Set<string>();

    // 1. 辞書の「キー（作れる漢字）」を全て追加 (例: 意, 恵...)
    // これが generate_dictionary.py のログに出ていた "841" 個です
    Object.keys(idsMap).forEach((key) => usedChars.add(key));

    // 2. 辞書の「値（素材パーツ）」も全て追加 (例: 日, 月, 田...)
    // これを入れないと、レシピを持たない「原子パーツ」が図鑑から消えてしまいます
    Object.values(idsMap).forEach((parts) => {
      parts.forEach((char) => usedChars.add(char));
    });

    // 3. フィルタリング & ソート
    return (
      Array.from(usedChars)
        // 中間パーツ("&..."など)や、記号を除外して、純粋な漢字だけにする
        .filter((char) => char.match(/^[一-龠々〆ヵヶ]+$/))
        .sort()
    );
  }, []);

  const [selectedKanji, setSelectedKanji] = useState<string | null>(null);

  return (
    <>
      <div className="pb-20">
        {/* グリッド表示部分 */}
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10 xl:grid-cols-12 gap-2 md:gap-3">
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
                  text-xl md:text-2xl lg:text-3xl font-serif font-bold shadow-sm border
                  transition-colors duration-300
                  ${
                    isUnlocked
                      ? "bg-white text-[#3d3330] border-[#3d3330]/20 cursor-pointer hover:border-[#d94a38] hover:shadow-md"
                      : "bg-[#e0dcd5] text-transparent border-transparent cursor-default"
                  }
                `}
              >
                {isUnlocked ? getDisplayChar(char) : "?"}
              </motion.button>
            );
          })}
        </div>

        {/* 取得率の表示 (デバッグ用にも便利) */}
        <div className="mt-8 text-center text-xs text-stone-400 font-bold tracking-widest">
          COLLECTED: {unlockedIds.length} / {validKanjiList.length}
        </div>
      </div>

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
  const relatedJukugos = useMemo(() => {
    return allData.filter((item) => item.components.includes(kanji));
  }, [kanji, allData]);

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
        className="relative w-[90%] max-w-md bg-[#fdfcf8] rounded-xl shadow-2xl overflow-hidden border border-[#3d3330]/10 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#f5f2eb] p-6 text-center border-b border-[#3d3330]/10 flex-none">
          <div className="text-xs text-stone-500 font-bold tracking-widest mb-2">
            SELECTED KANJI
          </div>
          <div className="text-6xl md:text-7xl font-serif font-bold text-[#3d3330]">
            {getDisplayChar(kanji)}
          </div>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          <h3 className="text-xs md:text-sm font-bold text-stone-400 mb-4 flex items-center gap-2">
            <span>使用されている熟語</span>
            <span className="bg-stone-200 text-stone-600 px-2 rounded-full text-[10px]">
              {relatedJukugos.length}
            </span>
          </h3>
          <div className="flex flex-col gap-2 md:gap-3">
            {relatedJukugos.length > 0 ? (
              relatedJukugos.map((jukugo) => {
                const isUnlocked = unlockedIds.includes(jukugo.id);
                return (
                  <div
                    key={jukugo.id}
                    className={`flex items-center gap-3 p-2 md:p-3 rounded border ${
                      isUnlocked
                        ? "bg-white border-[#3d3330]/10"
                        : "bg-stone-100 border-dashed border-stone-300 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded text-base md:text-lg font-serif font-bold shrink-0 ${
                        isUnlocked
                          ? "bg-[#d94a38] text-white"
                          : "bg-stone-300 text-stone-500"
                      }`}
                    >
                      {isUnlocked ? getDisplayChar(jukugo.kanji[0]) : "?"}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-[#3d3330] text-sm md:text-base">
                        {isUnlocked ? jukugo.kanji : "???"}
                      </div>
                      <div className="text-[10px] md:text-xs text-stone-500">
                        {isUnlocked ? jukugo.reading : "未発見"}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-xs text-stone-400 py-4">
                この漢字を使う熟語はまだありません
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-[#f5f2eb] text-center border-t border-[#3d3330]/10 flex-none">
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
