/**
 * prepare-seo-page.mjs
 *
 * Post-build step that writes the SEO artifacts into the Vite output:
 * `/popular-currency-pairs/index.html`, `robots.txt`, `llms.txt`, and — for
 * production builds only — `sitemap.xml`. Runs after `vite build` and can be
 * invoked as a CLI (`node scripts/prepare-seo-page.mjs`) or imported by tests.
 */

import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateLandingPageHtml } from './generate-html.mjs';
import { generateRobotsTxt } from './generate-robots.mjs';
import { generateLlmsTxt } from './generate-llms.mjs';
import { generateSitemapXml } from './generate-sitemap.mjs';

export const DEFAULT_SITE_ORIGIN = 'https://skolko.lx.deno.net';
export const LANDING_DIRECTORY = 'popular-currency-pairs';

/** Normalizes any base path shape into `/`, `/repo/`, etc. */
function normalizeBasePath(basePath) {
  const segment = String(basePath ?? '').trim().replace(/^\/+|\/+$/g, '');
  return segment ? `/${segment}/` : '/';
}

/**
 * Resolves the SEO build configuration from environment variables.
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ origin: string, basePath: string, isStaging: boolean }}
 */
export function resolveSeoConfig(env = process.env) {
  const origin = env.SEO_SITE_ORIGIN || DEFAULT_SITE_ORIGIN;
  const rawBase = env.BASE_URL || env.REPO_NAME || '/';
  const basePath = normalizeBasePath(rawBase);
  const isStaging = env.STAGING === 'true' || (Boolean(env.BASE_URL) && env.BASE_URL !== '/');

  return { origin, basePath, isStaging };
}

/**
 * Writes the generated SEO artifacts into the build output directory.
 *
 * @param {{ targetDir?: string, env?: NodeJS.ProcessEnv }} [options]
 * @param {string} [options.targetDir] Build output directory. Defaults to `dist`
 *   in the current working directory.
 * @param {NodeJS.ProcessEnv} [options.env] Environment used to resolve origin,
 *   base path, and staging mode. Defaults to `process.env`.
 * @returns {Promise<{ origin: string, basePath: string, isStaging: boolean, targetDir: string, files: string[] }>}
 */
export async function prepareSeoFiles({ targetDir = path.resolve(process.cwd(), 'dist'), env = process.env } = {}) {
  const { origin, basePath, isStaging } = resolveSeoConfig(env);

  await mkdir(targetDir, { recursive: true });

  const files = [];

  const landingFile = path.join(targetDir, LANDING_DIRECTORY, 'index.html');
  await mkdir(path.dirname(landingFile), { recursive: true });
  await writeFile(landingFile, generateLandingPageHtml({ origin, basePath, isStaging }), 'utf8');
  files.push(landingFile);

  const robotsFile = path.join(targetDir, 'robots.txt');
  await writeFile(robotsFile, generateRobotsTxt(origin, isStaging), 'utf8');
  files.push(robotsFile);

  const llmsFile = path.join(targetDir, 'llms.txt');
  await writeFile(llmsFile, generateLlmsTxt(origin, basePath), 'utf8');
  files.push(llmsFile);

  const sitemapFile = path.join(targetDir, 'sitemap.xml');
  if (isStaging) {
    await rm(sitemapFile, { force: true });
  } else {
    await writeFile(sitemapFile, generateSitemapXml(origin), 'utf8');
    files.push(sitemapFile);
  }

  return { origin, basePath, isStaging, targetDir, files };
}

const isDirectRun = process.argv[1] !== undefined
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const result = await prepareSeoFiles();
  const mode = result.isStaging ? 'staging' : 'production';
  const relativeFiles = result.files.map(file => path.relative(process.cwd(), file));
  console.log(`SEO artifacts (${mode}, base ${result.basePath}): ${relativeFiles.join(', ')}`);
  if (result.isStaging) {
    console.log('Staging build: sitemap.xml removed from output.');
  }
}
