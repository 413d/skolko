import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSitemapXml } from '../scripts/generate-sitemap.mjs';
import { generateRobotsTxt } from '../scripts/generate-robots.mjs';
import { generateLlmsTxt } from '../scripts/generate-llms.mjs';
import { POPULAR_PAIRS } from '../scripts/seo-pairs-data.mjs';

const ORIGIN = 'https://skolko.example.com';
const ORIGIN_TRAILING = 'https://skolko.example.com///';
const TODAY = new Date().toISOString().slice(0, 10);
const CUSTOM_DATE = '2026-11-13';

// ============================================================================
// generateSitemapXml
// ============================================================================

test('sitemap: emits valid xml declaration and urlset schema', () => {
  const xml = generateSitemapXml(ORIGIN, CUSTOM_DATE);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'expected xml declaration');
  assert.ok(
    xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),
    'expected standard sitemap urlset namespace',
  );
  assert.ok(xml.trimEnd().endsWith('</urlset>'), 'expected closed urlset');
});

test('sitemap: strips trailing slashes from origin', () => {
  const xml = generateSitemapXml(ORIGIN_TRAILING, CUSTOM_DATE);
  assert.ok(xml.includes(`<loc>${ORIGIN}/</loc>`), 'expected root url with single slash');
  assert.ok(
    xml.includes(`<loc>${ORIGIN}/popular-currency-pairs/</loc>`),
    'expected landing url without double slashes',
  );
  assert.ok(!xml.includes(`${ORIGIN}///`), 'must not contain unstripped origin');
});

test('sitemap: contains exactly two url entries with expected locs', () => {
  const xml = generateSitemapXml(ORIGIN, CUSTOM_DATE);
  const locMatches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepStrictEqual(locMatches, [
    `${ORIGIN}/`,
    `${ORIGIN}/popular-currency-pairs/`,
  ]);
  const urlCount = (xml.match(/<url>/g) || []).length;
  assert.strictEqual(urlCount, 2, 'expected exactly 2 <url> blocks');
});

test('sitemap: uses explicit lastmod when provided', () => {
  const xml = generateSitemapXml(ORIGIN, CUSTOM_DATE);
  const lastmodMatches = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  assert.strictEqual(lastmodMatches.length, 2);
  assert.strictEqual(lastmodMatches[0], CUSTOM_DATE);
  assert.strictEqual(lastmodMatches[1], CUSTOM_DATE);
});

test('sitemap: defaults lastmod to current date in YYYY-MM-DD format when omitted', () => {
  const xml = generateSitemapXml(ORIGIN);
  const lastmodMatches = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  assert.strictEqual(lastmodMatches.length, 2);
  assert.strictEqual(lastmodMatches[0], TODAY);
  assert.strictEqual(lastmodMatches[1], TODAY);
  assert.match(lastmodMatches[0], /^\d{4}-\d{2}-\d{2}$/);
});

test('sitemap: rejects invalid lastmod date string', () => {
  assert.throws(
    () => generateSitemapXml(ORIGIN, 'invalid-date'),
    /Invalid lastmod/,
  );
});

test('sitemap: accepts options object interface', () => {
  const xml = generateSitemapXml({ origin: ORIGIN, lastmod: CUSTOM_DATE });
  assert.ok(xml.includes(`<loc>${ORIGIN}/popular-currency-pairs/</loc>`));
  assert.ok(xml.includes(`<lastmod>${CUSTOM_DATE}</lastmod>`));
});

// ============================================================================
// generateRobotsTxt
// ============================================================================

test('robots: staging blocks all crawling and omits sitemap reference', () => {
  const robots = generateRobotsTxt(ORIGIN, true);
  assert.ok(robots.includes('User-agent: *'), 'staging must target User-agent: *');
  assert.ok(robots.includes('Disallow: /'), 'staging must disallow root');
  assert.ok(!robots.toLowerCase().includes('sitemap:'), 'staging must not reference sitemap');
  assert.ok(!robots.includes('Googlebot'), 'staging should not list specific bot allow rules');
});

test('robots: production allows Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, and generic user-agent', () => {
  const robots = generateRobotsTxt(ORIGIN, false);
  const requiredAgents = [
    'Googlebot',
    'Bingbot',
    'OAI-SearchBot',
    'PerplexityBot',
    '*',
  ];

  for (const agent of requiredAgents) {
    const pattern = new RegExp(`User-agent:\\s*${agent.replace('*', '\\*')}\\s*\\nAllow:\\s*/`, 'i');
    assert.ok(pattern.test(robots), `expected allow block for ${agent}`);
  }
});

test('robots: production does not disallow CSS or popular-currency-pairs', () => {
  const robots = generateRobotsTxt(ORIGIN, false);
  assert.ok(!robots.includes('Disallow:'), 'production must not contain any Disallow directives');
  assert.ok(!robots.includes('/popular-currency-pairs/'), 'must not restrict popular currency pairs');
  assert.ok(!robots.includes('.css'), 'must not block css assets');
});

test('robots: production includes sitemap url with trailing slash stripped', () => {
  const robots = generateRobotsTxt(ORIGIN_TRAILING, false);
  assert.ok(
    robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`),
    'expected production sitemap directive pointing to sitemap.xml',
  );
  assert.ok(!robots.includes('///'), 'must strip trailing slashes from origin');
});

test('robots: accepts options object interface', () => {
  const robotsProd = generateRobotsTxt({ origin: ORIGIN, isStaging: false });
  assert.ok(robotsProd.includes(`Sitemap: ${ORIGIN}/sitemap.xml`));

  const robotsStaging = generateRobotsTxt({ origin: ORIGIN, isStaging: true });
  assert.ok(robotsStaging.includes('Disallow: /'));
  assert.ok(!robotsStaging.toLowerCase().includes('sitemap:'));
});

// ============================================================================
// generateLlmsTxt
// ============================================================================

test('llms: contains H1 # Skolko header', () => {
  const llms = generateLlmsTxt(ORIGIN);
  assert.ok(llms.startsWith('# Skolko'), 'expected document to begin with # Skolko');
});

test('llms: describes Skolko as lightweight, privacy-friendly converter with offline support', () => {
  const llms = generateLlmsTxt(ORIGIN);
  const lower = llms.toLowerCase();
  assert.ok(lower.includes('lightweight'), 'expected mention of lightweight');
  assert.ok(lower.includes('privacy'), 'expected mention of privacy');
  assert.ok(lower.includes('offline'), 'expected mention of offline support');
  assert.ok(lower.includes('cryptocurrency') || lower.includes('crypto'), 'expected mention of crypto');
  assert.ok(lower.includes('fiat'), 'expected mention of fiat currencies');
});

test('llms: links to main converter and popular currency pairs guide', () => {
  const llms = generateLlmsTxt(ORIGIN);
  assert.ok(
    llms.includes(`${ORIGIN}/`),
    'expected link to main converter at origin root',
  );
  assert.ok(
    llms.includes(`${ORIGIN}/popular-currency-pairs/`),
    'expected link to popular currency pairs guide',
  );
});

test('llms: respects non-root base path for main converter and strips origin trailing slash', () => {
  const llms = generateLlmsTxt(ORIGIN_TRAILING, '/skolko/');
  assert.ok(
    llms.includes(`${ORIGIN}/skolko/`),
    'expected main converter link to include normalized base path',
  );
  assert.ok(
    llms.includes(`${ORIGIN}/popular-currency-pairs/`),
    'expected guide link to use canonical origin',
  );
  assert.ok(!llms.includes('///'), 'must strip trailing slash from origin');
});

test('llms: provides summary of 30 popular currency pairs', () => {
  const llms = generateLlmsTxt(ORIGIN);
  assert.ok(llms.includes('30'), 'expected mention of 30 popular currency pairs');
  assert.ok(llms.includes('20 fiat'), 'expected mention of 20 fiat pairs');
  assert.ok(llms.includes('10 crypto') || llms.includes('10 cryptocurrency'), 'expected mention of 10 crypto pairs');

  // Verify all 30 pairs from data are represented
  for (const pair of POPULAR_PAIRS) {
    const pairTicker = `${pair.from}/${pair.to}`;
    assert.ok(llms.includes(pairTicker), `expected pair ${pairTicker} to be included in llms.txt`);
  }
});

test('llms: accepts options object interface', () => {
  const llms = generateLlmsTxt({ origin: ORIGIN, basePath: '/app/' });
  assert.ok(llms.includes(`${ORIGIN}/app/`));
  assert.ok(llms.includes(`${ORIGIN}/popular-currency-pairs/`));
});
