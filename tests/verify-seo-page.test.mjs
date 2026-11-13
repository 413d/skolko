import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareSeoFiles } from '../scripts/prepare-seo-page.mjs';
import {
  parseCliArgs,
  PRD_ALL_PAIRS,
  PRD_CRYPTO_PAIRS,
  PRD_FIAT_PAIRS,
  PRD_META_DESCRIPTION,
  PRD_TITLE,
  verifySeoBuild,
} from '../scripts/verify-seo-page.mjs';

const execFileAsync = promisify(execFile);
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const VERIFY_SCRIPT = path.join(REPO_ROOT, 'scripts', 'verify-seo-page.mjs');
const DIST_DIR = path.join(REPO_ROOT, 'dist');

async function makeTempDir(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'skolko-verify-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

/** Copies mock static assets so asset-existence checks pass in a temp directory. */
async function seedMockAssets(dir) {
  await writeFile(path.join(dir, 'favicon.ico'), 'mock-favicon');
  await writeFile(path.join(dir, 'skolko.svg'), '<svg></svg>');
}

// ============================================================================
// Constants and PRD baseline verification
// ============================================================================

test('verify: PRD constants match editorial specifications', () => {
  assert.strictEqual(PRD_FIAT_PAIRS.length, 20);
  assert.strictEqual(PRD_CRYPTO_PAIRS.length, 10);
  assert.strictEqual(PRD_ALL_PAIRS.length, 30);
  assert.strictEqual(PRD_ALL_PAIRS[0].from, 'EUR');
  assert.strictEqual(PRD_ALL_PAIRS[0].to, 'USD');
  assert.strictEqual(PRD_ALL_PAIRS[19].from, 'USD');
  assert.strictEqual(PRD_ALL_PAIRS[19].to, 'PLN');
  assert.strictEqual(PRD_ALL_PAIRS[20].from, 'BTC');
  assert.strictEqual(PRD_ALL_PAIRS[20].to, 'USD');
  assert.strictEqual(PRD_ALL_PAIRS[29].from, 'ETH');
  assert.strictEqual(PRD_ALL_PAIRS[29].to, 'BTC');
});

test('verify: parseCliArgs correctly handles flags, paths, and values', () => {
  const parsed = parseCliArgs([
    'custom-dist',
    '--staging',
    '--origin',
    'https://example.org',
    '--base-path=/subpath/',
    '--quiet',
  ]);
  assert.strictEqual(parsed.targetDir, 'custom-dist');
  assert.strictEqual(parsed.isStaging, true);
  assert.strictEqual(parsed.origin, 'https://example.org');
  assert.strictEqual(parsed.basePath, '/subpath/');
  assert.strictEqual(parsed.quiet, true);
});

// ============================================================================
// Production and Staging verification runs
// ============================================================================

test('verify: passes 100% against production build in dist/', async () => {
  const result = await verifySeoBuild({ targetDir: DIST_DIR, isStaging: false });
  assert.strictEqual(result.success, true, `Expected all checks to pass, got failures: ${result.errors.join('; ')}`);
  assert.strictEqual(result.failedCount, 0);
  assert.ok(result.passedCount >= 85, `Expected >= 85 checks, got ${result.passedCount}`);
  assert.deepStrictEqual(result.errors, []);
});

test('verify: passes 100% against staging build', async (t) => {
  const stagingDir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: stagingDir, env: { BASE_URL: '/skolko/' } });
  await seedMockAssets(stagingDir);

  const result = await verifySeoBuild({
    targetDir: stagingDir,
    isStaging: true,
    basePath: '/skolko/',
  });

  assert.strictEqual(result.success, true, `Expected staging checks to pass: ${result.errors.join('; ')}`);
  assert.strictEqual(result.failedCount, 0);
  assert.ok(result.passedCount >= 75);
});

// ============================================================================
// Error detection tests (mutated artifacts)
// ============================================================================

test('verify: detects missing landing page', async (t) => {
  const dir = await makeTempDir(t);
  await seedMockAssets(dir);
  await writeFile(path.join(dir, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  await writeFile(path.join(dir, 'llms.txt'), '# Skolko\n');
  await writeFile(path.join(dir, 'sitemap.xml'), '<urlset></urlset>');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: false });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('popular-currency-pairs/index.html exists')));
});

test('verify: detects injected SPA bundle <script> tag', async (t) => {
  const dir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: dir, env: {} });
  await seedMockAssets(dir);

  const landingPath = path.join(dir, 'popular-currency-pairs', 'index.html');
  let html = await readFile(landingPath, 'utf8');
  html = html.replace('</head>', '<script src="/assets/index-bundle.js"></script></head>');
  await writeFile(landingPath, html, 'utf8');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: false });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('Zero SPA bundle or external <script> tags')));
});

test('verify: detects external stylesheet links', async (t) => {
  const dir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: dir, env: {} });
  await seedMockAssets(dir);

  const landingPath = path.join(dir, 'popular-currency-pairs', 'index.html');
  let html = await readFile(landingPath, 'utf8');
  html = html.replace('</head>', '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter" /></head>');
  await writeFile(landingPath, html, 'utf8');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: false });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('Zero external stylesheet <link> tags')));
});

test('verify: detects title mismatch', async (t) => {
  const dir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: dir, env: {} });
  await seedMockAssets(dir);

  const landingPath = path.join(dir, 'popular-currency-pairs', 'index.html');
  let html = await readFile(landingPath, 'utf8');
  html = html.replace(`<title>${PRD_TITLE}</title>`, '<title>Wrong Title</title>');
  await writeFile(landingPath, html, 'utf8');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: false });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('Title matches PRD §4.1 exactly')));
});

test('verify: detects meta description mismatch', async (t) => {
  const dir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: dir, env: {} });
  await seedMockAssets(dir);

  const landingPath = path.join(dir, 'popular-currency-pairs', 'index.html');
  let html = await readFile(landingPath, 'utf8');
  html = html.replace(PRD_META_DESCRIPTION, 'Wrong meta description');
  await writeFile(landingPath, html, 'utf8');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: false });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('Meta description matches PRD §4.2 exactly')));
});

test('verify: detects canonical URL mismatch', async (t) => {
  const dir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: dir, env: {} });
  await seedMockAssets(dir);

  const landingPath = path.join(dir, 'popular-currency-pairs', 'index.html');
  let html = await readFile(landingPath, 'utf8');
  html = html.replace(/href="https:\/\/[^"]+\/popular-currency-pairs\/"/, 'href="https://bad-canonical.com/"');
  await writeFile(landingPath, html, 'utf8');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: false });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('Canonical tag matches expected production URL')));
});

test('verify: detects noindex in production build', async (t) => {
  const dir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: dir, env: {} });
  await seedMockAssets(dir);

  const landingPath = path.join(dir, 'popular-currency-pairs', 'index.html');
  let html = await readFile(landingPath, 'utf8');
  html = html.replace('content="index, follow"', 'content="noindex, nofollow"');
  await writeFile(landingPath, html, 'utf8');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: false });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('Production meta robots is "index, follow"')));
});

test('verify: detects index directive in staging build', async (t) => {
  const dir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: dir, env: { BASE_URL: '/skolko/' } });
  await seedMockAssets(dir);

  const landingPath = path.join(dir, 'popular-currency-pairs', 'index.html');
  let html = await readFile(landingPath, 'utf8');
  html = html.replace('content="noindex, nofollow"', 'content="index, follow"');
  await writeFile(landingPath, html, 'utf8');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: true, basePath: '/skolko/' });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('Staging meta robots is "noindex, nofollow"')));
});

test('verify: detects unapproved sitemap.xml in staging build', async (t) => {
  const dir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: dir, env: { BASE_URL: '/skolko/' } });
  await seedMockAssets(dir);

  // Artificially create sitemap.xml in staging
  await writeFile(path.join(dir, 'sitemap.xml'), '<urlset></urlset>');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: true, basePath: '/skolko/' });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('sitemap.xml is excluded in staging')));
});

test('verify: detects unknown currency symbols in landing page', async (t) => {
  const dir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: dir, env: {} });
  await seedMockAssets(dir);

  const landingPath = path.join(dir, 'popular-currency-pairs', 'index.html');
  let html = await readFile(landingPath, 'utf8');
  html = html.replaceAll('EUR', 'FOO');
  await writeFile(landingPath, html, 'utf8');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: false });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('All pair symbols exist in 24 Coinbase known symbols')));
});

test('verify: detects corrupt or invalid JSON-LD block', async (t) => {
  const dir = await makeTempDir(t);
  await prepareSeoFiles({ targetDir: dir, env: {} });
  await seedMockAssets(dir);

  const landingPath = path.join(dir, 'popular-currency-pairs', 'index.html');
  let html = await readFile(landingPath, 'utf8');
  html = html.replace('</script>', 'INVALID_JSON</script>');
  await writeFile(landingPath, html, 'utf8');

  const result = await verifySeoBuild({ targetDir: dir, isStaging: false });
  assert.strictEqual(result.success, false);
  assert.ok(result.errors.some(e => e.includes('JSON-LD parses as valid JSON')));
});

// ============================================================================
// CLI invocation tests
// ============================================================================

test('verify CLI: exits 0 on valid dist directory', async () => {
  const { stdout, stderr } = await execFileAsync('node', [VERIFY_SCRIPT, DIST_DIR]);
  assert.ok(stdout.includes('ALL PRD ACCEPTANCE CHECKS PASSED'));
  assert.strictEqual(stderr, '');
});

test('verify CLI: exits 1 on empty directory with descriptive errors', async (t) => {
  const emptyDir = await makeTempDir(t);
  await assert.rejects(
    async () => {
      await execFileAsync('node', [VERIFY_SCRIPT, emptyDir]);
    },
    (err) => {
      assert.strictEqual(err.code, 1);
      assert.ok(err.stdout.includes('VERIFICATION FAILED') || err.stderr.includes('VERIFICATION FAILED'));
      return true;
    },
  );
});
