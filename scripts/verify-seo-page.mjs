/**
 * verify-seo-page.mjs
 *
 * Comprehensive acceptance test runner for Skolko's SEO landing page
 * and discoverability files. Validates PRD §15 and §16 requirements against
 * the built static artifacts in `./dist` (or a specified directory).
 *
 * Usage:
 *   node scripts/verify-seo-page.mjs [targetDir] [options]
 *
 * Options:
 *   --staging           Verify staging build rules (noindex, Disallow: /, no sitemap)
 *   --origin <url>      Site origin for canonical & sitemap URLs (default: https://skolko.lx.deno.net)
 *   --base-path <path>  Base path for in-page links (default: /)
 *   --quiet             Suppress detailed per-check console output
 *   --help, -h          Show this help message
 */

import { access, readFile, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COINBASE_KNOWN_SYMBOLS } from './seo-pairs-data.mjs';
import { DEFAULT_SITE_ORIGIN } from './prepare-seo-page.mjs';

// ============================================================================
// PRD Specification Constants (PRD §4, §15, §16)
// ============================================================================

export const PRD_TITLE = 'Popular Currency Pairs to Convert | Fiat & Crypto Converter';

export const PRD_META_DESCRIPTION =
  'Explore 30 popular fiat and cryptocurrency conversion pairs. Discover commonly used ' +
  'currency combinations and convert currencies instantly with Skolko.';

export const PRD_MAIN_HEADING = 'Popular Currency Pairs for Everyday Conversion';

export const PRD_HERO_LEAD =
  'Looking for the most popular currency pairs to convert? Explore commonly used fiat ' +
  'currency and cryptocurrency combinations from around the world.';

export const PRD_HERO_CTA_TARGET = '?c=USD:1&c=EUR';

export const PRD_ABOUT_HEADING = 'A Free Currency and Cryptocurrency Converter';

export const PRD_CRAWLER_BOTS = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot'];

/**
 * The 20 fiat pairs specified in PRD §4.5.1 in exact editorial rank order.
 */
export const PRD_FIAT_PAIRS = [
  { rank: 1, from: 'EUR', to: 'USD', fromName: 'Euro', toName: 'US Dollar' },
  { rank: 2, from: 'USD', to: 'JPY', fromName: 'US Dollar', toName: 'Japanese Yen' },
  { rank: 3, from: 'USD', to: 'CNY', fromName: 'US Dollar', toName: 'Chinese Yuan' },
  { rank: 4, from: 'GBP', to: 'USD', fromName: 'British Pound', toName: 'US Dollar' },
  { rank: 5, from: 'USD', to: 'CAD', fromName: 'US Dollar', toName: 'Canadian Dollar' },
  { rank: 6, from: 'AUD', to: 'USD', fromName: 'Australian Dollar', toName: 'US Dollar' },
  { rank: 7, from: 'USD', to: 'CHF', fromName: 'US Dollar', toName: 'Swiss Franc' },
  { rank: 8, from: 'USD', to: 'HKD', fromName: 'US Dollar', toName: 'Hong Kong Dollar' },
  { rank: 9, from: 'USD', to: 'SGD', fromName: 'US Dollar', toName: 'Singapore Dollar' },
  { rank: 10, from: 'USD', to: 'INR', fromName: 'US Dollar', toName: 'Indian Rupee' },
  { rank: 11, from: 'EUR', to: 'GBP', fromName: 'Euro', toName: 'British Pound' },
  { rank: 12, from: 'USD', to: 'KRW', fromName: 'US Dollar', toName: 'South Korean Won' },
  { rank: 13, from: 'USD', to: 'MXN', fromName: 'US Dollar', toName: 'Mexican Peso' },
  { rank: 14, from: 'USD', to: 'NZD', fromName: 'US Dollar', toName: 'New Zealand Dollar' },
  { rank: 15, from: 'EUR', to: 'JPY', fromName: 'Euro', toName: 'Japanese Yen' },
  { rank: 16, from: 'EUR', to: 'CHF', fromName: 'Euro', toName: 'Swiss Franc' },
  { rank: 17, from: 'USD', to: 'BRL', fromName: 'US Dollar', toName: 'Brazilian Real' },
  { rank: 18, from: 'USD', to: 'ZAR', fromName: 'US Dollar', toName: 'South African Rand' },
  { rank: 19, from: 'USD', to: 'TRY', fromName: 'US Dollar', toName: 'Turkish Lira' },
  { rank: 20, from: 'USD', to: 'PLN', fromName: 'US Dollar', toName: 'Polish Zloty' },
];

/**
 * The 10 cryptocurrency pairs specified in PRD §4.5.2 in exact editorial rank order.
 */
export const PRD_CRYPTO_PAIRS = [
  { rank: 21, from: 'BTC', to: 'USD', fromName: 'Bitcoin', toName: 'US Dollar' },
  { rank: 22, from: 'BTC', to: 'USDT', fromName: 'Bitcoin', toName: 'Tether' },
  { rank: 23, from: 'ETH', to: 'USD', fromName: 'Ethereum', toName: 'US Dollar' },
  { rank: 24, from: 'ETH', to: 'USDT', fromName: 'Ethereum', toName: 'Tether' },
  { rank: 25, from: 'SOL', to: 'USD', fromName: 'Solana', toName: 'US Dollar' },
  { rank: 26, from: 'SOL', to: 'USDT', fromName: 'Solana', toName: 'Tether' },
  { rank: 27, from: 'BTC', to: 'USDC', fromName: 'Bitcoin', toName: 'USD Coin' },
  { rank: 28, from: 'ETH', to: 'USDC', fromName: 'Ethereum', toName: 'USD Coin' },
  { rank: 29, from: 'XRP', to: 'USD', fromName: 'XRP', toName: 'US Dollar' },
  { rank: 30, from: 'ETH', to: 'BTC', fromName: 'Ethereum', toName: 'Bitcoin' },
];

export const PRD_ALL_PAIRS = [...PRD_FIAT_PAIRS, ...PRD_CRYPTO_PAIRS];

export const PRD_FAQ_QUESTIONS = [
  'What is a currency pair?',
  'What are the most popular currency pairs?',
  'What is the difference between fiat and cryptocurrency pairs?',
  'How can I convert between fiat currencies and cryptocurrencies?',
];

// ============================================================================
// Helpers
// ============================================================================

/** Normalizes an origin string by trimming whitespace and removing trailing slashes. */
export function normalizeOrigin(origin) {
  return String(origin ?? '').trim().replace(/\/+$/, '');
}

/** Normalizes any base path shape into `/`, `/repo/`, etc. */
export function normalizeBasePath(basePath) {
  const segment = String(basePath ?? '').trim().replace(/^\/+|\/+$/g, '');
  return segment ? `/${segment}/` : '/';
}

/** Checks whether a path exists and is readable. */
async function fileExists(filePath) {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/** HTML-unescapes text node content (&amp;, &lt;, &gt;, &quot;, &#39;). */
function unescapeHtml(html) {
  return String(html ?? '')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'");
}

// ============================================================================
// Verification Engine
// ============================================================================

/**
 * Runs all PRD acceptance checks against the build output directory.
 *
 * @param {object} [options]
 * @param {string} [options.targetDir] Output directory to verify (defaults to `./dist`)
 * @param {boolean} [options.isStaging] Verify staging behavior (noindex, Disallow: /, no sitemap)
 * @param {string} [options.origin] Site origin (defaults to SEO_SITE_ORIGIN or DEFAULT_SITE_ORIGIN)
 * @param {string} [options.basePath] Base path (defaults to BASE_URL or REPO_NAME or '/')
 * @param {boolean} [options.quiet] Suppress non-error console output
 * @returns {Promise<{
 *   success: boolean,
 *   checks: Array<{ category: string, name: string, passed: boolean, error?: string, details?: string }>,
 *   errors: string[],
 *   warnings: string[],
 *   passedCount: number,
 *   failedCount: number,
 *   totalCount: number
 * }>}
 */
export async function verifySeoBuild(options = {}) {
  const targetDir = path.resolve(process.cwd(), options.targetDir || 'dist');
  const isStaging = Boolean(options.isStaging);
  const origin = normalizeOrigin(options.origin || process.env.SEO_SITE_ORIGIN || DEFAULT_SITE_ORIGIN);
  const basePath = normalizeBasePath(options.basePath || process.env.BASE_URL || process.env.REPO_NAME || '/');

  const checks = [];
  const errors = [];
  const warnings = [];

  /**
   * Records a verification check result.
   * @param {string} category
   * @param {string} name
   * @param {boolean} passed
   * @param {string} [errorMsg]
   * @param {string} [details]
   */
  function check(category, name, passed, errorMsg, details) {
    const record = {
      category,
      name,
      passed: Boolean(passed),
      ...(errorMsg && !passed ? { error: errorMsg } : {}),
      ...(details ? { details } : {}),
    };
    checks.push(record);
    if (!passed) {
      const fullError = `[${category}] ${name}: ${errorMsg || 'Check failed'}`;
      errors.push(fullError);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Category 1: Static Artifacts Existence & Non-Emptiness
  // ──────────────────────────────────────────────────────────────────────────
  const landingFilePath = path.join(targetDir, 'popular-currency-pairs', 'index.html');
  const robotsFilePath = path.join(targetDir, 'robots.txt');
  const llmsFilePath = path.join(targetDir, 'llms.txt');
  const sitemapFilePath = path.join(targetDir, 'sitemap.xml');

  const landingExists = await fileExists(landingFilePath);
  check('Artifacts', 'dist/popular-currency-pairs/index.html exists', landingExists,
    `File not found: ${landingFilePath}`);

  let landingHtml = '';
  if (landingExists) {
    const landingStats = await stat(landingFilePath);
    check('Artifacts', 'dist/popular-currency-pairs/index.html is non-empty', landingStats.size > 0,
      `File is empty (size 0 bytes)`);
    landingHtml = await readFile(landingFilePath, 'utf8');
  }

  const robotsExists = await fileExists(robotsFilePath);
  check('Artifacts', 'dist/robots.txt exists', robotsExists, `File not found: ${robotsFilePath}`);

  let robotsTxt = '';
  if (robotsExists) {
    const robotsStats = await stat(robotsFilePath);
    check('Artifacts', 'dist/robots.txt is non-empty', robotsStats.size > 0, `File is empty`);
    robotsTxt = await readFile(robotsFilePath, 'utf8');
  }

  const llmsExists = await fileExists(llmsFilePath);
  check('Artifacts', 'dist/llms.txt exists', llmsExists, `File not found: ${llmsFilePath}`);

  let llmsTxt = '';
  if (llmsExists) {
    const llmsStats = await stat(llmsFilePath);
    check('Artifacts', 'dist/llms.txt is non-empty', llmsStats.size > 0, `File is empty`);
    llmsTxt = await readFile(llmsFilePath, 'utf8');
  }

  const sitemapExists = await fileExists(sitemapFilePath);
  if (isStaging) {
    check('Artifacts', 'dist/sitemap.xml is excluded in staging', !sitemapExists,
      `sitemap.xml must NOT exist in staging mode, but was found at ${sitemapFilePath}`);
  } else {
    check('Artifacts', 'dist/sitemap.xml exists in production', sitemapExists,
      `sitemap.xml missing in production build at ${sitemapFilePath}`);
  }

  let sitemapXml = '';
  if (sitemapExists) {
    sitemapXml = await readFile(sitemapFilePath, 'utf8');
  }

  // Static icon references
  const faviconExists = await fileExists(path.join(targetDir, 'favicon.ico'));
  check('Artifacts', 'dist/favicon.ico exists', faviconExists, 'favicon.ico missing in build');

  const skolkoSvgExists = await fileExists(path.join(targetDir, 'skolko.svg'));
  check('Artifacts', 'dist/skolko.svg exists', skolkoSvgExists, 'skolko.svg missing in build');

  // If HTML could not be loaded, abort the deeper checks early
  if (!landingExists || !landingHtml) {
    return {
      success: false,
      checks,
      errors,
      warnings,
      passedCount: checks.filter(c => c.passed).length,
      failedCount: checks.filter(c => !c.passed).length,
      totalCount: checks.length,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Category 2: Standalone Architecture & Asset Isolation (PRD §15.1, §16.6)
  // ──────────────────────────────────────────────────────────────────────────
  check('Architecture', 'Document starts with <!DOCTYPE html>',
    landingHtml.trim().startsWith('<!DOCTYPE html>'),
    'Expected standalone HTML5 DOCTYPE declaration at top of document');

  check('Architecture', '<html> tag specifies English lang="en"',
    /<html\b[^>]*\blang=["']en["']/i.test(landingHtml),
    '<html> element must have lang="en"');

  // Script isolation: no SPA bundles, no scripts other than JSON-LD
  const allScriptTags = [...landingHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const nonJsonLdScripts = allScriptTags.filter(match => {
    const attrs = match[1] || '';
    return !/type=["']application\/ld\+json["']/i.test(attrs);
  });

  check('Architecture', 'Zero SPA bundle or external <script> tags',
    nonJsonLdScripts.length === 0,
    `Found ${nonJsonLdScripts.length} unexpected <script> tag(s). Only application/ld+json is permitted: ${nonJsonLdScripts.map(m => m[0].slice(0, 80)).join('; ')}`);

  check('Architecture', 'No references to React or SPA bundle files',
    !/assets\/index-[^"']+\.js/i.test(landingHtml) && !/registerSW\.js/i.test(landingHtml),
    'Found references to Vite/React SPA bundle or service worker registration in landing page');

  // Stylesheet isolation: no external CSS or external font links
  const stylesheetLinks = [...landingHtml.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi)];
  check('Architecture', 'Zero external stylesheet <link> tags',
    stylesheetLinks.length === 0,
    `Found ${stylesheetLinks.length} <link rel="stylesheet"> tag(s). Page must use self-contained inline CSS: ${stylesheetLinks.map(m => m[0]).join('; ')}`);

  const externalFontLinks = [...landingHtml.matchAll(/<link\b[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>/gi)];
  check('Architecture', 'Zero external font links',
    externalFontLinks.length === 0,
    `External font link found: ${externalFontLinks.map(m => m[0]).join('; ')}`);

  const inlineStyleMatch = landingHtml.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  check('Architecture', 'Self-contained inline <style> present',
    Boolean(inlineStyleMatch && inlineStyleMatch[1].trim().length > 100),
    'Inline <style> tag missing or empty');

  // ──────────────────────────────────────────────────────────────────────────
  // Category 3: Head & SEO Metadata (PRD §4.1, §4.2, §15.2, §16.7-10)
  // ──────────────────────────────────────────────────────────────────────────
  const titleMatches = [...landingHtml.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  check('SEO Metadata', 'Exactly one <title> element',
    titleMatches.length === 1,
    `Expected exactly 1 <title> tag, found ${titleMatches.length}`);

  const pageTitle = titleMatches[0] ? unescapeHtml(titleMatches[0][1].trim()) : '';
  check('SEO Metadata', 'Title matches PRD §4.1 exactly',
    pageTitle === PRD_TITLE,
    `Title mismatch.\nExpected: "${PRD_TITLE}"\nActual:   "${pageTitle}"`);

  const metaDescMatches = [...landingHtml.matchAll(/<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/gi)];
  check('SEO Metadata', 'Exactly one meta description element',
    metaDescMatches.length === 1,
    `Expected exactly 1 meta description tag, found ${metaDescMatches.length}`);

  const metaDesc = metaDescMatches[0] ? unescapeHtml(metaDescMatches[0][1].trim()) : '';
  check('SEO Metadata', 'Meta description matches PRD §4.2 exactly',
    metaDesc === PRD_META_DESCRIPTION,
    `Meta description mismatch.\nExpected: "${PRD_META_DESCRIPTION}"\nActual:   "${metaDesc}"`);

  // Canonical tag: strictly origin-based, ignoring subpaths, exact URL
  const canonicalMatches = [...landingHtml.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']*)["'][^>]*>/gi)];
  check('SEO Metadata', 'Exactly one canonical <link> element',
    canonicalMatches.length === 1,
    `Expected exactly 1 canonical tag, found ${canonicalMatches.length}`);

  const canonicalUrl = canonicalMatches[0] ? canonicalMatches[0][1].trim() : '';
  const expectedCanonical = `${origin}/popular-currency-pairs/`;
  check('SEO Metadata', 'Canonical tag matches expected production URL',
    canonicalUrl === expectedCanonical,
    `Canonical URL mismatch.\nExpected: "${expectedCanonical}"\nActual:   "${canonicalUrl}"`);

  // Meta robots
  const robotsMetaMatches = [...landingHtml.matchAll(/<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/gi)];
  check('SEO Metadata', 'Exactly one meta robots element',
    robotsMetaMatches.length === 1,
    `Expected exactly 1 meta robots tag, found ${robotsMetaMatches.length}`);

  const robotsMetaContent = robotsMetaMatches[0] ? robotsMetaMatches[0][1].trim().toLowerCase() : '';
  if (isStaging) {
    check('SEO Metadata', 'Staging meta robots is "noindex, nofollow"',
      robotsMetaContent === 'noindex, nofollow',
      `Expected "noindex, nofollow" in staging, got "${robotsMetaContent}"`);
    check('SEO Metadata', 'Staging contains no index directives',
      !robotsMetaContent.includes('index') || robotsMetaContent.includes('noindex'),
      'Staging meta robots contains "index" directive');
  } else {
    check('SEO Metadata', 'Production meta robots is "index, follow"',
      robotsMetaContent === 'index, follow',
      `Expected "index, follow" in production, got "${robotsMetaContent}"`);
    check('SEO Metadata', 'Production contains no noindex directives',
      !landingHtml.includes('noindex'),
      'Production HTML contains unexpected "noindex" string');
  }

  // Open Graph and Twitter Card tags
  check('SEO Metadata', 'og:type is website',
    /<meta\b[^>]*\bproperty=["']og:type["'][^>]*\bcontent=["']website["']/i.test(landingHtml),
    'og:type website meta tag missing');
  check('SEO Metadata', 'og:site_name is Skolko',
    /<meta\b[^>]*\bproperty=["']og:site_name["'][^>]*\bcontent=["']Skolko["']/i.test(landingHtml),
    'og:site_name Skolko meta tag missing');
  check('SEO Metadata', 'og:url matches canonical',
    new RegExp(`<meta\\b[^>]*\\bproperty=["']og:url["'][^>]*\\bcontent=["']${expectedCanonical}["']`, 'i').test(landingHtml),
    `og:url must equal ${expectedCanonical}`);
  check('SEO Metadata', 'twitter:card is summary',
    /<meta\b[^>]*\bname=["']twitter:card["'][^>]*\bcontent=["']summary["']/i.test(landingHtml),
    'twitter:card summary meta tag missing');

  // ──────────────────────────────────────────────────────────────────────────
  // Category 4: Structured Data (JSON-LD) Verification (PRD §15.2, §16.12)
  // ──────────────────────────────────────────────────────────────────────────
  const jsonLdMatch = landingHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  check('Structured Data', 'JSON-LD script block exists',
    Boolean(jsonLdMatch),
    'Missing <script type="application/ld+json"> tag');

  let jsonLd = null;
  if (jsonLdMatch) {
    try {
      jsonLd = JSON.parse(jsonLdMatch[1]);
      check('Structured Data', 'JSON-LD parses as valid JSON', true);
    } catch (err) {
      check('Structured Data', 'JSON-LD parses as valid JSON', false,
        `JSON parse error: ${err.message}`);
    }
  }

  if (jsonLd) {
    check('Structured Data', '@context is https://schema.org',
      jsonLd['@context'] === 'https://schema.org',
      `Expected @context "https://schema.org", got "${jsonLd['@context']}"`);

    const graph = Array.isArray(jsonLd['@graph']) ? jsonLd['@graph'] : [];
    check('Structured Data', '@graph contains 3 top-level items',
      graph.length === 3,
      `Expected 3 items in @graph, got ${graph.length}`);

    const webPage = graph.find(item => item['@type'] === 'WebPage');
    const itemList = graph.find(item => item['@type'] === 'ItemList');
    const softwareApp = graph.find(item => item['@type'] === 'SoftwareApplication');

    // WebPage checks
    check('Structured Data', 'WebPage entity exists in @graph', Boolean(webPage), 'WebPage entity missing');
    if (webPage) {
      check('Structured Data', 'WebPage @id matches canonical URL',
        webPage['@id'] === expectedCanonical,
        `WebPage @id mismatch: "${webPage['@id']}" vs "${expectedCanonical}"`);
      check('Structured Data', 'WebPage name matches title',
        webPage.name === PRD_TITLE,
        `WebPage name mismatch: "${webPage.name}"`);
      check('Structured Data', 'WebPage description matches meta description',
        webPage.description === PRD_META_DESCRIPTION,
        'WebPage description mismatch');
      check('Structured Data', 'WebPage mainEntity points to ItemList #popular-currency-pairs',
        webPage.mainEntity?.['@id'] === `${expectedCanonical}#popular-currency-pairs`,
        `mainEntity @id mismatch: ${webPage.mainEntity?.['@id']}`);
    }

    // ItemList checks
    check('Structured Data', 'ItemList entity exists in @graph', Boolean(itemList), 'ItemList entity missing');
    if (itemList) {
      check('Structured Data', 'ItemList numberOfItems is 30',
        itemList.numberOfItems === 30,
        `Expected numberOfItems 30, got ${itemList.numberOfItems}`);

      const items = Array.isArray(itemList.itemListElement) ? itemList.itemListElement : [];
      check('Structured Data', 'ItemList itemListElement contains exactly 30 items',
        items.length === 30,
        `Expected 30 items in itemListElement, got ${items.length}`);

      let positionsValid = items.length === 30;
      let urlsValid = items.length === 30;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const expectedPair = PRD_ALL_PAIRS[i];
        if (item.position !== i + 1) positionsValid = false;
        const expectedUrl = `${origin}${basePath}?c=${expectedPair.from}:1&c=${expectedPair.to}`;
        if (item.url !== expectedUrl) urlsValid = false;
      }

      check('Structured Data', 'ItemList positions are strictly 1..30 in sequence',
        positionsValid,
        'ItemList positions do not match 1..30 in sequence');

      check('Structured Data', 'ItemList URLs match origin + base path + query params',
        urlsValid,
        'ItemList URLs do not match expected conversion URLs');
    }

    // SoftwareApplication checks
    check('Structured Data', 'SoftwareApplication entity exists in @graph',
      Boolean(softwareApp),
      'SoftwareApplication entity missing');
    if (softwareApp) {
      check('Structured Data', 'SoftwareApplication name is Skolko',
        softwareApp.name === 'Skolko',
        `Expected name "Skolko", got "${softwareApp.name}"`);
      check('Structured Data', 'SoftwareApplication applicationCategory is FinanceApplication',
        softwareApp.applicationCategory === 'FinanceApplication',
        `Expected FinanceApplication, got "${softwareApp.applicationCategory}"`);
      check('Structured Data', 'SoftwareApplication contains no invented ratings',
        !softwareApp.aggregateRating,
        'SoftwareApplication contains unapproved aggregateRating');
      check('Structured Data', 'SoftwareApplication URL points to converter',
        softwareApp.url === `${origin}${basePath}`,
        `Expected url "${origin}${basePath}", got "${softwareApp.url}"`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Category 5: Content, Headings & Pairs Verification (PRD §4, §15.3, §16)
  // ──────────────────────────────────────────────────────────────────────────
  const h1Match = landingHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1Match ? unescapeHtml(h1Match[1].trim()) : '';
  check('Content', 'H1 matches PRD §4.3',
    h1Text === PRD_MAIN_HEADING,
    `H1 mismatch.\nExpected: "${PRD_MAIN_HEADING}"\nActual:   "${h1Text}"`);

  check('Content', 'Hero contains lead paragraph from PRD §4.4',
    landingHtml.includes(PRD_HERO_LEAD),
    'Hero section missing expected lead copy from PRD §4.4');

  // Hero CTA link
  const normalizedAppPath = normalizeBasePath(basePath);
  const expectedHeroHref = `${normalizedAppPath}?c=USD:1&c=EUR`;
  const escapedHeroHref = expectedHeroHref.replaceAll('&', '&amp;');
  check('Content', 'Hero CTA button points to ?c=USD:1&c=EUR',
    landingHtml.includes(`href="${escapedHeroHref}"`) ||
    landingHtml.includes(`href="${expectedHeroHref}"`) ||
    landingHtml.includes(`href="?c=USD:1&amp;c=EUR"`) ||
    landingHtml.includes(`href="?c=USD:1&c=EUR"`),
    `Hero CTA button href not found. Expected href to include "${expectedHeroHref}"`);

  // Extract all pair cards from the ordered list
  const pairCardRegex = /<li class="pair-card">[\s\S]*?<span class="pair-rank">(\d+)<\/span>[\s\S]*?<span class="pair-ticker">([^<]+)<\/span>[\s\S]*?<span class="pair-names">([^<]+)<\/span>[\s\S]*?<p class="pair-description">([^<]+)<\/p>[\s\S]*?<a class="pair-link" href="([^"]+)">([^<]+)<\/a>[\s\S]*?<\/li>/g;
  const parsedCards = [];
  for (const match of landingHtml.matchAll(pairCardRegex)) {
    parsedCards.push({
      rank: parseInt(match[1], 10),
      ticker: unescapeHtml(match[2].trim()),
      names: unescapeHtml(match[3].trim()),
      description: unescapeHtml(match[4].trim()),
      href: unescapeHtml(match[5].trim()),
      linkText: unescapeHtml(match[6].trim()),
    });
  }

  check('Content', 'Exactly 30 pair cards in ordered list',
    parsedCards.length === 30,
    `Expected exactly 30 pair cards, found ${parsedCards.length}`);

  // Continuous ranks 1 through 30
  const ranks = parsedCards.map(c => c.rank);
  const ranksValid = ranks.length === 30 && ranks.every((r, idx) => r === idx + 1);
  check('Content', 'Pair ranks are continuous 1 through 30',
    ranksValid,
    `Ranks are not 1..30 in sequence: [${ranks.join(', ')}]`);

  // Verify first 20 fiat pairs match PRD §4.5.1
  let fiatMatchesAll = parsedCards.length >= 20;
  const fiatMismatches = [];
  for (let i = 0; i < Math.min(20, parsedCards.length); i++) {
    const actual = parsedCards[i];
    const expected = PRD_FIAT_PAIRS[i];
    const expectedTicker = `${expected.from}/${expected.to}`;
    const expectedNames = `${expected.fromName} / ${expected.toName}`;
    if (actual.ticker !== expectedTicker || actual.names !== expectedNames) {
      fiatMatchesAll = false;
      fiatMismatches.push(`Rank ${actual.rank}: expected ${expectedTicker} (${expectedNames}), got ${actual.ticker} (${actual.names})`);
    }
  }
  check('Content', 'First 20 pairs match PRD §4.5.1 fiat list in order',
    fiatMatchesAll,
    `Fiat pairs mismatch:\n  ${fiatMismatches.join('\n  ')}`);

  // Verify last 10 crypto pairs match PRD §4.5.2
  let cryptoMatchesAll = parsedCards.length === 30;
  const cryptoMismatches = [];
  for (let i = 20; i < parsedCards.length; i++) {
    const actual = parsedCards[i];
    const expected = PRD_CRYPTO_PAIRS[i - 20];
    const expectedTicker = `${expected.from}/${expected.to}`;
    const expectedNames = `${expected.fromName} / ${expected.toName}`;
    if (actual.ticker !== expectedTicker || actual.names !== expectedNames) {
      cryptoMatchesAll = false;
      cryptoMismatches.push(`Rank ${actual.rank}: expected ${expectedTicker} (${expectedNames}), got ${actual.ticker} (${actual.names})`);
    }
  }
  check('Content', 'Last 10 pairs match PRD §4.5.2 crypto list in order',
    cryptoMatchesAll,
    `Crypto pairs mismatch:\n  ${cryptoMismatches.join('\n  ')}`);

  // All currency symbols exist in Coinbase asset registry
  const knownSymbolSet = new Set(COINBASE_KNOWN_SYMBOLS);
  check('Content', 'Asset registry contains exactly 24 Coinbase symbols',
    knownSymbolSet.size === 24,
    `Expected 24 known Coinbase symbols, got ${knownSymbolSet.size}`);

  const unknownSymbols = [];
  for (const card of parsedCards) {
    const parts = card.ticker.split('/');
    for (const sym of parts) {
      if (!knownSymbolSet.has(sym)) {
        unknownSymbols.push(`${sym} in pair ${card.ticker}`);
      }
    }
  }

  // Also verify symbols in JSON-LD item URLs if present
  if (jsonLd) {
    const itemList = jsonLd['@graph']?.find(item => item['@type'] === 'ItemList');
    if (itemList?.itemListElement) {
      for (const item of itemList.itemListElement) {
        if (typeof item.url === 'string') {
          const match = item.url.match(/[?&]c=([^:]+):1&c=([^&]+)/);
          if (match) {
            const [, from, to] = match;
            if (!knownSymbolSet.has(from)) unknownSymbols.push(`${from} in JSON-LD`);
            if (!knownSymbolSet.has(to)) unknownSymbols.push(`${to} in JSON-LD`);
          }
        }
      }
    }
  }

  check('Content', 'All pair symbols exist in 24 Coinbase known symbols',
    unknownSymbols.length === 0,
    `Found unknown currency symbol(s): ${unknownSymbols.join(', ')}`);

  // Descriptions: unique, non-empty, >= 50 chars
  const descriptions = parsedCards.map(c => c.description);
  const uniqueDescriptions = new Set(descriptions);
  check('Content', 'All 30 descriptions are unique',
    uniqueDescriptions.size === 30,
    `Expected 30 unique descriptions, got ${uniqueDescriptions.size} unique`);

  const shortDescriptions = parsedCards.filter(c => c.description.length < 50);
  check('Content', 'All descriptions have length >= 50 characters',
    shortDescriptions.length === 0,
    `Descriptions under 50 characters found for ranks: ${shortDescriptions.map(c => c.rank).join(', ')}`);

  // Conversion links (PRD §15.4)
  const invalidLinks = [];
  for (let i = 0; i < parsedCards.length; i++) {
    const card = parsedCards[i];
    const expectedPair = PRD_ALL_PAIRS[i];
    if (!expectedPair) continue;
    const expectedHref = `${basePath}?c=${expectedPair.from}:1&c=${expectedPair.to}`;
    if (card.href !== expectedHref) {
      invalidLinks.push(`Rank ${card.rank}: expected href "${expectedHref}", got "${card.href}"`);
    }
  }
  check('Links', 'All 30 conversion links have valid ?c=FROM:1&c=TO format with base path',
    invalidLinks.length === 0,
    `Invalid conversion links:\n  ${invalidLinks.join('\n  ')}`);

  // About section
  const aboutMatch = landingHtml.match(/<section id="about"[^>]*>([\s\S]*?)<\/section>/i);
  check('Content', 'About section exists with PRD heading',
    Boolean(aboutMatch && aboutMatch[1].includes(PRD_ABOUT_HEADING)),
    'About section missing or heading mismatch');

  if (aboutMatch) {
    const aboutContent = aboutMatch[1].toLowerCase();
    check('Content', 'About section describes fiat, crypto, and offline access',
      aboutContent.includes('fiat') && aboutContent.includes('crypto') && aboutContent.includes('offline'),
      'About section must mention fiat currencies, cryptocurrencies, and offline access');
  }

  // FAQ section
  const faqItemRegex = /<article class="faq-item">[\s\S]*?<h3>([^<]+)<\/h3>[\s\S]*?<p>([^<]+)<\/p>[\s\S]*?<\/article>/g;
  const parsedFaqs = [];
  for (const match of landingHtml.matchAll(faqItemRegex)) {
    parsedFaqs.push({
      question: unescapeHtml(match[1].trim()),
      answer: unescapeHtml(match[2].trim()),
    });
  }
  check('Content', 'Exactly 4 FAQ items are present',
    parsedFaqs.length === 4,
    `Expected 4 FAQ items, found ${parsedFaqs.length}`);

  for (const expectedQuestion of PRD_FAQ_QUESTIONS) {
    check('Content', `FAQ includes "${expectedQuestion}"`,
      parsedFaqs.some(f => f.question === expectedQuestion),
      `Expected FAQ question "${expectedQuestion}" was not found`);
  }

  // Header, Footer and Final CTA
  check('Content', 'Header brand and navigation link back to converter root',
    landingHtml.includes(`class="brand" href="${basePath}"`) &&
    landingHtml.includes(`<nav class="site-nav"`),
    `Header brand must link to "${basePath}"`);

  check('Content', 'Footer links back to converter root',
    landingHtml.includes(`class="site-footer"`) && landingHtml.includes(`href="${basePath}">Open the currency converter</a>`),
    `Footer must contain converter link to "${basePath}"`);

  // ──────────────────────────────────────────────────────────────────────────
  // Category 6: Auxiliary Discovery Files (PRD §15.2, §15.5)
  // ──────────────────────────────────────────────────────────────────────────

  // robots.txt verification
  if (robotsExists) {
    if (isStaging) {
      check('Robots.txt', 'Staging robots.txt contains Disallow: /',
        robotsTxt.includes('Disallow: /'),
        'Staging robots.txt must contain "Disallow: /"');
      check('Robots.txt', 'Staging robots.txt omits Sitemap reference',
        !robotsTxt.toLowerCase().includes('sitemap:'),
        'Staging robots.txt must NOT reference sitemap.xml');
    } else {
      for (const bot of PRD_CRAWLER_BOTS) {
        check('Robots.txt', `Production robots.txt allows ${bot}`,
          new RegExp(`User-agent:\\s*${bot}[\\s\\S]*?Allow:\\s*\\/`, 'i').test(robotsTxt),
          `Production robots.txt must explicitly allow ${bot}`);
      }

      check('Robots.txt', 'Production robots.txt includes Sitemap directive',
        robotsTxt.includes(`Sitemap: ${origin}/sitemap.xml`),
        `Expected "Sitemap: ${origin}/sitemap.xml" in production robots.txt`);

      check('Robots.txt', 'Production robots.txt does NOT disallow root or landing page',
        !/Disallow:\s*\/\s*$/m.test(robotsTxt) && !/Disallow:\s*\/popular-currency-pairs/m.test(robotsTxt),
        'Production robots.txt contains unexpected Disallow directive for / or /popular-currency-pairs/');
    }
  }

  // llms.txt verification
  if (llmsExists) {
    check('llms.txt', 'llms.txt starts with # Skolko header',
      llmsTxt.trim().startsWith('# Skolko'),
      'llms.txt must start with "# Skolko"');

    check('llms.txt', 'llms.txt describes offline support and converter',
      llmsTxt.toLowerCase().includes('offline') && llmsTxt.toLowerCase().includes('converter'),
      'llms.txt missing description of converter or offline capability');

    check('llms.txt', 'llms.txt links to main converter',
      llmsTxt.includes(`${origin}${basePath}`),
      `llms.txt must contain link to main converter: ${origin}${basePath}`);

    check('llms.txt', 'llms.txt links to landing page guide',
      llmsTxt.includes(`${origin}/popular-currency-pairs/`),
      `llms.txt must contain link to ${origin}/popular-currency-pairs/`);

    check('llms.txt', 'llms.txt contains popular pairs list',
      llmsTxt.includes('EUR/USD') && llmsTxt.includes('BTC/USD') && llmsTxt.includes('ETH/BTC'),
      'llms.txt missing representative popular pair entries');
  }

  // sitemap.xml verification (production only)
  if (!isStaging && sitemapExists) {
    check('Sitemap.xml', 'sitemap.xml starts with XML declaration',
      sitemapXml.trim().startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
      'sitemap.xml must begin with <?xml version="1.0" encoding="UTF-8"?>');

    check('Sitemap.xml', 'sitemap.xml has valid <urlset> schema',
      sitemapXml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),
      'sitemap.xml missing standard sitemaps.org namespace');

    const expectedRootLoc = `${origin}/`;
    const expectedGuideLoc = `${origin}/popular-currency-pairs/`;

    check('Sitemap.xml', `sitemap.xml contains root URL <loc>${expectedRootLoc}</loc>`,
      sitemapXml.includes(`<loc>${expectedRootLoc}</loc>`),
      `Missing root loc: <loc>${expectedRootLoc}</loc>`);

    check('Sitemap.xml', `sitemap.xml contains landing page <loc>${expectedGuideLoc}</loc>`,
      sitemapXml.includes(`<loc>${expectedGuideLoc}</loc>`),
      `Missing landing page loc: <loc>${expectedGuideLoc}</loc>`);

    const locMatches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)];
    check('Sitemap.xml', 'sitemap.xml contains exactly 2 URLs',
      locMatches.length === 2,
      `Expected exactly 2 <loc> entries, found ${locMatches.length}`);

    const lastmodMatches = [...sitemapXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)];
    const validLastmods = lastmodMatches.every(m => /^\d{4}-\d{2}-\d{2}$/.test(m[1]));
    check('Sitemap.xml', 'sitemap.xml <lastmod> entries are valid YYYY-MM-DD',
      lastmodMatches.length === 2 && validLastmods,
      'Invalid or missing <lastmod> dates in sitemap.xml');
  }

  const passedCount = checks.filter(c => c.passed).length;
  const failedCount = checks.filter(c => !c.passed).length;

  return {
    success: failedCount === 0,
    checks,
    errors,
    warnings,
    passedCount,
    failedCount,
    totalCount: checks.length,
  };
}

// ============================================================================
// CLI Entry Point
// ============================================================================

/**
 * Parses CLI command-line arguments.
 * @param {string[]} argv
 */
export function parseCliArgs(argv = process.argv.slice(2)) {
  const options = {
    targetDir: 'dist',
    isStaging: false,
    origin: undefined,
    basePath: undefined,
    quiet: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--staging') {
      options.isStaging = true;
    } else if (arg === '--quiet') {
      options.quiet = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--origin=')) {
      options.origin = arg.slice('--origin='.length);
    } else if (arg === '--origin' && i + 1 < argv.length) {
      options.origin = argv[++i];
    } else if (arg.startsWith('--base-path=')) {
      options.basePath = arg.slice('--base-path='.length);
    } else if (arg === '--base-path' && i + 1 < argv.length) {
      options.basePath = argv[++i];
    } else if (!arg.startsWith('-')) {
      options.targetDir = arg;
    }
  }

  return options;
}

export function printHelp() {
  console.log(`
verify-seo-page: PRD Acceptance Test Suite for Skolko SEO Landing Page

Usage:
  node scripts/verify-seo-page.mjs [targetDir] [options]

Arguments:
  targetDir            Path to the build output directory (default: ./dist)

Options:
  --staging            Verify staging build rules (noindex, Disallow: /, no sitemap)
  --origin <url>       Site origin for canonical & sitemap URLs (default: https://skolko.lx.deno.net)
  --base-path <path>   Base path for in-page links (default: /)
  --quiet              Suppress passing check output
  --help, -h           Show this help message
`);
}

const isDirectRun = process.argv[1] !== undefined
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const modeLabel = args.isStaging ? 'STAGING' : 'PRODUCTION';
  console.log(`\n🔍 Verifying SEO artifacts [${modeLabel}] in "${args.targetDir}"...\n`);

  const result = await verifySeoBuild(args);

  // Group checks by category for clear reporting
  const categories = {};
  for (const c of result.checks) {
    categories[c.category] = categories[c.category] || [];
    categories[c.category].push(c);
  }

  for (const [catName, catChecks] of Object.entries(categories)) {
    console.log(`━━━ ${catName} ━━━`);
    for (const c of catChecks) {
      if (c.passed) {
        if (!args.quiet) {
          console.log(`  ✓ ${c.name}`);
        }
      } else {
        console.log(`  ✗ ${c.name}`);
        if (c.error) {
          console.log(`    ↳ Error: ${c.error.replace(/\n/g, '\n      ')}`);
        }
      }
    }
    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Summary: ${result.passedCount}/${result.totalCount} checks passed, ${result.failedCount} failed.`);

  if (result.success) {
    console.log(`\n🎉 ALL PRD ACCEPTANCE CHECKS PASSED for ${modeLabel} build!\n`);
    process.exit(0);
  } else {
    console.error(`\n💥 VERIFICATION FAILED with ${result.failedCount} error(s):\n`);
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    console.error();
    process.exit(1);
  }
}
