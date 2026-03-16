import './app.css';

import { appConfig } from '@/shared/config';
import { Button, ErrorBoundary, Toaster } from '@/shared/ui';
import { ConvertPage } from '@/pages/convert';

import { ThemeToggle, useTheme } from '@/features/theming';

import { useMobileViewport } from './hooks/use-mobile-viewport';
import { Providers } from './providers';

import logo from '/skolko.svg';

const AppContent = () => {
  const { theme } = useTheme();

  useMobileViewport();

  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <header className="app-header border-b border-secondary/80 bg-background/90 px-2 py-2 sm:px-3">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
          <a href={appConfig.baseUrl} title={appConfig.title} className="shrink-0 touch-callout-none">
            <img className="w-9 dark:invert sm:w-10" src={logo} alt={appConfig.title} />
          </a>

          <h1 className="min-w-0 flex-1 truncate text-center text-lg font-mono tracking-[0.2em] sm:text-2xl">
            {appConfig.title}
          </h1>

          <ErrorBoundary fallback={' '}>
            <ThemeToggle />
          </ErrorBoundary>
        </div>
      </header>
      <main id="main-content" className="app-main px-2 py-4 sm:px-3">
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
      <Toaster theme={theme} />
    </div>
  );
};

export const App = () => (
  <Providers>
    <AppContent />
  </Providers>
);
