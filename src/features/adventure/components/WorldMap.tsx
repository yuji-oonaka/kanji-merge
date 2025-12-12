"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";

// ▼ パスをエイリアス(@)推奨、もしくは相対パスの階層を確認
import { useGameStore } from "@/features/game-board/stores/store";
import { soundEngine } from "@/lib/sounds/SoundEngine";
import { WORLD_AREAS } from "../data/worlds";

export function WorldMap() {
  const router = useRouter();
  const maxReachedLevel = useGameStore((state) => state.maxReachedLevel);
  const setLevelIndex = useGameStore((state) => state.setLevelIndex);

  // 現在の最高到達レベルに対応するエリアを探す
  const currentArea =
    WORLD_AREAS.find(
      (area) =>
        maxReachedLevel >= area.startLevel && maxReachedLevel <= area.endLevel
    ) || WORLD_AREAS[WORLD_AREAS.length - 1];

  // 環境音の再生制御
  useEffect(() => {
    const type = currentArea.ambience;
    if (type === "river") soundEngine.playRiverAmbience();
    else if (type === "wind") soundEngine.playWindAmbience();
    else if (type === "space") soundEngine.playSpaceAmbience();

    // クリーンアップ: 画面遷移時に音を止める
    return () => {
      soundEngine.stopAmbience();
    };
  }, [currentArea]);

  const handleLevelSelect = (level: number) => {
    if (level > maxReachedLevel) return; // ロック中
    soundEngine.stopAmbience();
    setLevelIndex(level);
    router.push("/play");
  };

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#3d3330] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-2xl mx-auto pb-20">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#f5f2eb]/90 backdrop-blur z-10 py-4 border-b border-[#3d3330]/10">
          <div>
            <h1 className="text-3xl font-serif font-bold">探検地図</h1>
            <p className="text-sm text-stone-500">
              到達: Lv.{maxReachedLevel + 1}
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-2 bg-stone-800 text-white rounded-full hover:bg-stone-700 transition-colors font-bold shadow-md"
          >
            戻る
          </Link>
        </div>

        {/* マップエリア */}
        <div className="relative flex flex-col gap-12">
          {/* 縦のライン (道) */}
          <div className="absolute left-1/2 top-4 bottom-4 w-1 bg-stone-300 -translate-x-1/2 rounded-full" />

          {WORLD_AREAS.map((area) => {
            // このエリアを表示すべきか？
            const isAreaUnlocked = maxReachedLevel >= area.startLevel;
            if (!isAreaUnlocked && area.startLevel > maxReachedLevel + 5)
              return null;

            // エリア内のレベルを生成
            const levels = [];
            for (
              let i = area.startLevel;
              i <= Math.min(area.endLevel, maxReachedLevel + 1);
              i++
            ) {
              if (
                i === area.startLevel ||
                i === area.endLevel ||
                i === maxReachedLevel ||
                i % 5 === 0
              ) {
                levels.push(i);
              }
            }
            const uniqueLevels = Array.from(new Set(levels)).sort(
              (a, b) => a - b
            );

            return (
              <div key={area.id} className="relative z-0">
                {/* エリア見出し */}
                <div
                  className={`
                  mb-6 p-4 rounded-xl border-2 border-stone-200 shadow-sm text-center bg-linear-to-br ${area.themeColor}
                `}
                >
                  <h2 className="text-2xl font-serif font-bold text-stone-800">
                    {area.name}
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    {area.description}
                  </p>
                </div>

                {/* レベルノード */}
                <div className="flex flex-col items-center gap-8">
                  {uniqueLevels.map((lv) => {
                    const isLocked = lv > maxReachedLevel;
                    const isCurrent = lv === maxReachedLevel;

                    return (
                      <motion.button
                        key={lv}
                        whileHover={!isLocked ? { scale: 1.1 } : {}}
                        whileTap={!isLocked ? { scale: 0.95 } : {}}
                        onClick={() => handleLevelSelect(lv)}
                        disabled={isLocked}
                        className={`
                          relative w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg font-serif border-4 shadow-lg transition-all
                          ${
                            isCurrent
                              ? "bg-[#d94a38] text-white border-white ring-4 ring-[#d94a38]/30 scale-110 z-10"
                              : isLocked
                              ? "bg-stone-300 text-stone-500 border-stone-200 cursor-not-allowed grayscale"
                              : "bg-white text-stone-700 border-stone-200 hover:border-[#d94a38]"
                          }
                        `}
                      >
                        {lv + 1}

                        {/* 吹き出し（現在地のみ） */}
                        {isCurrent && (
                          <div className="absolute -right-24 bg-stone-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            現在の挑戦
                            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-stone-800 rotate-45" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Next Zone予告 */}
          <div className="text-center py-10 opacity-50">
            <p className="text-stone-400 font-serif">To be continued...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
