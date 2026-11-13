import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { constants } from 'node:fs';
import { access, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_SITE_ORIGIN,
  prepareSeoFiles,
  resolveSeoConfig,
} from '../scripts/prepare-seo-page.mjs';

const execFileAsync = promisify(execFile);
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const PREPARE_SCRIPT = path.join(REPO_ROOT, 'scripts', 'prepare-seo-page.mjs');
const ORIGIN = 'https://skolko.example.com';

/** Environment without deployment variables so builds stay in production mode. */
function productionEnv(overrides = {}) {
  const env = { ...process.env };
  delete env.BASE_URL;
  delete env.REPO_NAME;
  delete env.STAGING;
  delete env.SEO_SITE_ORIGIN;
  return { ...env, ...overrides };
}

async function makeTempDir(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'skolko-seo-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// resolveSeoConfig — env-driven origin, base path, and staging detection
// ============================================================================

test('prepare: defaults to production origin, root base path, and production mode', () => {
  const config = resolveSeoConfig({});
  assert.deepStrictEqual(config, {
    origin: DEFAULT_SITE_ORIGIN,
    basePath: '/',
    isStaging: false,
  });
});

test('prepare: SEO_SITE_ORIGIN overrides the production origin', () => {
  const config = resolveSeoConfig({ SEO_SITE_ORIGIN: ORIGIN });
  assert.strictEqual(config.origin, ORIGIN);
});

test('prepare: BASE_URL repository subpath enables staging and normalizes the base path', () => {
  for (const rawBase of ['/skolko/', 'skolko', '/skolko']) {
    const config = resolveSeoConfig({ BASE_URL: rawBase });
    assert.strictEqual(config.basePath, '/skolko/', `expected normalized base path for ${rawBase}`);
    assert.strictEqual(config.isStaging, true, `expected staging mode for ${rawBase}`);
  }
});

test('prepare: REPO_NAME alone supplies the base path without enabling staging', () => {
  const config = resolveSeoConfig({ REPO_NAME: 'skolko' });
  assert.strictEqual(config.basePath, '/skolko/');
  assert.strictEqual(config.isStaging, false);
});

test('prepare: BASE_URL=/ is production and STAGING=true forces staging', () => {
  assert.strictEqual(resolveSeoConfig({ BASE_URL: '/' }).isStaging, false);
  assert.strictEqual(resolveSeoConfig({ STAGING: 'true' }).isStaging, true);
});

// ============================================================================
// prepareSeoFiles — production and staging artifact sets
// ============================================================================

test('prepare: production run writes landing page, robots.txt, llms.txt, and sitemap.xml', async (t) => {
  const targetDir = await makeTempDir(t);
  const result = await prepareSeoFiles({ targetDir, env: { SEO_SITE_ORIGIN: ORIGIN } });

  assert.strictEqual(result.isStaging, false);
  assert.strictEqual(result.basePath, '/');

  const landingFile = path.join(targetDir, 'popular-currency-pairs', 'index.html');
  const robotsFile = path.join(targetDir, 'robots.txt');
  const llmsFile = path.join(targetDir, 'llms.txt');
  const sitemapFile = path.join(targetDir, 'sitemap.xml');

  for (const file of [landingFile, robotsFile, llmsFile, sitemapFile]) {
    const stats = await stat(file);
    assert.ok(stats.isFile(), `expected ${file} to be a regular file`);
    assert.ok(stats.size > 0, `expected ${file} to be non-empty`);
    await access(file, constants.R_OK);
  }

  const html = await readFile(landingFile, 'utf8');
  assert.ok(html.startsWith('<!DOCTYPE html>'), 'expected a standalone HTML document');
  assert.ok(html.includes('<meta name="robots" content="index, follow" />'), 'production must be indexable');
  assert.ok(!html.includes('noindex'), 'production must not contain noindex');
  assert.ok(
    html.includes(`<link rel="canonical" href="${ORIGIN}/popular-currency-pairs/" />`),
    'expected canonical built from the configured production origin',
  );
  assert.ok(html.includes('href="/?c=USD:1&amp;c=EUR"'), 'expected app links on the root base path');

  const robots = await readFile(robotsFile, 'utf8');
  assert.ok(robots.includes('User-agent: Googlebot'), 'expected Googlebot allow block');
  assert.ok(robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`), 'expected production sitemap directive');
  assert.ok(!robots.includes('Disallow:'), 'production robots.txt must not block crawlers');

  const llms = await readFile(llmsFile, 'utf8');
  assert.ok(llms.startsWith('# Skolko'), 'expected llms.txt header');
  assert.ok(llms.includes(`${ORIGIN}/popular-currency-pairs/`), 'expected landing page link in llms.txt');

  const sitemap = await readFile(sitemapFile, 'utf8');
  assert.ok(sitemap.includes(`<loc>${ORIGIN}/popular-currency-pairs/</loc>`), 'expected landing page in sitemap');
});

test('prepare: staging run writes noindex landing page, blocking robots.txt, and no sitemap.xml', async (t) => {
  const targetDir = await makeTempDir(t);
  const staleSitemap = path.join(targetDir, 'sitemap.xml');
  await writeFile(staleSitemap, '<urlset />', 'utf8');

  const result = await prepareSeoFiles({
    targetDir,
    env: { BASE_URL: '/skolko/', SEO_SITE_ORIGIN: ORIGIN },
  });

  assert.strictEqual(result.isStaging, true);
  assert.strictEqual(result.basePath, '/skolko/');

  const html = await readFile(path.join(targetDir, 'popular-currency-pairs', 'index.html'), 'utf8');
  assert.ok(html.includes('<meta name="robots" content="noindex, nofollow" />'), 'staging must be noindex');
  assert.ok(html.includes('href="/skolko/?c=USD:1&amp;c=EUR"'), 'expected app links under the staging base path');
  assert.ok(
    html.includes(`<link rel="canonical" href="${ORIGIN}/popular-currency-pairs/" />`),
    'canonical must stay on the production origin in staging',
  );

  const robots = await readFile(path.join(targetDir, 'robots.txt'), 'utf8');
  assert.ok(robots.includes('Disallow: /'), 'staging robots.txt must block all crawlers');
  assert.ok(!robots.toLowerCase().includes('sitemap:'), 'staging robots.txt must not reference a sitemap');

  const llms = await readFile(path.join(targetDir, 'llms.txt'), 'utf8');
  assert.ok(llms.startsWith('# Skolko'), 'expected llms.txt in staging output too');

  assert.strictEqual(await exists(staleSitemap), false, 'staging must not leave a sitemap.xml behind');
});

test('prepare: landing page has no SPA bundle or framework script references', async (t) => {
  for (const env of [{ SEO_SITE_ORIGIN: ORIGIN }, { BASE_URL: '/skolko/', SEO_SITE_ORIGIN: ORIGIN }]) {
    const targetDir = await makeTempDir(t);
    await prepareSeoFiles({ targetDir, env });
    const html = await readFile(path.join(targetDir, 'popular-currency-pairs', 'index.html'), 'utf8');

    assert.ok(!/<script[^>]*\ssrc=/i.test(html), 'landing page must not load external scripts');
    assert.ok(!html.includes('assets/index-'), 'landing page must not reference Vite JS/CSS bundles');
    assert.ok(!/react/i.test(html), 'landing page must not reference React');
    assert.ok(!/effector/i.test(html), 'landing page must not reference effector');
    assert.ok(!html.includes('registerSW'), 'landing page must not register the SPA service worker');
  }
});

// ============================================================================
// CLI entry point
// ============================================================================

test('prepare: CLI writes into ./dist and reports the staging mode', async (t) => {
  const cwd = await makeTempDir(t);
  const { stdout } = await execFileAsync(process.execPath, [PREPARE_SCRIPT], {
    cwd,
    env: productionEnv({ SEO_SITE_ORIGIN: ORIGIN }),
  });

  assert.ok(stdout.includes('production'), `expected production mode in log, got: ${stdout.trim()}`);
  assert.ok(await exists(path.join(cwd, 'dist', 'popular-currency-pairs', 'index.html')));
  assert.ok(await exists(path.join(cwd, 'dist', 'sitemap.xml')));

  const stagingCwd = await makeTempDir(t);
  const staging = await execFileAsync(process.execPath, [PREPARE_SCRIPT], {
    cwd: stagingCwd,
    env: productionEnv({ STAGING: 'true', SEO_SITE_ORIGIN: ORIGIN }),
  });
  assert.ok(staging.stdout.includes('staging'), 'expected staging mode in log');
  assert.strictEqual(await exists(path.join(stagingCwd, 'dist', 'sitemap.xml')), false);
});

// ============================================================================
// Real `npm run build` output in dist/
// ============================================================================

test('build: production build emits all SEO artifacts in dist/', async (t) => {
  await execFileAsync('npm', ['run', 'build'], {
    cwd: REPO_ROOT,
    env: productionEnv(),
    maxBuffer: 10 * 1024 * 1024,
  });

  const dist = path.join(REPO_ROOT, 'dist');
  const landingFile = path.join(dist, 'popular-currency-pairs', 'index.html');

  for (const file of [landingFile, path.join(dist, 'robots.txt'), path.join(dist, 'llms.txt'), path.join(dist, 'sitemap.xml')]) {
    const stats = await stat(file);
    assert.ok(stats.isFile(), `expected ${file} to exist after npm run build`);
    assert.ok(stats.size > 0, `expected ${file} to be non-empty`);
    await access(file, constants.R_OK);
  }

  const html = await readFile(landingFile, 'utf8');
  assert.ok(html.includes('<meta name="robots" content="index, follow" />'), 'dist build must be indexable');
  assert.ok(!/<script[^>]*\ssrc=/i.test(html), 'dist landing page must not load the SPA bundle');
  assert.ok(!html.includes('assets/index-'), 'dist landing page must not reference Vite bundles');

  const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
  assert.ok(
    sitemap.includes(`<loc>${DEFAULT_SITE_ORIGIN}/popular-currency-pairs/</loc>`),
    'dist sitemap must advertise the landing page',
  );

  const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
  assert.ok(
    robots.includes(`Sitemap: ${DEFAULT_SITE_ORIGIN}/sitemap.xml`),
    'dist robots.txt must advertise the production sitemap',
  );

  const sw = await readFile(path.join(dist, 'sw.js'), 'utf8');
  assert.ok(
    sw.includes('popular-currency-pairs'),
    'service worker must exclude popular-currency-pairs from navigation fallback',
  );
});
