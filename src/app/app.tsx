import { appConfig } from '@/shared/config';
import { ConvertPage } from '@/pages/convert';
import { ThemeProvider, ThemeToggle } from '@/features/theming';
import './app.css';

export const App = () => (
  <ThemeProvider defaultTheme="dark">
    <header className="p-2 border-b border-secondary flex justify-between items-center">
      <h1 className="text-xl font-mono">{ appConfig.title }</h1>
      <ThemeToggle />
    </header>
    <main className="p-2">
      <ConvertPage />
    </main>
  </ThemeProvider>
);
