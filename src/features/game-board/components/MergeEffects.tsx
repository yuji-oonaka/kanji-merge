"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../stores/store";
import { useEffect } from "react";
import { useIdsMapStore } from "@/features/dictionary/stores/idsMapStore";
import { getDisplayChar } from "@/features/game-board/utils/charDisplay";

const PARTICLE_COUNT = 16;

// ★追加: 上に来ると「縦積み」になる代表的な部首（かんむり系）
const VERTICAL_TOPS = new Set([
  "艹", // 草冠 (花, 茶)
  "宀", // うかんむり (家, 安)
  "竹", // たけかんむり (答, 等)
  "雨", // あめかんむり (雪, 雲)
  "罒", // あみがしら (買, 罪)
  "穴", // あなかんむり (空, 究)
  "亠", // なべぶた (京, 交)
  "立", // たつ (音, 意)
  "尸", // しかばね (屋, 居) ※左上だが縦に近い扱いの方が綺麗なことが多い
]);

export function MergeEffects() {
  const effects = useGameStore((state) => state.effects);
  const removeEffect = useGameStore((state) => state.removeEffect);

  return (
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
  const idsMap = useIdsMapStore((state) => state.idsMap);

  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getColors = () => {
    if (effect.type === "GOAL") return ["#f59e0b", "#fbbf24", "#ffffff"];
    return ["#1c1917", "#44403c", "#d94a38"];
  };
  const colors = getColors();

  // ★追加: 縦積みかどうか判定するロジック
  const isVerticalLayout = (p1: string, p2: string): boolean => {
    // 1. 上に来る特定の部首なら縦
    if (VERTICAL_TOPS.has(p1)) return true;

    // 2. 特殊な縦合体ペア (土+土=圭, 火+火=炎 など)
    if (p1 === "土" && p2 === "土") return true;
    if (p1 === "火" && p2 === "火") return true;
    if (p1 === "日" && p2 === "日") return true; // 昌など

    // 3. それ以外は基本「横」 (郷, 林, 明 など)
    return false;
  };

  const renderContent = () => {
    if (!effect.char) return null;

    const isIntermediate = effect.char.startsWith("&");

    if (isIntermediate) {
      const parts = idsMap[effect.char] || ["?", "?"];
      const p1 = parts[0];
      const p2 = parts[1];

      // ★判定実行
      const isVertical = isVerticalLayout(p1, p2);

      return (
        <div
          className={`
            flex w-full h-full items-center justify-center font-serif
            ${isVertical ? "flex-col gap-0" : "flex-row gap-2 md:gap-4"} 
          `}
        >
          {/* 1つ目のパーツ */}
          <span
            className={`
              font-bold text-stone-800 leading-none
              ${isVertical ? "-mb-2 md:-mb-4" : ""}
            `}
            style={{
              // 縦なら少し大きく、横なら画面に収まるよう少し小さく
              fontSize: isVertical
                ? "clamp(4rem, 15vw, 8rem)"
                : "clamp(3rem, 12vw, 6rem)",
              textShadow: "0 0 40px rgba(255,255,255,0.9)",
            }}
          >
            {getDisplayChar(p1)}
          </span>

          {/* 2つ目のパーツ */}
          <span
            className={`
              font-bold text-stone-800 leading-none
              ${isVertical ? "-mt-2 md:-mt-4" : ""}
            `}
            style={{
              fontSize: isVertical
                ? "clamp(4rem, 15vw, 8rem)"
                : "clamp(3rem, 12vw, 6rem)",
              textShadow: "0 0 40px rgba(255,255,255,0.9)",
            }}
          >
            {getDisplayChar(p2)}
          </span>
        </div>
      );
    }

    // 通常の漢字の場合
    return (
      <span
        className="font-serif font-bold text-stone-800"
        style={{
          fontSize: "clamp(6rem, 25vw, 12rem)",
          textShadow:
            "0 0 40px rgba(255,255,255,0.9), 0 0 20px rgba(217, 74, 56, 0.3)",
        }}
      >
        {getDisplayChar(effect.char)}
      </span>
    );
  };

  return (
    <>
      {/* 漢字ポップアップ演出 */}
      {effect.char && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -15, filter: "blur(4px)" }}
          animate={{ scale: 1.0, opacity: 1, rotate: 0, filter: "blur(0px)" }}
          exit={{ scale: 1.2, opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {renderContent()}
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
