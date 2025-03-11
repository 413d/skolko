/* eslint-disable @typescript-eslint/consistent-type-definitions */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_EXCHANGE_RATES_API_URL: string
  readonly VITE_EXCHANGE_RATES_CACHE_TTL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
