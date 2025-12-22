"use client";

import { TitleBackground } from "../components/ui/TitleBackground";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/features/game-board/stores/store";
import { useDictionaryStore } from "@/features/dictionary/stores/dictionarySlice";
import { DifficultyMode } from "@/features/game-board/stores/slices/stageSlice";
import { useCallback, useEffect, useState } from "react";
// 冒険用のストアを追加
import { useAdventureStore } from "@/features/adventure/stores/adventureStore";

export default function Home() {
  const router = useRouter();
  const setDifficultyMode = useGameStore((state) => state.setDifficultyMode);
  const resetStage = useGameStore((state) => state.resetStage);
  const resetDictionary = useDictionaryStore((state) => state.resetCollection);

  // 冒険の進行度を確認（ハイドレーションエラー回避のためuseEffectで取得推奨ですが、一旦シンプルに実装）
  const adventureIndex = useAdventureStore((state) => state.currentStageIndex);
  const [hasAdventureData, setHasAdventureData] = useState(false);

  useEffect(() => {
    setHasAdventureData(adventureIndex > 0);
  }, [adventureIndex]);

  const handleStart = (mode: DifficultyMode) => {
    setDifficultyMode(mode);
    resetStage();
    router.push("/play");
  };

  const handleStartAdventure = () => {
    router.push("/adventure");
  };

  const handleReset = useCallback(() => {
    if (
      confirm(
        "【警告】\nこれまでの収集データや冒険の記録がすべて消えます。\n本当にリセットしてよろしいですか？"
      )
    ) {
      localStorage.clear();
      resetDictionary();
      // 冒険データもリセット
      useAdventureStore.getState().resetProgress();
      window.location.reload();
    }
  }, [resetDictionary]);

  return (
    <main className="relative w-full h-dvh bg-[#f5f2eb] text-[#3d3330] overflow-hidden">
      {/* 背景 (固定配置) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <TitleBackground />
      </div>

      {/* スクロール可能エリア (z-10で手前に) */}
      <div className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden">
        {/* コンテンツラッパー */}
        <div className="min-h-full flex flex-col landscape:flex-row items-center justify-center p-4 py-8 md:py-12 gap-8 landscape:gap-16">
          {/* --- ロゴエリア --- */}
          <div className="flex flex-col items-center shrink-0 landscape:mb-0 animate-in fade-in zoom-in duration-700">
            <div className="text-center">
              <div className="inline-block border-4 border-[#3d3330] p-6 md:p-10 lg:p-12 mb-4 bg-white shadow-xl transform -rotate-2 relative transition-all hover:rotate-0 duration-500">
                {/* ハンコ */}
                <div className="absolute -top-3 -right-3 md:-top-5 md:-right-5 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-[#d94a38] rounded-full flex items-center justify-center text-white font-bold text-xs md:text-base lg:text-lg shadow-md border-2 border-white transform rotate-12">
                  文脈
                </div>

                {/* タイトル文字 */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-[0.2em] leading-tight text-center writing-vertical-rl text-upright mx-auto text-[#3d3330]">
                  漢字
                  <br />
                  合体
                </h1>
              </div>

              <p className="text-[#d94a38] font-bold tracking-widest text-sm md:text-lg lg:text-xl mb-2 drop-shadow-sm">
                ピースをつなぎ、言葉を紡ぐ
              </p>
              <p className="text-stone-400 tracking-[0.4em] text-xs md:text-sm font-bold uppercase">
                Kanji Merge Puzzle
              </p>
            </div>
          </div>

          {/* --- ボタンエリア --- */}
          <div className="flex flex-col items-center w-full max-w-sm md:max-w-md landscape:max-w-sm transition-all animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
            <div className="flex flex-col gap-3 md:gap-5 w-full">
              {/* 1. 初級モード */}
              <button
                onClick={() => handleStart("EASY")}
                className="group w-full py-3 md:py-5 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center gap-3 md:gap-5">
                  <span className="text-2xl md:text-3xl group-hover:rotate-12 transition-transform">
                    🌱
                  </span>
                  <div className="text-left">
                    <div className="font-bold font-serif text-lg md:text-xl tracking-widest">
                      初級
                    </div>
                    <div className="text-[10px] md:text-xs opacity-80 font-sans tracking-wider">
                      EASY MODE
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
              </button>

              {/* 2. 標準モード */}
              <button
                onClick={() => handleStart("NORMAL")}
                className="group w-full py-3 md:py-5 bg-[#3d3330] text-white rounded-xl shadow-md hover:bg-[#2a2320] transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center gap-3 md:gap-5">
                  <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">
                    🔥
                  </span>
                  <div className="text-left">
                    <div className="font-bold font-serif text-lg md:text-xl tracking-widest">
                      標準
                    </div>
                    <div className="text-[10px] md:text-xs opacity-80 font-sans tracking-wider">
                      NORMAL MODE
                    </div>
                  </div>
                </div>
              </button>

              {/* 3. 冒険モード（有効化・デザイン統一） */}
              <button
                onClick={handleStartAdventure}
                className="group w-full py-3 md:py-5 bg-[#d94a38] text-white rounded-xl shadow-md hover:bg-[#b93a28] transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center gap-3 md:gap-5">
                  <span className="text-2xl md:text-3xl group-hover:rotate-12 transition-transform">
                    🗺️
                  </span>
                  <div className="text-left">
                    <div className="font-bold font-serif text-lg md:text-xl tracking-widest flex items-center gap-2">
                      {hasAdventureData ? "旅のつづき" : "冒険の旅"}
                    </div>
                    <div className="text-[10px] md:text-xs opacity-80 font-sans tracking-wider">
                      ADVENTURE MODE
                    </div>
                  </div>
                </div>
                {/* 統一感を出すための背景エフェクト */}
                <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
              </button>

              {/* 4. 図鑑 */}
              <button
                onClick={() => router.push("/collection")}
                className="w-full py-2 md:py-3 mt-1 bg-[#fcfaf5] text-[#3d3330] border-2 border-[#3d3330]/10 rounded-xl shadow-sm hover:bg-white hover:border-[#3d3330]/30 transition-all font-bold font-serif tracking-widest text-sm md:text-base"
              >
                収集図鑑
              </button>
            </div>

            {/* --- 注釈エリア --- */}
            <div className="mt-6 landscape:mt-4 px-4 py-3 bg-[#3d3330]/5 rounded-lg border border-[#3d3330]/10 text-center w-full">
              <p className="text-[10px] text-stone-500 font-serif leading-relaxed">
                <span className="inline-block mb-1 font-bold text-[#3d3330]">
                  ※ 字体について
                </span>
                <br />
                視認性を優先し、一部のパーツを
                <br className="hidden sm:block" />
                <span className="border-b border-stone-400">一般的な字形</span>
                に置き換えています。
              </p>
            </div>

            {/* データ初期化 & バージョン */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                onClick={handleReset}
                className="text-[10px] text-stone-400 underline hover:text-[#d94a38] transition-colors font-serif"
              >
                全データを初期化する
              </button>
              <div className="text-[10px] text-stone-300 font-serif tracking-wider">
                Ver 1.2.0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フッターコピーライト */}
      <div className="absolute bottom-2 w-full text-center pointer-events-none">
        <span className="text-[10px] text-[#8c7a70]/30 font-serif">
          © 2025 Kanji Merge Project
        </span>
      </div>
    </main>
  );
}
