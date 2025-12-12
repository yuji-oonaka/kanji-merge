"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../stores/store";
import { useEffect } from "react";

const PARTICLE_COUNT = 16;

export function MergeEffects() {
  const effects = useGameStore((state) => state.effects);
  const removeEffect = useGameStore((state) => state.removeEffect);

  return (
    // 修正: z-indexを z-[100] (最前面) にするとドラッグ操作を遮ってしまうため、
    // パーツ(z-20)よりも奥の z-10 に設定します。
    // これによりリンターの警告も解消され、操作も可能になります。
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <AnimatePresence>
        {effects.map((effect) => (
          <EffectGroup
            key={effect.id}
            effect={effect}
            onComplete={() => removeEffect(effect.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function EffectGroup({
  effect,
  onComplete,
}: {
  effect: {
    id: string;
    x: number;
    y: number;
    type: "MERGE" | "GOAL";
    char?: string;
  };
  onComplete: () => void;
}) {
  useEffect(() => {
    // 漢字表示用に少し長めに残す
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getColors = () => {
    if (effect.type === "GOAL") return ["#f59e0b", "#fbbf24", "#ffffff"];
    return ["#1c1917", "#44403c", "#d94a38"];
  };
  const colors = getColors();

  return (
    <>
      {/* 漢字ポップアップ演出 */}
      {effect.char && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -15, filter: "blur(4px)" }}
          animate={{ scale: 2.0, opacity: 1, rotate: 0, filter: "blur(0px)" }}
          exit={{ scale: 2.5, opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          // 文字だけはパーツより手前に出したいので z-50 を指定
          className="absolute font-serif font-bold text-stone-800 pointer-events-none select-none z-50 whitespace-nowrap"
          style={{
            left: effect.x,
            top: effect.y,
            x: "-50%",
            y: "-50%",
            textShadow:
              "0 0 20px rgba(255,255,255,0.8), 0 0 10px rgba(217, 74, 56, 0.3)",
          }}
        >
          {effect.char}
        </motion.div>
      )}

      {/* 墨のしぶきパーティクル */}
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * 360 + (Math.random() * 30 - 15);
        const distance = 40 + Math.random() * 80;
        const color = colors[i % colors.length];
        const size = 8 + Math.random() * 12;
        const radius = `${30 + Math.random() * 70}% ${
          30 + Math.random() * 70
        }% ${30 + Math.random() * 70}% ${30 + Math.random() * 70}% / ${
          30 + Math.random() * 70
        }% ${30 + Math.random() * 70}% ${30 + Math.random() * 70}% ${
          30 + Math.random() * 70
        }%`;

        return (
          <motion.div
            key={i}
            initial={{
              x: effect.x,
              y: effect.y,
              scale: 0.5,
              opacity: 1,
              borderRadius: "50%",
            }}
            animate={{
              x: effect.x + Math.cos((angle * Math.PI) / 180) * distance,
              y: effect.y + Math.sin((angle * Math.PI) / 180) * distance,
              scale: 0,
              opacity: 0,
              borderRadius: radius,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.4,
              ease: "easeOut",
            }}
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              position: "absolute",
              filter: "blur(0.5px)",
            }}
          />
        );
      })}

      {/* 衝撃波リング */}
      <motion.div
        initial={{
          x: effect.x,
          y: effect.y,
          scale: 0,
          opacity: 0.6,
          borderWidth: 4,
        }}
        animate={{ scale: 2.5, opacity: 0, borderWidth: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "absolute",
          width: 50,
          height: 50,
          borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
          borderColor: colors[1],
          borderStyle: "solid",
          x: "-50%",
          y: "-50%",
          rotate: Math.random() * 360,
        }}
      />
    </>
  );
}
