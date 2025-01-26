import { appConfig } from '@/shared/config';

import './app.css';

export const App = () => (
  <main>
    <h1 className="text-3xl font-bold underline">{ appConfig.title }</h1>
  </main>
);
