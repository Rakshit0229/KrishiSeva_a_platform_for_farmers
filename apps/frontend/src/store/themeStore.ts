import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

const STORAGE_KEY = 'krishiseva-theme';

export const useThemeStore = create<ThemeState>((set) => {
  const saved = localStorage.getItem(STORAGE_KEY) === 'true';
  if (saved) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    isDark: saved,
    toggle: () => {
      set((state) => {
        const next = !state.isDark;
        localStorage.setItem(STORAGE_KEY, String(next));
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDark: next };
      });
    },
  };
});
