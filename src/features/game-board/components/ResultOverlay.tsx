"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGameStore } from "@/features/game-board/stores/store";
import { soundEngine } from "@/lib/sounds/SoundEngine";
import { JukugoDefinition } from "@/features/kanji-core/types";
import { getSentenceParts } from "@/features/kanji-core/logic/sentenceHelper";
import { cn } from "@/lib/utils/tw-merge";

interface ResultOverlayProps {
  onNextLevel?: () => void;
}

export function ResultOverlay({ onNextLevel }: ResultOverlayProps) {
  const currentJukugo = useGameStore((state) => state.currentJukugo);
  const [stampVisible, setStampVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStampVisible(true);
      if (soundEngine) {
        const engine = soundEngine as any;
        if (typeof engine.playStamp === "function") {
          engine.playStamp();
        } else {
          soundEngine.playMerge();
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!currentJukugo) return null;

  const meaning = (currentJukugo as JukugoDefinition & { meaning?: string })
    .meaning;
  const charCount = currentJukugo.kanji.length;
  const sentenceParts = getSentenceParts(currentJukugo);
  const hasSentenceData = !!currentJukugo.sentence;

  // --- 動的スタイルの決定 ---
  let gapClass = "gap-4 md:gap-8";
  let readingPT = "pt-2";

  if (charCount <= 2) {
    // 2文字
  } else if (charCount === 3) {
    gapClass = "gap-3 md:gap-6";
    readingPT = "pt-1";
  } else {
    gapClass = "gap-2 md:gap-4";
    readingPT = "pt-0";
  }

  // ★修正1: iPhone向けにフォントサイズを全体的に大きくしました
  // vminの値を上げ、remの上限も引き上げています
  const getDynamicFontSize = (count: number) => {
    if (count <= 2) return "min(10rem, 28vmin)"; // 20vmin -> 28vmin
    if (count === 3) return "min(7.5rem, 20vmin)"; // 15vmin -> 20vmin
    return "min(5.5rem, 15vmin)"; // 11vmin -> 15vmin
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "relative bg-[#fcfaf5]",
          "flex flex-col items-center p-8 md:p-12",
          "rounded-sm shadow-2xl overflow-hidden",

          /* ★修正2: iPad(縦)で小さすぎる問題を解消 */
          /* max-w-sm (スマホ幅) -> md:max-w-xl (タブレット幅) に拡張 */
          "w-full max-w-sm md:max-w-xl aspect-3/5",

          /* PC/横画面: 幅固定戦略 */
          /* 少し幅を広げて (480->520) ゆったりさせました */
          "landscape:w-[520px] landscape:h-auto landscape:min-h-[600px] landscape:max-h-[90vh] landscape:aspect-auto",
          "landscape:max-w-none"
        )}
        style={{
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.5), inset 0 0 60px rgba(0,0,0,0.05)",
          backgroundColor: "#fcfaf5",
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
        }}
      >
        {/* 四隅の装飾 */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-stone-300" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-stone-300" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-stone-300" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-stone-300" />

        {/* --- メインコンテンツ --- */}
        <div className="flex-1 flex flex-col items-center justify-center w-full relative min-h-0">
          <div
            className={`flex flex-row-reverse items-center justify-center ${gapClass} mr-2`}
            style={{ minHeight: "200px" }}
          >
            {/* 1. 熟語 (メイン・右側) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
              className="font-serif font-bold text-stone-800 tracking-widest leading-none select-none"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
                fontSize: getDynamicFontSize(charCount),
                whiteSpace: "nowrap",
                marginLeft: "-0.1em",
              }}
            >
              {currentJukugo.kanji}
            </motion.div>

            {/* 2. 読み (サブ・左側) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`text-lg md:text-2xl text-stone-500 font-serif tracking-widest leading-none ${readingPT} select-none`}
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                height: "auto",
                maxHeight: "40vh",
              }}
            >
              {currentJukugo.reading}
            </motion.div>
          </div>

          {/* --- ハンコ (スタンプ) --- */}
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: 20 }}
            animate={
              stampVisible
                ? { scale: 1, opacity: 1, rotate: -15 }
                : { scale: 3, opacity: 0 }
            }
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              mass: 1.5,
            }}
            className={cn(
              "absolute flex items-center justify-center mix-blend-multiply pointer-events-none z-10",
              /* ★修正3: スタンプの位置調整 */
              /* -top-2 (スマホ) はそのまま */
              /* md:top-2 md:right-2 (PC/iPad): 以前の top-8 から数値を小さくし、右上隅に寄せました */
              "-top-2 -right-2 md:top-2 md:right-2 w-24 h-24 md:w-32 md:h-32"
            )}
          >
            <div
              className="w-full h-full border-4 border-red-600 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(220, 38, 38, 0.05)" }}
            >
              <div className="w-[88%] h-[88%] border-2 border-red-600 rounded flex items-center justify-center">
                <div
                  className="text-red-600 font-serif font-bold text-3xl md:text-5xl tracking-widest select-none transform rotate-0"
                  style={{ marginRight: "-0.1em" }}
                >
                  天晴
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 意味 & 例文 (下に横書き) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full max-w-[95%] pt-6 mb-6 mt-4 border-t border-stone-300 flex flex-col items-center gap-3 shrink-0"
        >
          {/* 意味 */}
          {meaning && (
            <div className="text-base md:text-xl text-stone-700 font-serif text-center font-bold">
              {meaning}
            </div>
          )}

          {/* 例文 */}
          {hasSentenceData && (
            <div className="text-sm md:text-lg text-stone-500 font-serif text-center mt-1 bg-stone-100 px-4 py-2 rounded-full">
              {sentenceParts
                .map((p) => (p.type === "SLOT" ? currentJukugo.kanji : p.text))
                .join("")}
            </div>
          )}
        </motion.div>

        {/* ボタンエリア */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
          className="w-full shrink-0"
        >
          <button
            onClick={onNextLevel}
            className="w-full py-4 bg-[#d94a38] text-white font-bold text-xl md:text-2xl rounded shadow-md hover:bg-[#b93a28] transition-all tracking-widest transform hover:scale-[1.02] active:scale-[0.98]"
          >
            次の刻へ
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
