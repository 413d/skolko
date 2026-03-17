import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const normalizeBasePath = (basePath?: string) => {
  if (!basePath) return '/';

  const normalized = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const APP_NAME = env.VITE_APP_TITLE || 'Skolko';
  const BASE_PATH = normalizeBasePath(env.BASE_URL || env.REPO_NAME);
  const APP_THEME_COLOR = env.VITE_THEME_COLOR_DARK;
  const APP_BACKGROUND_COLOR = env.VITE_THEME_COLOR_LIGHT;

  return {
    base: BASE_PATH,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          id: BASE_PATH,
          name: `${APP_NAME}: Currency Converter`,
          short_name: APP_NAME,
          description: 'Real-time crypto and fiat currency converter. Fast, offline-capable, and PWA-ready.',
          start_url: BASE_PATH,
          scope: BASE_PATH,
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          orientation: 'portrait-primary',
          theme_color: APP_THEME_COLOR,
          background_color: APP_BACKGROUND_COLOR,
          categories: ['finance', 'utilities', 'productivity'],
          icons: [
            {
              src: 'pwa/pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa/pwa-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'pwa/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Open converter',
              short_name: 'Convert',
              description: 'Launch the currency converter',
              url: BASE_PATH,
              icons: [
                {
                  src: 'pwa/pwa-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
              ],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          globIgnores: ['**/pwa/**', '**/splash/**'],
          runtimeCaching: [
            {
            // Cache exchange rates API requests with Network First strategy
            // Falls back to cache when offline
              urlPattern: /\/exchange-rates/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'rates-api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: env.SW_DEV === 'true',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
