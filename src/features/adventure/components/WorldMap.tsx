"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { useAdventureStore } from "@/features/adventure/stores/adventureStore";
import { soundEngine } from "@/lib/sounds/SoundEngine";
import { AREA1_STAGES } from "../data/stages_area1";
import { StoryModal } from "./StoryModal";

// テーマごとのスタイル定義
const MAP_THEME_STYLES = {
  paper: {
    bg: "bg-[#f5f2eb]",
    text: "text-[#3d3330]",
    subText: "text-stone-500",
    headerBtn:
      "border-[#3d3330]/20 text-[#3d3330] hover:bg-[#3d3330] hover:text-[#f5f2eb]",
    card: {
      border: "border-[#3d3330]/10",
      shadow: "shadow-lg",
      // Linter対応: bg-linear-to-br
      bgGradient: "from-[#e8e6e1] to-[#d6d3cc]",
      text: "text-[#3d3330]",
      subText: "text-[#3d3330]/70",
      accent: "text-[#d94a38]",
      progressBg: "bg-[#3d3330]/10",
      progressBar: "bg-[#d94a38]",
      actionText: "text-[#3d3330]",
    },
    placeholder: "border-[#3d3330]/10 bg-white/30 text-[#3d3330]",
  },
  dark: {
    bg: "bg-[#1c1c1e]",
    text: "text-[#e5e5e5]",
    subText: "text-stone-400",
    headerBtn:
      "border-white/20 text-[#e5e5e5] hover:bg-[#e5e5e5] hover:text-[#1c1c1e]",
    card: {
      border: "border-white/10",
      shadow: "shadow-white/5",
      // Linter対応: bg-linear-to-br
      bgGradient: "from-[#2c2c2e] to-[#1c1c1e]",
      text: "text-[#e5e5e5]",
      subText: "text-[#e5e5e5]/60",
      accent: "text-[#ff9f0a]",
      progressBg: "bg-white/10",
      progressBar: "bg-[#ff9f0a]",
      actionText: "text-[#ff9f0a]",
    },
    placeholder: "border-white/10 bg-white/5 text-[#e5e5e5]",
  },
};

export function WorldMap() {
  const router = useRouter();

  // ストアから必要な状態とアクションを取得
  const { currentStageIndex, theme, setTheme } = useAdventureStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 現在のテーマスタイル
  const currentStyles = MAP_THEME_STYLES[theme];

  useEffect(() => {
    setIsMounted(true);
    setIsMuted(soundEngine.isMuted);
  }, []);

  const AREA_INFO = {
    id: "area-1",
    title: "第一章：始まりの里",
    description: "見慣れた風景の裏側に、まだ名前のない何かが息づいている。",
    totalStages: AREA1_STAGES.length,
  };

  const progressPercent = Math.min(
    100,
    Math.round((currentStageIndex / AREA_INFO.totalStages) * 100)
  );
  const isCompleted = currentStageIndex >= AREA_INFO.totalStages;

  // --- サウンド制御 ---
  useEffect(() => {
    // マウント時: 音を鳴らす
    soundEngine.playNatureAmbience();

    // アンマウント時: 音を止める
    return () => {
      soundEngine.stopAmbience();
    };
  }, []);

  const toggleMute = () => {
    const newState = !isMuted;
    soundEngine.setMute(newState);
    setIsMuted(newState);
    if (!newState) {
      soundEngine.playNatureAmbience();
    } else {
      soundEngine.stopAmbience();
    }
  };

  const toggleTheme = () => {
    soundEngine.playSelect();
    setTheme(theme === "paper" ? "dark" : "paper");
  };

  // --- アクション ---

  const handleAreaClick = () => {
    soundEngine.playSelect();
    router.push("/adventure/play");
  };

  const handleReviewClick = () => {
    soundEngine.playSelect();
    setIsStoryOpen(true);
  };

  // 最初からやり直す（リプレイ）
  const handleReplayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // カードクリックの暴発防止
    if (
      confirm(
        "旅の記憶（クリア記録）は残りますが、\n物語を最初からプレイし直しますか？"
      )
    ) {
      soundEngine.playSelect();
      // 進行度だけリセットする
      useAdventureStore.setState({ currentStageIndex: 0 });
      // そのままプレイ画面へ
      router.push("/adventure/play");
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div
        className={`min-h-screen p-6 pb-20 overflow-x-hidden flex flex-col transition-colors duration-500 ${currentStyles.bg} ${currentStyles.text}`}
      >
        {/* ★ヘッダー修正箇所 
          - flex-col: スマホでは縦並び
          - md:flex-row: PCでは横並び (元通り)
          - gap-4: 縦並びの時の隙間
          - items-center: 中央揃え
          - mb-6: スマホでの下の余白を少し狭く
        */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 mb-6 md:mb-10 z-10">
          <div className="text-center md:text-left">
            {/* タイトル: スマホはtext-2xl、PCはtext-4xl */}
            <h1 className="text-2xl md:text-4xl font-serif font-bold tracking-widest">
              冒険の地図
            </h1>
            <p
              className={`text-xs md:text-sm mt-1 font-serif ${currentStyles.subText}`}
            >
              旅の記録
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* テーマ切り替えボタン */}
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${currentStyles.headerBtn}`}
              aria-label="テーマ切り替え"
            >
              {theme === "paper" ? "🌙" : "☀️"}
            </button>

            {/* サウンドボタン */}
            <button
              onClick={toggleMute}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${currentStyles.headerBtn}`}
              aria-label={isMuted ? "サウンドON" : "サウンドOFF"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            <Link
              href="/"
              className={`px-6 py-2 rounded-full transition-colors font-serif text-sm tracking-widest shadow-sm ${currentStyles.headerBtn
                .replace("text-[#3d3330]", "bg-[#3d3330] text-[#f5f2eb]")
                .replace("hover:bg-[#3d3330]", "hover:bg-[#594a46]")}`}
              // HeaderBtnのクラス流用調整
              style={{
                backgroundColor: theme === "dark" ? "#2c2c2e" : "#3d3330",
                color: theme === "dark" ? "#e5e5e5" : "#f5f2eb",
                border: "none",
              }}
            >
              戻る
            </Link>
          </div>
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
              w-full relative overflow-hidden rounded-xl border-2 shadow-lg cursor-pointer 
              bg-linear-to-br group transition-all duration-300
              ${currentStyles.card.border} ${currentStyles.card.bgGradient}
            `}
          >
            {/* 背景装飾 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="p-8 md:p-10 flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full tracking-wider bg-black/10 ${currentStyles.card.text}`}
                >
                  AREA 01
                </span>
                {isCompleted && (
                  <span
                    className={`text-xs font-bold flex items-center gap-1 bg-white/20 px-2 py-1 rounded ${currentStyles.card.accent}`}
                  >
                    <span>💮</span> 読破済み
                  </span>
                )}
              </div>

              <div>
                <h2
                  className={`text-2xl md:text-3xl font-serif font-bold mb-2 tracking-widest transition-colors group-hover:${currentStyles.card.accent} ${currentStyles.card.text}`}
                >
                  {AREA_INFO.title}
                </h2>
                <p
                  className={`text-sm font-serif leading-relaxed line-clamp-2 ${currentStyles.card.subText}`}
                >
                  {AREA_INFO.description}
                </p>
              </div>

              <div className="mt-4">
                <div
                  className={`flex justify-between text-xs font-bold mb-2 opacity-60 ${currentStyles.card.text}`}
                >
                  <span>進捗</span>
                  <span>{progressPercent}%</span>
                </div>
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${currentStyles.card.progressBg}`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className={`h-full ${currentStyles.card.progressBar}`}
                  />
                </div>
              </div>

              {/* アクション表示 */}
              <div
                className={`mt-4 pt-4 border-t border-black/10 flex justify-end gap-4`}
              >
                {/* クリア済みの場合のリプレイボタン */}
                {isCompleted && (
                  <button
                    onClick={handleReplayClick}
                    className={`text-xs font-bold opacity-60 hover:opacity-100 hover:scale-105 transition-all ${currentStyles.card.text}`}
                  >
                    🔄 最初から
                  </button>
                )}

                <span
                  className={`flex items-center gap-2 font-serif font-bold group-hover:translate-x-2 transition-transform ${currentStyles.card.actionText}`}
                >
                  {isCompleted
                    ? "旅を振り返る"
                    : currentStageIndex === 0
                    ? "物語を始める"
                    : "旅を再開する"}
                  <span>→</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* 読み返しボタン (クリア後のみ) */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full"
            >
              <button
                onClick={handleReviewClick}
                className={`
                  w-full py-4 border-2 rounded-xl shadow-sm
                  flex items-center justify-center gap-3
                  font-serif font-bold tracking-widest text-lg
                  hover:shadow-md hover:scale-[1.02] transition-all duration-300 group
                  bg-linear-to-br
                  ${currentStyles.card.bgGradient} ${currentStyles.card.border} ${currentStyles.card.accent}
                `}
              >
                <span className="text-2xl group-hover:rotate-12 transition-transform">
                  📖
                </span>
                <span>物語を紐解く</span>
              </button>
            </motion.div>
          )}

          {/* 次エリア (プレースホルダー) */}
          <div
            className={`w-full p-6 rounded-xl border flex items-center justify-center opacity-50 ${currentStyles.placeholder}`}
          >
            <div className="text-center">
              <h3 className="text-lg font-serif font-bold mb-1">
                第二章：言葉の森
              </h3>
              <p className="text-xs opacity-60">Coming Soon...</p>
            </div>
          </div>
        </div>
      </div>

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
