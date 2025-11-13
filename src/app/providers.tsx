import type { FC, ReactNode } from 'react';
import { ThemeProvider } from '@/features/theming';

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <ThemeProvider defaultTheme="dark">
    {children}
  </ThemeProvider>
);
