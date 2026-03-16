import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getStorageData, setStorageData } from '@/shared/lib/storage';
import {
  ThemeProviderContext,
  resolveTheme,
  THEMES,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  type Theme,
} from '../model';

type Props = {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: Props) => {
  const [theme, setThemeState] = useState<Theme>(
    () => resolveTheme(getStorageData(THEME_STORAGE_KEY)),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    root.classList.remove(...THEMES);
    root.classList.add(theme);
    root.dataset.theme = theme;
    window.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  }, [theme]);

  const state = useMemo(() => ({
    theme,
    setTheme: (nextTheme: Theme) => {
      setStorageData(THEME_STORAGE_KEY, nextTheme);
      setThemeState(nextTheme);
    },
  }), [theme]);

  return (
    <ThemeProviderContext.Provider value={state}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
