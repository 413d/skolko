/**
 * prepare-staging-guard.mjs
 *
 * Post-build step for the light build (`npm run build:light`), which is what
 * staging deployments such as GitHub Pages use. It deliberately does NOT
 * generate the SEO landing page, sitemap, or llms.txt — those belong to the
 * production build (`npm run build`) deployed to the canonical origin.
 *
 * What it does instead is keep the staging deployment out of search indexes:
 * it injects a `noindex, nofollow` robots meta tag into `dist/index.html` and
 * writes a `robots.txt` that disallows every crawler.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateRobotsTxt } from './generate-robots.mjs';

export const NOINDEX_META = '<meta name="robots" content="noindex, nofollow" />';

const HEAD_CLOSE = '</head>';
const ROBOTS_META_PATTERN = /<meta\s+name=["']robots["']/i;

/**
 * Injects the staging robots meta tag before `</head>`.
 *
 * Idempotent: a document that already declares a robots meta tag is returned
 * unchanged so the step can be re-run safely.
 *
 * @param {string} html
 * @returns {string}
 */
export function injectNoindexMeta(html) {
  if (ROBOTS_META_PATTERN.test(html)) {
    return html;
  }

  const headEnd = html.indexOf(HEAD_CLOSE);
  if (headEnd === -1) {
    throw new Error('Cannot inject the robots meta tag: no closing </head> found in index.html');
  }

  return `${html.slice(0, headEnd)}    ${NOINDEX_META}\n  ${html.slice(headEnd)}`;
}

/**
 * Applies the staging guards to an already built output directory.
 *
 * @param {{ targetDir?: string }} [options]
 * @param {string} [options.targetDir] Build output directory. Defaults to `dist`
 *   in the current working directory.
 * @returns {Promise<{ targetDir: string, files: string[] }>}
 */
export async function applyStagingGuards({ targetDir = path.resolve(process.cwd(), 'dist') } = {}) {
  const indexFile = path.join(targetDir, 'index.html');

  let html;
  try {
    html = await readFile(indexFile, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Cannot apply staging guards: ${indexFile} does not exist. Run "vite build" first.`);
    }
    throw error;
  }

  const guardedHtml = injectNoindexMeta(html);
  if (guardedHtml !== html) {
    await writeFile(indexFile, guardedHtml, 'utf8');
  }

  const robotsFile = path.join(targetDir, 'robots.txt');
  await writeFile(robotsFile, generateRobotsTxt('', true), 'utf8');

  return { targetDir, files: [indexFile, robotsFile] };
}

const isDirectRun = process.argv[1] !== undefined
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const result = await applyStagingGuards();
  const relativeFiles = result.files.map(file => path.relative(process.cwd(), file));
  console.log(`Staging guards applied (noindex, nofollow): ${relativeFiles.join(', ')}`);
}
