import { Moon, Sun } from 'lucide-react';

import { Button } from '@/shared/ui';

import { useTheme } from '../model';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const isDarkTheme = theme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
      onDoubleClick={() => setTheme('system')}
    >
      {isDarkTheme ? <Sun /> : <Moon />}
    </Button>
  );
};
