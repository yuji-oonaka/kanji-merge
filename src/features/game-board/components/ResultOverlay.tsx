"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
// 修正: エイリアス(@/)を使用して確実に指定
import { useGameStore } from "@/features/game-board/stores/store";
import { soundEngine } from "@/lib/sounds/SoundEngine";
import { JukugoDefinition } from "@/features/kanji-core/types";

interface ResultOverlayProps {
  onNextLevel?: () => void;
}

export function ResultOverlay({ onNextLevel }: ResultOverlayProps) {
  const currentJukugo = useGameStore((state) => state.currentJukugo);
  const [stampVisible, setStampVisible] = useState(false);

  useEffect(() => {
    // 1.3秒後にスタンプ音を鳴らし、表示フラグを立てる
    const timer = setTimeout(() => {
      setStampVisible(true);
      if (soundEngine) {
        // 安全策: メソッドの存在確認をしてから実行
        if (typeof (soundEngine as any).playStamp === "function") {
          (soundEngine as any).playStamp();
        } else {
          soundEngine.playMerge();
        }
      }
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  if (!currentJukugo) return null;

  const meaning = (currentJukugo as JukugoDefinition & { meaning?: string })
    .meaning;
  const charCount = currentJukugo.kanji.length;

  // --- 動的スタイルの決定 ---
  // 文字数に応じてフォントサイズとレイアウトを微調整
  let fontSizeClass = "";
  let gapClass = "gap-3 md:gap-5";
  let readingPT = "pt-6"; // 読みの開始位置調整

  if (charCount <= 2) {
    // 2文字: ドンと大きく
  } else if (charCount === 3) {
    // 3文字: バランス型
    gapClass = "gap-2 md:gap-4";
    readingPT = "pt-4";
  } else {
    // 4文字以上: スラっと収める
    gapClass = "gap-2 md:gap-3";
    readingPT = "pt-2";
  }

  // vw単位を使ったレスポンシブなフォントサイズ計算
  // 画面幅が狭いときはvw、広いときはremでキャップする計算式
  const getDynamicFontSize = (count: number) => {
    if (count <= 2) return "min(8rem, 25vw)";
    if (count === 3) return "min(6rem, 18vw)";
    return "min(4.5rem, 13vw)";
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative bg-[#fcfaf5] w-full max-w-sm aspect-3/4 rounded-sm shadow-2xl flex flex-col items-center p-8 overflow-hidden"
        style={{
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.5), inset 0 0 60px rgba(0,0,0,0.05)",
          // 和紙パターンがない場合のフォールバック色
          backgroundColor: "#fcfaf5",
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
        }}
      >
        {/* 四隅の装飾 (和風テイスト) */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-stone-300" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-stone-300" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-stone-300" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-stone-300" />

        {/* --- メインコンテンツ --- */}
        <div className="flex-1 flex flex-col items-center justify-center w-full relative">
          {/* 縦書きレイアウトコンテナ */}
          {/* flex-row-reverse: 右側にメイン(漢字)、左側にサブ(読み)を配置 */}
          <div
            className={`flex flex-row-reverse items-center justify-center ${gapClass} mr-2`}
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
                height: "auto",
                whiteSpace: "nowrap",
                marginLeft: "-0.1em", // 視覚補正
              }}
            >
              {currentJukugo.kanji}
            </motion.div>

            {/* 2. 読み (サブ・左側) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`text-lg md:text-xl text-stone-500 font-serif tracking-widest leading-none ${readingPT} select-none`}
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                height: "auto",
                // 読みが長すぎるときはスクロールさせず、はみ出さないように制限
                maxHeight: charCount >= 4 ? "320px" : "260px",
              }}
            >
              {currentJukugo.reading}
            </motion.div>
          </div>

          {/* ハンコ (スタンプ) */}
          {/* アニメーションで「ポンッ」と押される演出 */}
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
            className="absolute -top-4 -right-4 md:-right-2 w-28 h-28 flex items-center justify-center mix-blend-multiply pointer-events-none"
            style={{ zIndex: 10 }}
          >
            <div
              className="w-full h-full border-[3px] border-red-600 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(220, 38, 38, 0.05)" }}
            >
              <div className="w-[88%] h-[88%] border border-red-600 rounded flex items-center justify-center">
                <div className="text-red-600 font-serif font-bold text-4xl tracking-widest select-none transform rotate-0">
                  天晴
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 意味 (下に横書き) */}
        {/* 4文字熟語などでスペースが厳しい場合はマージンを調整 */}
        {meaning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm md:text-base text-stone-600 font-serif text-center max-w-[90%] border-t border-stone-300 pt-4 mb-4 mt-2"
          >
            {meaning}
          </motion.div>
        )}

        {/* ボタンエリア */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
          className="w-full"
        >
          <button
            onClick={onNextLevel}
            className="w-full py-3 bg-[#d94a38] text-white font-bold text-lg rounded shadow-md hover:bg-[#b93a28] transition-all tracking-widest transform hover:scale-[1.02] active:scale-[0.98]"
          >
            次の刻へ
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
