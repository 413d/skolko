import { Moon, Sun } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useTheme } from '../model';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const label = `Theme: ${theme}. Switch to ${nextTheme}.`;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
};
