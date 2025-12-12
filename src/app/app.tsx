import './app.css';

import { lazy, Suspense } from 'react';

import { appConfig } from '@/shared/config';
import { Button, ErrorBoundary, Toaster } from '@/shared/ui';

import { ThemeToggle, useTheme } from '@/features/theming';

import { Providers } from './providers';

import logo from '/skolko.svg';

const ConvertPage = lazy(() => import('@/pages/convert/ui/convert-page').then(m => ({ default: m.ConvertPage })));

const AppContent = () => {
  const { theme } = useTheme();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <header className="p-2 flex justify-between items-center border-b border-secondary">
        <a href={appConfig.baseUrl} title={appConfig.title}>
          <img className="w-10 dark:invert" src={logo} alt={appConfig.title} />
        </a>

        <h1 className="text-2xl font-mono tracking-wider">{ appConfig.title }</h1>

        <ErrorBoundary fallback={' '}>
          <ThemeToggle />
        </ErrorBoundary>
      </header>
      <main id="main-content" className="p-2">
        <ErrorBoundary description={appConfig.isProd ? (
          <Button
            className="cursor-pointer"
            size="lg"
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
          >
          Retry
          </Button>
        ) : undefined}>
          <Suspense>
            <ConvertPage />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Toaster theme={theme} />
    </>
  );
};

export const App = () => (
  <Providers>
    <AppContent />
  </Providers>
);
