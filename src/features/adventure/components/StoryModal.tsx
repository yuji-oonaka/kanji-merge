"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { AdventureStage } from "../types";
import { AdventureTheme } from "../stores/adventureStore";

interface StoryModalProps {
  stages: AdventureStage[];
  theme: AdventureTheme;
  onClose: () => void;
}

export function StoryModal({ stages, theme, onClose }: StoryModalProps) {
  const isDark = theme === "dark";

  // テーマ別スタイル定義
  const styles = {
    overlay: isDark ? "bg-black/90" : "bg-[#3d3330]/80",
    modalBg: isDark ? "bg-[#1c1c1e]" : "bg-[#fcfaf5]",
    text: isDark ? "text-[#e5e5e5]" : "text-[#3d3330]",
    accent: isDark ? "text-[#ff9f0a]" : "text-[#d94a38]", // 埋めた文字の色
    closeBtn: isDark
      ? "bg-[#2c2c2e] text-white border-[#3a3a3c] hover:bg-[#3a3a3c]"
      : "bg-white text-[#3d3330] border-stone-200 hover:bg-[#f5f2eb]",
    divider: isDark ? "bg-white/10" : "bg-[#3d3330]/10",
  };

  // 背景スクロール防止
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 ${styles.overlay} backdrop-blur-md transition-all duration-500`}
      onClick={onClose} // 背景クリックで閉じる
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()} // 中身クリックは閉じない
        className={`
          relative w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden 
          ${styles.modalBg} border border-white/10
        `}
      >
        {/* ヘッダー */}
        <div
          className={`flex justify-between items-center px-8 py-6 border-b ${styles.divider} shrink-0`}
        >
          <div>
            <h2
              className={`text-xl md:text-2xl font-serif font-bold tracking-widest ${styles.text}`}
            >
              冒険の記憶
            </h2>
            <p className={`text-xs mt-1 font-serif opacity-60 ${styles.text}`}>
              第一章：始まりの里
            </p>
          </div>
          <button
            onClick={onClose}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center 
              border transition-colors text-lg font-bold shadow-sm
              ${styles.closeBtn}
            `}
          >
            ×
          </button>
        </div>

        {/* 本文エリア */}
        <div className="flex-1 overflow-y-auto px-8 py-10 md:px-12 md:py-12">
          <div
            className={`
            font-serif text-lg md:text-xl leading-[2.5] tracking-wide 
            ${styles.text}
          `}
          >
            {stages.map((stage, sIndex) => {
              // 文章の再構築
              return (
                <div key={stage.id} className="mb-6 last:mb-0">
                  {stage.textParts.map((part, pIndex) => {
                    // 空欄箇所 (index 1) の処理
                    if (pIndex === 1 && stage.correct) {
                      return (
                        <span
                          key={`${stage.id}-${pIndex}`}
                          className={`font-bold mx-1 px-1 border-b-2 border-dashed border-current/30 ${styles.accent}`}
                        >
                          {stage.correct}
                        </span>
                      );
                    }
                    return <span key={`${stage.id}-${pIndex}`}>{part}</span>;
                  })}
                </div>
              );
            })}

            {/* 文末の余韻 */}
            <div className="mt-16 mb-8 text-center opacity-40">
              <span className="inline-block w-1 h-1 bg-current rounded-full mx-1"></span>
              <span className="inline-block w-1 h-1 bg-current rounded-full mx-1"></span>
              <span className="inline-block w-1 h-1 bg-current rounded-full mx-1"></span>
            </div>
          </div>
        </div>

        {/* フッター装飾（フェード） */}
        <div
          className={`absolute bottom-0 left-0 w-full h-24 bg-linear-to-t ${
            isDark ? "from-[#1c1c1e]" : "from-[#fcfaf5]"
          } to-transparent pointer-events-none`}
        />
      </motion.div>
    </div>
  );
}
