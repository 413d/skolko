import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';

const publicDir = join(process.cwd(), 'public');
const splashDir = join(publicDir, 'splash');
const pwaDir = join(publicDir, 'pwa');

const keptStartupSuffixes = new Set([
  '1290x2796',
  '1170x2532',
  '1125x2436',
  '828x1792',
  '750x1334',
  '2048x2732',
  '1668x2388',
]);

const files = await readdir(publicDir);

await Promise.all([
  mkdir(splashDir, { recursive: true }),
  mkdir(pwaDir, { recursive: true }),
]);

await Promise.all(files.map(async (fileName) => {
  if (fileName === 'apple-touch-icon-180x180.png' || fileName === 'maskable-icon-512x512.png') {
    await rm(join(publicDir, fileName), { force: true });
    return;
  }

  if (fileName === 'apple-touch-icon.png' || fileName.startsWith('pwa-')) {
    await rename(join(publicDir, fileName), join(pwaDir, fileName));
    return;
  }

  if (!fileName.startsWith('apple-splash-') || !fileName.endsWith('.png')) return;

  const suffix = fileName.replace(/^apple-splash-(portrait|landscape)-(light|dark)-/, '').replace(/\.png$/, '');
  if (!keptStartupSuffixes.has(suffix)) {
    await rm(join(publicDir, fileName), { force: true });
    return;
  }

  await rename(join(publicDir, fileName), join(splashDir, fileName));
}));

const splashFiles = await readdir(splashDir);

await Promise.all(splashFiles.map(async (fileName) => {
  if (!fileName.startsWith('apple-splash-') || !fileName.endsWith('.png')) return;

  const suffix = fileName.replace(/^apple-splash-(portrait|landscape)-(light|dark)-/, '').replace(/\.png$/, '');
  if (keptStartupSuffixes.has(suffix)) return;

  await rm(join(splashDir, fileName), { force: true });
}));
