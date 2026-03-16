import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  combinePresetAndAppleSplashScreens,
  defineConfig,
} from '@vite-pwa/assets-generator/config';
import { loadEnv } from 'vite';

const root = process.cwd();

const env = loadEnv(process.env.MODE ?? 'production', root, '');

const themeDarkColor = env.VITE_THEME_COLOR_DARK;
const themeLightColor = env.VITE_THEME_COLOR_LIGHT;
if (!themeDarkColor || !themeLightColor) {
  throw new Error('Both VITE_THEME_COLOR_DARK and VITE_THEME_COLOR_LIGHT environment variables must be defined');
}

const pwaAssetsDir = 'pwa';
const faviconEntries: Array<[number, string]> = [[48, 'favicon.ico']];

const pwaPreset = {
  transparent: {
    favicons: faviconEntries,
    padding: 0,
    resizeOptions: {
      background: themeLightColor,
      fit: 'contain' as const,
    },
    sizes: [64, 192, 512],
  },
  maskable: {
    padding: 0.18,
    resizeOptions: {
      background: themeLightColor,
      fit: 'contain' as const,
    },
    sizes: [192, 512],
  },
  apple: {
    padding: 0.18,
    resizeOptions: {
      background: themeLightColor,
      fit: 'contain' as const,
    },
    sizes: [180],
  },
  assetName: (type: 'transparent' | 'maskable' | 'apple', size: { width: number; height: number }) => {
    const width = String(size.width);
    const height = String(size.height);

    if (type === 'transparent') return `${pwaAssetsDir}/pwa-${width}x${height}.png`;
    if (type === 'maskable') return `${pwaAssetsDir}/pwa-maskable-${width}x${height}.png`;
    return `${pwaAssetsDir}/apple-touch-icon.png`;
  },
};

const iosStartupDevices = [
  'iPhone 15 Plus',
  'iPhone 14',
  'iPhone 13 mini',
  'iPhone XR',
  'iPhone SE 4.7"',
  'iPad Pro 12.9"',
  'iPad Pro 11"',
] as const;

export default defineConfig({
  headLinkOptions: {
    basePath: '/',
  },
  images: ['public/skolko.svg'],
  preset: combinePresetAndAppleSplashScreens(
    pwaPreset,
    {
      darkImageResolver: async () => readFile(resolve(root, 'public/skolko-light.svg')),
      padding: 0.22,
      resizeOptions: {
        background: themeLightColor,
        fit: 'contain' as const,
      },
      darkResizeOptions: {
        background: themeDarkColor,
        fit: 'contain' as const,
      },
    },
    [...iosStartupDevices],
  ),
});
