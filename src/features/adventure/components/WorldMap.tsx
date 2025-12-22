"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { useAdventureStore } from "@/features/adventure/stores/adventureStore";
import { soundEngine } from "@/lib/sounds/SoundEngine";
import { AREA1_STAGES } from "../data/stages_area1";
import { StoryModal } from "./StoryModal";

export function WorldMap() {
  const router = useRouter();
  const { currentStageIndex, theme } = useAdventureStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const AREA_INFO = {
    id: "area-1",
    title: "第一章：始まりの里",
    description: "見慣れた風景の裏側に、まだ名前のない何かが息づいている。",
    totalStages: AREA1_STAGES.length,
    bgGradient: "from-[#e8e6e1] to-[#d6d3cc]",
  };

  const progressPercent = Math.min(
    100,
    Math.round((currentStageIndex / AREA_INFO.totalStages) * 100)
  );
  const isCompleted = currentStageIndex >= AREA_INFO.totalStages;

  useEffect(() => {
    soundEngine.playRiverAmbience();
    return () => {};
  }, []);

  const handleAreaClick = () => {
    soundEngine.playSelect();
    router.push("/adventure/play");
  };

  const handleReviewClick = () => {
    soundEngine.playSelect();
    setIsStoryOpen(true);
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="min-h-screen bg-[#f5f2eb] text-[#3d3330] p-6 pb-20 overflow-x-hidden flex flex-col">
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-10 z-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-widest text-[#3d3330]">
              冒険の地図
            </h1>
            <p className="text-xs md:text-sm text-stone-500 mt-1 font-serif">
              旅の記録
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-2 bg-[#3d3330] text-[#f5f2eb] rounded-full hover:bg-[#594a46] transition-colors font-serif text-sm tracking-widest shadow-sm"
          >
            戻る
          </Link>
        </header>

        {/* マップメインエリア */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full gap-8">
          {/* --- エリアカード --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAreaClick}
            className={`
              w-full relative overflow-hidden rounded-xl border-2 border-[#3d3330]/10 shadow-lg cursor-pointer bg-linear-to-br ${AREA_INFO.bgGradient}
              group transition-all duration-300
            `}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="p-8 md:p-10 flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#3d3330]/10 text-[#3d3330] text-xs font-bold rounded-full tracking-wider">
                  AREA 01
                </span>
                {isCompleted && (
                  <span className="text-[#d94a38] text-xs font-bold flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                    <span>💮</span> 読破済み
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#3d3330] mb-2 tracking-widest group-hover:text-[#d94a38] transition-colors">
                  {AREA_INFO.title}
                </h2>
                <p className="text-sm text-[#3d3330]/70 font-serif leading-relaxed line-clamp-2">
                  {AREA_INFO.description}
                </p>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold text-[#3d3330]/60 mb-2">
                  <span>進捗</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-[#3d3330]/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className="h-full bg-[#d94a38]"
                  />
                </div>
              </div>

              {/* アクション表示 */}
              <div className="mt-4 pt-4 border-t border-[#3d3330]/10 flex justify-end">
                <span className="flex items-center gap-2 font-serif font-bold text-[#3d3330] group-hover:translate-x-2 transition-transform">
                  {currentStageIndex === 0 ? "物語を始める" : "旅を再開する"}
                  <span>→</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* --- ★修正: 読み返しボタン (クリア後のみ出現) --- */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full"
            >
              <button
                onClick={handleReviewClick}
                className="
                  w-full py-4 bg-[#fffaf0] border-2 border-[#d94a38]/30 rounded-xl shadow-sm
                  flex items-center justify-center gap-3
                  text-[#d94a38] font-serif font-bold tracking-widest text-lg
                  hover:bg-[#fff5e0] hover:border-[#d94a38]/60 hover:shadow-md hover:scale-[1.02]
                  transition-all duration-300 group
                "
              >
                <span className="text-2xl group-hover:rotate-12 transition-transform">
                  📖
                </span>
                <span>物語を紐解く</span>
              </button>
              <p className="text-center text-xs text-[#3d3330]/50 mt-2 font-serif">
                完成した物語を、最初から読み返せます。
              </p>
            </motion.div>
          )}

          {/* 次エリア (プレースホルダー) */}
          <div className="w-full p-6 rounded-xl border border-[#3d3330]/10 bg-white/30 flex items-center justify-center opacity-50">
            <div className="text-center">
              <h3 className="text-lg font-serif font-bold text-[#3d3330] mb-1">
                第二章：言葉の森
              </h3>
              <p className="text-xs text-[#3d3330]/60">Coming Soon...</p>
            </div>
          </div>
        </div>
      </div>

      {/* 読み返しモーダル */}
      <AnimatePresence>
        {isStoryOpen && (
          <StoryModal
            stages={AREA1_STAGES}
            theme={theme}
            onClose={() => setIsStoryOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
