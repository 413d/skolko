import { valueOrDefault } from '@/shared/lib/validation';

export const appConfig = {
  title : valueOrDefault(import.meta.env.VITE_APP_TITLE, 'Skolko'),
  mode: import.meta.env.MODE as 'development' | 'production',
  isProd: import.meta.env.PROD,
  baseUrl: import.meta.env.BASE_URL,
} as const;
