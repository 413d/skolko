import { appConfig } from '@/shared/config';
import { Alert, AlertDescription, AlertTitle, Button, ErrorBoundary } from '@/shared/ui';
import { ConvertPage } from '@/pages/convert';
import { ThemeProvider, ThemeToggle } from '@/features/theming';
import './app.css';

export const App = () => (
  <ThemeProvider defaultTheme="dark">
    <header className="p-2 border-b border-secondary flex justify-between items-center">
      <h1 className="text-xl font-mono">{ appConfig.title }</h1>
      <ErrorBoundary fallback={' '}>
        <ThemeToggle />
      </ErrorBoundary>
    </header>
    <main className="p-2">
      <ErrorBoundary
        fallback={appConfig.isProd ? (
          <Alert variant="default" className="space-y-2">
            <AlertTitle>Failed to load currency converter</AlertTitle>
            <AlertDescription>
              <Button
                className="cursor-pointer"
                size="lg"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : undefined}
      >
        <ConvertPage />
      </ErrorBoundary>
    </main>
  </ThemeProvider>
);
