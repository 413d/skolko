export const appConfig = {
  title : import.meta.env.VITE_APP_TITLE,
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
} as const;
