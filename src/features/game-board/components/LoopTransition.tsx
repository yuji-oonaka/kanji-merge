"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGameStore } from "../stores/store";
import { THEMES } from "../constants/themes";

// 静かなメッセージの候補
const MESSAGES = [
  "ここまで、ありがとう",
  "続きは、まだあります",
  "もう一度、歩けます",
  "思考は、巡ります",
  "知ることは、終わらない",
];

interface LoopTransitionProps {
  onComplete: () => void;
}

export function LoopTransition({ onComplete }: LoopTransitionProps) {
  const currentTheme = useGameStore((state) => state.currentTheme);
  const theme = THEMES[currentTheme];
  const [message, setMessage] = useState("");

  useEffect(() => {
    // ランダムにメッセージを決定
    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(randomMsg);

    // 演出シーケンス:
    // 1. フェードイン (自動)
    // 2. 読む時間を確保 (2.5秒待機)
    // 3. 完了通知 (onComplete)
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      // 画面全体を覆うフェードイン・アウト
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={`fixed inset-0 z-100 flex items-center justify-center pointer-events-none ${theme.colors.background}`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* メッセージ表示 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={`font-serif text-sm tracking-[0.2em] opacity-60 ${theme.colors.text}`}
        >
          {message}
        </motion.div>
      </div>
    </motion.div>
  );
}
