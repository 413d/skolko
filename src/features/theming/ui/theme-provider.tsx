import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { getStorageData, setStorageData } from '@/shared/lib/storage';

import { ThemeProviderContext, type Theme } from '../model';

type Props = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: Props) => {
  const [theme, setTheme] = useState<Theme>(
    () => getStorageData(storageKey) ?? defaultTheme,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const state = useMemo(() => ({
    theme,
    setTheme: (theme: Theme) => {
      setStorageData(storageKey, theme);
      setTheme(theme);
    },
  }), [theme, storageKey]);

  return (
    <ThemeProviderContext.Provider {...props} value={state}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
