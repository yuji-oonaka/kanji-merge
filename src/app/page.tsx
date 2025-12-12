import { TitleBackground } from "../components/ui/TitleBackground";

// 修正: next/link がプレビュー環境でエラーになるため、標準の a タグを使用
// import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#f5f2eb] text-[#3d3330]">
      <div className="mb-12 text-center">
        <div className="inline-block border-4 border-[#3d3330] p-6 mb-4 bg-white shadow-sm">
          <h1 className="text-6xl md:text-7xl font-serif font-bold tracking-[0.2em] leading-tight text-center writing-vertical-rl text-upright mx-auto">
            漢字
            <br />
            合体
          </h1>
        </div>
        <p className="text-stone-500 tracking-[0.5em] text-xs font-bold mt-6 uppercase">
          Kanji Merge
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs z-10">
        {/* 通常プレイ (Play) */}
        <a
          href="/play"
          className="w-full py-4 bg-[#3d3330] text-white rounded-lg shadow-md hover:bg-[#2a2320] transition-all transform hover:scale-[1.02] active:scale-[0.98] text-center font-bold text-xl font-serif tracking-widest flex items-center justify-center gap-2 no-underline"
        >
          <span>いざ、開始</span>
        </a>

        {/* 冒険モード (Adventure) */}
        <a
          href="/adventure"
          className="group w-full py-4 bg-[#d94a38] text-white rounded-lg shadow-md hover:bg-[#b93a28] transition-all transform hover:scale-[1.02] active:scale-[0.98] text-center relative overflow-hidden font-serif block no-underline"
        >
          <span className="relative z-10 font-bold text-xl tracking-widest flex items-center justify-center gap-2">
            <span>冒険の旅へ</span>
            <span className="text-sm opacity-80">New!</span>
          </span>
        </a>

        {/* 図鑑 (Collection) */}
        <a
          href="/collection"
          className="w-full py-3 bg-[#fcfaf5] text-[#3d3330] border-2 border-[#3d3330]/20 rounded-lg shadow-sm hover:bg-white hover:border-[#3d3330]/40 transition-all text-center font-bold text-lg font-serif tracking-widest block no-underline"
        >
          収集図鑑
        </a>
      </div>

      {/* 背景装飾 */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute top-10 left-10 text-9xl font-serif">漢</div>
        <div className="absolute bottom-10 right-10 text-9xl font-serif">
          字
        </div>
      </div>

      <div className="mt-16 text-xs text-stone-400 font-serif tracking-wider z-10">
        © 2025 Kanji Merge Project
      </div>
    </main>
  );
}
