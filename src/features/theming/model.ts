import { createContext, useContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialThemeState: ThemeState = {
  theme: 'system',
  setTheme: () => void 0,
};

export const ThemeProviderContext = createContext<ThemeState>(initialThemeState);

export const useTheme = () => useContext(ThemeProviderContext);
