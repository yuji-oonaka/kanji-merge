// src/app/page.tsx

"use client";

import { TitleBackground } from "../components/ui/TitleBackground";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/features/game-board/stores/store";
import { DifficultyMode } from "@/features/game-board/stores/slices/stageSlice";

export default function Home() {
  const router = useRouter();
  const setDifficultyMode = useGameStore((state) => state.setDifficultyMode);
  const resetStage = useGameStore((state) => state.resetStage);

  // ▼ 追加: ストアからリセット関数を取得
  const resetSaveData = useGameStore((state) => state.resetSaveData);

  const handleStart = (mode: DifficultyMode) => {
    setDifficultyMode(mode);
    resetStage();
    router.push("/play");
  };

  // ▼ 追加: リセット処理のハンドラ
  const handleReset = () => {
    if (
      confirm(
        "【警告】\nこれまでの収集データやクリア状況がすべて消えます。\n本当にリセットしますか？"
      )
    ) {
      resetSaveData();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#f5f2eb] text-[#3d3330] relative overflow-hidden">
      <TitleBackground />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <div className="mb-10 text-center">
          {/* ロゴデザイン */}
          <div className="inline-block border-4 border-[#3d3330] p-8 mb-6 bg-white shadow-xl transform -rotate-2 relative">
            {/* 装飾用の赤いハンコ風マーク */}
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-[#d94a38] rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white transform rotate-12">
              文脈
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-[0.2em] leading-tight text-center writing-vertical-rl text-upright mx-auto">
              漢字
              <br />
              合体
            </h1>
          </div>

          <p className="text-[#d94a38] font-bold tracking-widest text-sm mb-2">
            ピースをつなぎ、言葉を紡ぐ
          </p>
          <p className="text-stone-400 tracking-[0.4em] text-xs font-bold uppercase">
            Kanji Merge Puzzle
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          {/* 1. 初級モード */}
          <button
            onClick={() => handleStart("EASY")}
            className="group w-full py-4 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-2xl">🌱</span>
              <div className="text-left">
                <div className="font-bold font-serif text-lg tracking-widest">
                  初級
                </div>
                <div className="text-[10px] opacity-80 font-sans tracking-wider">
                  EASY MODE
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          </button>

          {/* 2. 通常モード */}
          <button
            onClick={() => handleStart("NORMAL")}
            className="group w-full py-4 bg-[#3d3330] text-white rounded-xl shadow-md hover:bg-[#2a2320] transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-2xl">🔥</span>
              <div className="text-left">
                <div className="font-bold font-serif text-lg tracking-widest">
                  標準
                </div>
                <div className="text-[10px] opacity-80 font-sans tracking-wider">
                  NORMAL MODE
                </div>
              </div>
            </div>
          </button>

          {/* 3. 冒険モード（準備中） */}
          <div className="w-full relative opacity-60 cursor-not-allowed">
            <button
              disabled
              className="group w-full py-4 bg-[#d94a38] text-white rounded-xl shadow-inner flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🗺️</span>
              <div className="text-left">
                <div className="font-bold font-serif text-lg tracking-widest flex items-center gap-2">
                  冒険の旅
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    開発中
                  </span>
                </div>
                <div className="text-[10px] opacity-80 font-sans tracking-wider">
                  ADVENTURE MODE
                </div>
              </div>
            </button>

            {/* ロックアイコン */}
            <div className="absolute top-2 right-3 text-white/70 text-sm">
              🔒
            </div>
          </div>

          {/* 4. 図鑑 */}
          <button
            onClick={() => router.push("/collection")}
            className="w-full py-3 mt-2 bg-[#fcfaf5] text-[#3d3330] border-2 border-[#3d3330]/10 rounded-xl shadow-sm hover:bg-white hover:border-[#3d3330]/30 transition-all font-bold font-serif tracking-widest text-sm"
          >
            収集図鑑
          </button>
        </div>

        {/* ▼ 追加: データを初期化するボタン (デバッグ用) */}
        <button
          onClick={handleReset}
          className="mt-8 text-[10px] text-stone-400 underline hover:text-[#d94a38] transition-colors font-serif"
        >
          データを初期化する (Reset Data)
        </button>
      </div>

      <div className="absolute bottom-4 text-[10px] text-stone-400 font-serif tracking-wider z-10">
        Ver 1.0.0
      </div>
    </main>
  );
}
