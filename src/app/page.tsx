"use client";

import { TitleBackground } from "../components/ui/TitleBackground";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/features/game-board/stores/store";
import { useDictionaryStore } from "@/features/dictionary/stores/dictionarySlice";
import { useCallback, useEffect, useState } from "react";
import { useAdventureStore } from "@/features/adventure/stores/adventureStore";

export default function Home() {
  const router = useRouter();
  const setDifficultyMode = useGameStore((state) => state.setDifficultyMode);
  const resetStage = useGameStore((state) => state.resetStage);
  const resetDictionary = useDictionaryStore((state) => state.resetCollection);

  const adventureIndex = useAdventureStore((state) => state.currentStageIndex);
  const [hasAdventureData, setHasAdventureData] = useState(false);

  useEffect(() => {
    setHasAdventureData(adventureIndex > 0);
  }, [adventureIndex]);

  // メイン：強制的にNORMALモードで開始
  const handleStartMain = () => {
    setDifficultyMode("NORMAL");
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
      useAdventureStore.getState().resetProgress();
      window.location.reload();
    }
  }, [resetDictionary]);

  return (
    <main className="relative w-full h-dvh bg-[#f5f2eb] text-[#3d3330] overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <TitleBackground />
      </div>

      {/* スクロールエリア */}
      <div className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden">
        <div className="min-h-full flex flex-col landscape:flex-row items-center justify-center p-4 py-8 md:py-12 gap-8 landscape:gap-16">
          {/* --- ロゴエリア --- */}
          <div className="flex flex-col items-center shrink-0 landscape:mb-0 animate-in fade-in zoom-in duration-700">
            <div className="text-center">
              <div className="inline-block border-4 border-[#3d3330] p-6 md:p-10 lg:p-12 mb-4 bg-white shadow-xl transform -rotate-2 relative transition-all hover:rotate-0 duration-500">
                <div className="absolute -top-3 -right-3 md:-top-5 md:-right-5 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-[#d94a38] rounded-full flex items-center justify-center text-white font-bold text-xs md:text-base lg:text-lg shadow-md border-2 border-white transform rotate-12">
                  文脈
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-[0.2em] leading-tight text-center writing-vertical-rl text-upright mx-auto text-[#3d3330]">
                  漢字
                  <br />
                  合体
                </h1>
              </div>

              <p className="text-[#d94a38] font-bold tracking-widest text-sm md:text-lg lg:text-xl mb-2 drop-shadow-sm">
                ピースをつなぎ、言葉を紡ぐ
              </p>
            </div>
          </div>

          {/* --- ボタンエリア --- */}
          <div className="flex flex-col items-center w-full max-w-sm md:max-w-md landscape:max-w-sm transition-all animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
            {/* 1. メインブロック：漢字合体 (KANJI MERGE) */}
            <div className="w-full mb-6">
              <button
                onClick={handleStartMain}
                className="group w-full py-6 md:py-8 bg-[#3d3330] text-white rounded-xl shadow-lg hover:bg-[#2a2320] transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden flex flex-col items-center justify-center gap-2 border-b-4 border-[#1a1513]"
              >
                <div className="relative z-10 flex items-center gap-3">
                  {/* アイコンはパズルっぽさを出すか、勢いの火のままでもOK。ここでは「スタート」の象徴として火を維持します */}
                  <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">
                    🔥
                  </span>
                  <span className="font-bold font-serif text-2xl md:text-3xl tracking-[0.2em] mr-[-0.2em]">
                    漢字合体
                  </span>
                </div>
                <span className="relative z-10 text-[10px] md:text-xs opacity-60 font-sans tracking-widest uppercase">
                  KANJI MERGE
                </span>

                {/* エフェクト */}
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
              </button>
            </div>

            {/* 2. サブブロック：2カラム */}
            <div className="w-full grid grid-cols-2 gap-3 md:gap-4">
              {/* 冒険の旅 */}
              <button
                onClick={handleStartAdventure}
                className="group relative overflow-hidden bg-[#d94a38] text-white py-4 rounded-xl shadow-md hover:bg-[#b93a28] transition-all transform hover:scale-[1.02] active:scale-[0.98] border-b-4 border-[#a03020]"
              >
                <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                  <span className="text-2xl mb-1 group-hover:rotate-12 transition-transform">
                    🗺️
                  </span>
                  <span className="font-bold font-serif text-sm md:text-base tracking-widest">
                    {hasAdventureData ? "旅の続き" : "冒険の旅"}
                  </span>
                  <span className="text-[9px] opacity-80 uppercase tracking-wider">
                    Adventure
                  </span>
                </div>
                <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-white/10 rounded-full blur-xl" />
              </button>

              {/* 収集図鑑 */}
              <button
                onClick={() => router.push("/collection")}
                className="group relative overflow-hidden bg-[#fcfaf5] text-[#3d3330] py-4 rounded-xl shadow-sm border-2 border-[#3d3330]/10 hover:border-[#3d3330]/30 hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    📜
                  </span>
                  <span className="font-bold font-serif text-sm md:text-base tracking-widest">
                    収集図鑑
                  </span>
                  <span className="text-[9px] opacity-60 uppercase tracking-wider">
                    Collection
                  </span>
                </div>
              </button>
            </div>

            {/* --- フッター要素 --- */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="px-4 py-2 bg-[#3d3330]/5 rounded text-center">
                <p className="text-[10px] text-stone-500 font-serif">
                  ※ 一部のパーツは視認性のため
                  <br />
                  一般的な字形に調整しています
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleReset}
                  className="text-[10px] text-stone-400 underline hover:text-[#d94a38] transition-colors font-serif"
                >
                  データ初期化
                </button>
                <span className="text-[10px] text-stone-300">|</span>
                <span className="text-[10px] text-stone-300 font-serif">
                  Ver 1.5.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 w-full text-center pointer-events-none">
        <span className="text-[10px] text-[#8c7a70]/30 font-serif">
          © 2025 Kanji Merge Project
        </span>
      </div>
    </main>
  );
}
