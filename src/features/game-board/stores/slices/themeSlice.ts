import { StateCreator } from 'zustand';
import { ThemeId } from '../../constants/themes';

export interface ThemeSlice {
  currentTheme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const createThemeSlice: StateCreator<ThemeSlice> = (set) => ({
  currentTheme: 'paper', // 初期値は「和紙」
  setTheme: (id) => set({ currentTheme: id }),
});