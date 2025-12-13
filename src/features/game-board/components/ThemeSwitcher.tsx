"use client";

import { useGameStore } from "../stores/store";
import { THEMES, ThemeId } from "../constants/themes";
import { motion } from "framer-motion";

export function ThemeSwitcher() {
  const currentTheme = useGameStore((state) => state.currentTheme);
  const setTheme = useGameStore((state) => state.setTheme);
  const theme = THEMES[currentTheme];

  const handleToggle = () => {
    const ids = Object.keys(THEMES) as ThemeId[];
    const currentIndex = ids.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % ids.length;
    setTheme(ids[nextIndex]);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all
        hover:scale-105 active:scale-95 backdrop-blur-md
        ${theme.colors.partBg} ${theme.colors.partBorder} ${theme.colors.text}
      `}
    >
      <span className="text-lg">🎨</span>
      <span className="text-xs font-bold">{theme.name}</span>
    </button>
  );
}
