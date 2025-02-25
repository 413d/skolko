import { appConfig } from '@/shared/config';
import { ConvertPage } from '@/pages/convert';
import './app.css';

export const App = () => (
  <>
    <header className="p-2 border-b border-secondary">
      <h1 className="text-xl font-mono">{ appConfig.title }</h1>
    </header>
    <main className="p-2">
      <ConvertPage />
    </main>
  </>
);
