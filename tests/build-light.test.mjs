import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyStagingGuards,
  injectNoindexMeta,
  NOINDEX_META,
} from '../scripts/prepare-staging-guard.mjs';

const execFileAsync = promisify(execFile);
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const GUARD_SCRIPT = path.join(REPO_ROOT, 'scripts', 'prepare-staging-guard.mjs');

const SPA_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Skolko</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

async function makeTempDir(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'skolko-light-'));
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
// injectNoindexMeta
// ============================================================================

test('light: injects the noindex meta tag inside <head>', () => {
  const result = injectNoindexMeta(SPA_HTML);

  assert.ok(result.includes(NOINDEX_META), 'expected the noindex meta tag');
  assert.ok(
    result.indexOf(NOINDEX_META) < result.indexOf('</head>'),
    'expected the meta tag before </head>',
  );
  assert.ok(result.includes('<title>Skolko</title>'), 'expected other head content to survive');
  assert.ok(result.includes('<div id="root"></div>'), 'expected body content to survive');
});

test('light: noindex meta tag uses noindex, nofollow', () => {
  assert.strictEqual(NOINDEX_META, '<meta name="robots" content="noindex, nofollow" />');
});

test('light: injection is idempotent', () => {
  const once = injectNoindexMeta(SPA_HTML);
  const twice = injectNoindexMeta(once);

  assert.strictEqual(twice, once, 'a second pass must not duplicate the meta tag');
  assert.strictEqual(once.split('name="robots"').length - 1, 1, 'expected exactly one robots meta tag');
});

test('light: an existing robots meta tag is left untouched', () => {
  const html = SPA_HTML.replace('</head>', '    <meta name="robots" content="index, follow" />\n  </head>');
  const result = injectNoindexMeta(html);

  assert.strictEqual(result, html, 'existing robots directives must not be overwritten');
});

test('light: throws a descriptive error when <head> is missing', () => {
  assert.throws(
    () => injectNoindexMeta('<!DOCTYPE html><html><body>no head</body></html>'),
    /no closing <\/head>/,
  );
});

// ============================================================================
// applyStagingGuards
// ============================================================================

test('light: writes a blocking robots.txt and guards index.html', async (t) => {
  const dir = await makeTempDir(t);
  await writeFile(path.join(dir, 'index.html'), SPA_HTML, 'utf8');

  const result = await applyStagingGuards({ targetDir: dir });

  assert.deepStrictEqual(
    result.files.map(file => path.basename(file)).sort(),
    ['index.html', 'robots.txt'],
  );

  const html = await readFile(path.join(dir, 'index.html'), 'utf8');
  assert.ok(html.includes(NOINDEX_META), 'expected the built index.html to be noindexed');

  const robots = await readFile(path.join(dir, 'robots.txt'), 'utf8');
  assert.ok(robots.includes('User-agent: *'), 'expected a user-agent block');
  assert.ok(robots.includes('Disallow: /'), 'expected staging to disallow all crawling');
  assert.ok(!robots.includes('Sitemap:'), 'staging must not advertise a sitemap');
});

test('light: does not generate the SEO landing page, sitemap, or llms.txt', async (t) => {
  const dir = await makeTempDir(t);
  await writeFile(path.join(dir, 'index.html'), SPA_HTML, 'utf8');

  await applyStagingGuards({ targetDir: dir });

  assert.strictEqual(await exists(path.join(dir, 'sitemap.xml')), false, 'staging must not emit sitemap.xml');
  assert.strictEqual(await exists(path.join(dir, 'llms.txt')), false, 'staging must not emit llms.txt');
  assert.strictEqual(
    await exists(path.join(dir, 'popular-currency-pairs', 'index.html')),
    false,
    'staging must not emit the landing page',
  );
});

test('light: re-running the guards keeps a single robots meta tag', async (t) => {
  const dir = await makeTempDir(t);
  await writeFile(path.join(dir, 'index.html'), SPA_HTML, 'utf8');

  await applyStagingGuards({ targetDir: dir });
  await applyStagingGuards({ targetDir: dir });

  const html = await readFile(path.join(dir, 'index.html'), 'utf8');
  assert.strictEqual(html.split('name="robots"').length - 1, 1, 'expected exactly one robots meta tag');
});

test('light: fails with a clear message when index.html is missing', async (t) => {
  const dir = await makeTempDir(t);
  await mkdir(dir, { recursive: true });

  await assert.rejects(
    () => applyStagingGuards({ targetDir: dir }),
    /does not exist\. Run "vite build" first/,
  );
});

// ============================================================================
// CLI
// ============================================================================

test('light CLI: guards ./dist relative to the working directory', async (t) => {
  const cwd = await makeTempDir(t);
  const dist = path.join(cwd, 'dist');
  await mkdir(dist, { recursive: true });
  await writeFile(path.join(dist, 'index.html'), SPA_HTML, 'utf8');

  const { stdout } = await execFileAsync(process.execPath, [GUARD_SCRIPT], { cwd });

  assert.ok(stdout.includes('noindex'), `expected noindex in log, got: ${stdout.trim()}`);
  assert.ok(stdout.includes('dist/robots.txt'), `expected dist/robots.txt in log, got: ${stdout.trim()}`);

  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  assert.ok(html.includes(NOINDEX_META));
  assert.ok((await readFile(path.join(dist, 'robots.txt'), 'utf8')).includes('Disallow: /'));
});
