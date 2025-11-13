import './app.css';

import { appConfig } from '@/shared/config';
import { Button, ErrorBoundary, Toaster } from '@/shared/ui';

import { ThemeToggle, useTheme } from '@/features/theming';
import { ConvertPage } from '@/pages/convert';

import { Providers } from './providers';

import logo from '/skolko.svg';

export const App = () => {
  const { theme } = useTheme();

  return (
    <Providers>
      <header className="p-2 flex justify-between items-center border-b border-secondary">
        <a href={appConfig.baseUrl} title={appConfig.title}>
          <img className="w-10 dark:invert" src={logo} alt={appConfig.title} />
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
      <Toaster theme={theme} />
    </Providers>
  );
};
