import './app.css';

import { appConfig } from '@/shared/config';
import { Button, ErrorBoundary } from '@/shared/ui';

import { ThemeProvider, ThemeToggle } from '@/features/theming';
import { ConvertPage } from '@/pages/convert';

export const App = () => (
  <ThemeProvider defaultTheme="dark">
    <header className="p-2 flex justify-between items-center border-b border-secondary">
      <a href="/" title={appConfig.title}>
        <img className="w-10 dark:invert" src="/skolko.svg" alt={appConfig.title} />
      </a>

      <h1 className="text-2xl font-mono tracking-wider">{ appConfig.title }</h1>

      <ErrorBoundary fallback={' '}>
        <ThemeToggle />
      </ErrorBoundary>
    </header>
    <main className="p-2">
      <ErrorBoundary description={appConfig.isProd ? (
        <Button
          className="cursor-pointer"
          size="lg"
          onClick={() => typeof window !== 'undefined' && window.location.reload()}
        >
          Retry
        </Button>
      ) : undefined}>
        <ConvertPage />
      </ErrorBoundary>
    </main>
  </ThemeProvider>
);
