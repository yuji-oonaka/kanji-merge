"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// 背景に浮遊させる漢字リスト
const BG_CHARS = [
  "日",
  "月",
  "木",
  "山",
  "石",
  "田",
  "土",
  "雨",
  "言",
  "門",
  "馬",
  "魚",
  "鳥",
  "心",
  "手",
  "目",
];

interface Particle {
  id: number;
  char: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function TitleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // クライアントサイドでのみ生成
    const count = 15;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        char: BG_CHARS[Math.floor(Math.random() * BG_CHARS.length)],
        x: Math.random() * 100, // 0-100%
        y: Math.random() * 100, // 0-100%
        size: 20 + Math.random() * 40, // 20-60px
        duration: 15 + Math.random() * 20, // 15-35s (ゆっくり)
        delay: Math.random() * -20, // 最初から動いているように見せる
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute font-serif font-bold text-stone-400 select-none flex items-center justify-center"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            width: `${p.size * 1.5}px`, // 正方形に近い枠
            height: `${p.size * 1.5}px`,
          }}
          animate={{
            y: [0, -100, 0], // 上下に浮遊
            x: [0, 50, -50, 0], // 左右に揺らぎ
            rotate: [0, 10, -10, 0], // ゆらゆら回転
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        >
          {/* 和紙っぽい枠線をつける */}
          <div className="w-full h-full border border-stone-300 rounded-full flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            {p.char}
          </div>
        </motion.div>
      ))}

      {/* 画面全体にかける和紙テクスチャ風ノイズ */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
        }}
      />
    </div>
  );
}
