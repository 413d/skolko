import { createContext, useContext } from 'react';
import { valueOrThrow } from '@/shared/lib/validation';

export const THEME_STORAGE_KEY = 'ui-theme';

export const THEMES = ['dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME = 'dark' satisfies Theme;

export const THEME_COLORS: Record<Theme, string> = {
  dark: valueOrThrow(import.meta.env.VITE_THEME_COLOR_DARK, 'VITE_THEME_COLOR_DARK'),
  light: valueOrThrow(import.meta.env.VITE_THEME_COLOR_LIGHT, 'VITE_THEME_COLOR_LIGHT'),
};

const isTheme = (value: unknown): value is Theme => value === 'dark' || value === 'light';

const resolveDeviceTheme = (): Theme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return DEFAULT_THEME;

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return DEFAULT_THEME;
  }
};

export const resolveTheme = (storedTheme?: unknown): Theme => isTheme(storedTheme) ? storedTheme : resolveDeviceTheme();

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialThemeState: ThemeState = {
  theme: DEFAULT_THEME,
  setTheme: () => void 0,
};

export const ThemeProviderContext = createContext<ThemeState>(initialThemeState);

export const useTheme = () => useContext(ThemeProviderContext);
