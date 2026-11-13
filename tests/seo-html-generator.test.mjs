import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateLandingPageHtml } from '../scripts/generate-html.mjs';
import { POPULAR_PAIRS, FAQ_ITEMS } from '../scripts/seo-pairs-data.mjs';

const ORIGIN = 'https://skolko.example.com';
const TITLE = 'Popular Currency Pairs to Convert | Fiat & Crypto Converter';
const META_DESCRIPTION =
  'Explore 30 popular fiat and cryptocurrency conversion pairs. Discover commonly used ' +
  'currency combinations and convert currencies instantly with Skolko.';

const productionHtml = generateLandingPageHtml({
  origin: ORIGIN,
  basePath: '/',
  isStaging: false,
});

const emptyBasePathHtml = generateLandingPageHtml({
  origin: ORIGIN,
  basePath: '',
  isStaging: false,
});

const stagingHtml = generateLandingPageHtml({
  origin: `${ORIGIN}///`,
  basePath: '/skolko',
  isStaging: true,
});

/** Returns the content of `<meta name|property="{key}">`, or undefined. */
function metaContent(html, key) {
  const pattern = new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`);
  const match = html.match(pattern);
  return match?.[1];
}

/** Returns the inner HTML of the first `<section id="{id}">`, or undefined. */
function sectionHtml(html, id) {
  return html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))?.[0];
}

function jsonLdGraph(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'expected a JSON-LD script tag');
  const data = JSON.parse(match[1]);
  assert.ok(Array.isArray(data['@graph']), 'expected JSON-LD @graph array');
  return data['@graph'];
}

// --- document shell ---

test('emits a standalone HTML5 document in English', () => {
  assert.ok(productionHtml.startsWith('<!DOCTYPE html>'), 'expected an HTML5 doctype');
  assert.ok(productionHtml.includes('<html lang="en">'), 'expected lang="en"');
  assert.ok(productionHtml.trimEnd().endsWith('</html>'), 'expected a closed document');
  assert.ok(
    productionHtml.includes('<meta charset="utf-8" />'),
    'expected a charset declaration',
  );
  assert.ok(
    productionHtml.includes('name="viewport"'),
    'expected a viewport declaration',
  );
});

// --- title & description ---

test('has the PRD page title', () => {
  assert.ok(
    productionHtml.includes(`<title>${TITLE}</title>`),
    'expected the exact PRD title element',
  );
  assert.strictEqual(metaContent(productionHtml, 'og:title'), TITLE);
  assert.strictEqual(metaContent(productionHtml, 'twitter:title'), TITLE);
});

test('has the PRD meta description', () => {
  assert.strictEqual(metaContent(productionHtml, 'description'), META_DESCRIPTION);
  assert.strictEqual(metaContent(productionHtml, 'og:description'), META_DESCRIPTION);
  assert.strictEqual(metaContent(productionHtml, 'twitter:description'), META_DESCRIPTION);
});

// --- canonical + robots ---

test('canonical URL is origin based and ignores the base path', () => {
  const canonical = `${ORIGIN}/popular-currency-pairs/`;
  assert.ok(
    productionHtml.includes(`<link rel="canonical" href="${canonical}" />`),
    'expected the canonical link element',
  );
  assert.strictEqual(metaContent(productionHtml, 'og:url'), canonical);
  assert.ok(
    stagingHtml.includes(`<link rel="canonical" href="${canonical}" />`),
    'staging must still advertise the production canonical URL',
  );
});

test('canonical URL strips trailing slashes from the origin', () => {
  const canonical = productionHtml.match(/<link rel="canonical" href="([^"]+)" \/>/)?.[1];
  assert.strictEqual(canonical, `${ORIGIN}/popular-currency-pairs/`);

  const stagingCanonical = stagingHtml.match(/<link rel="canonical" href="([^"]+)" \/>/)?.[1];
  assert.strictEqual(stagingCanonical, `${ORIGIN}/popular-currency-pairs/`);
});

test('production is indexable and staging is not', () => {
  assert.strictEqual(metaContent(productionHtml, 'robots'), 'index, follow');
  assert.strictEqual(metaContent(stagingHtml, 'robots'), 'noindex, nofollow');
});

// --- open graph / twitter / icons ---

test('has Open Graph and Twitter card metadata', () => {
  assert.strictEqual(metaContent(productionHtml, 'og:type'), 'website');
  assert.strictEqual(metaContent(productionHtml, 'og:site_name'), 'Skolko');
  assert.strictEqual(metaContent(productionHtml, 'twitter:card'), 'summary');
});

test('references the existing Skolko favicons and touch icons', () => {
  assert.ok(productionHtml.includes('<link rel="icon" href="/favicon.ico"'), 'expected /favicon.ico');
  assert.ok(productionHtml.includes('href="/skolko.svg"'), 'expected the SVG favicon');
  assert.ok(
    productionHtml.includes('<link rel="apple-touch-icon" sizes="180x180" href="/pwa/apple-touch-icon.png" />'),
    'expected the apple touch icon',
  );
});

test('icon and image references respect the base path', () => {
  assert.ok(stagingHtml.includes('<link rel="icon" href="/skolko/favicon.ico"'), 'expected base-path favicon');
  assert.ok(
    stagingHtml.includes('href="/skolko/pwa/apple-touch-icon.png"'),
    'expected base-path apple touch icon',
  );
});

// --- self-contained assets ---

test('uses inline styles only, with no external resources', () => {
  assert.ok(productionHtml.includes('<style>'), 'expected an inline style element');
  assert.ok(!productionHtml.includes('<link rel="stylesheet"'), 'no external stylesheet allowed');
  assert.ok(!productionHtml.includes('@import'), 'no CSS imports allowed');
  assert.ok(!productionHtml.includes('fonts.googleapis'), 'no Google Fonts allowed');
  assert.ok(!productionHtml.includes('fonts.gstatic'), 'no font CDN allowed');
  assert.ok(!/<script[^>]+src=/.test(productionHtml), 'no external script allowed');
  assert.strictEqual(
    productionHtml.match(/<script/g)?.length,
    1,
    'the JSON-LD block must be the only script element',
  );

  const externalUrls = productionHtml.match(/https?:\/\/[^"'\s)]+/g) ?? [];
  for (const url of externalUrls) {
    assert.ok(
      url.startsWith('https://schema.org') || url.startsWith(ORIGIN),
      `unexpected external resource: ${url}`,
    );
  }
});

test('inline CSS implements the required accessibility and theming rules', () => {
  const css = productionHtml.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  assert.ok(css, 'expected inline CSS');

  assert.ok(
    css.includes("system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"),
    'expected the system font stack',
  );
  assert.ok(css.includes('@media (prefers-color-scheme: dark)'), 'expected dark mode support');
  assert.ok(css.includes(':root'), 'expected CSS custom properties');
  assert.ok(css.includes('--'), 'expected CSS variables');
  assert.ok(css.includes(':focus-visible'), 'expected visible focus indicators');
  assert.ok(css.includes('min-height: 44px'), 'expected 44px touch targets');
  assert.ok(css.includes('max-width'), 'expected a responsive container');
  assert.ok(css.includes('@media'), 'expected responsive media queries');
});

// --- structure ---

test('has semantic landmarks', () => {
  assert.ok(productionHtml.includes('<header'), 'expected a header landmark');
  assert.ok(productionHtml.includes('<main id="main">'), 'expected a main landmark');
  assert.ok(productionHtml.includes('<footer'), 'expected a footer landmark');
  assert.ok(productionHtml.includes('href="#main"'), 'expected a skip link');
});

test('hero contains the PRD heading, introduction and primary CTA', () => {
  const hero = sectionHtml(productionHtml, 'hero');
  assert.ok(hero, 'expected a hero section');
  assert.ok(
    hero.includes('<h1 id="hero-title">Popular Currency Pairs for Everyday Conversion</h1>'),
    'expected the H1',
  );
  assert.ok(hero.includes('Whether you'), 'expected the PRD introduction copy');
  assert.ok(
    hero.includes('<a class="button" href="/?c=USD:1&amp;c=EUR">Open Currency Converter</a>'),
    'expected the primary CTA to the default conversion',
  );
});

test('popular pairs section is an ordered list of exactly 30 entries', () => {
  const pairs = sectionHtml(productionHtml, 'popular-pairs');
  assert.ok(pairs, 'expected a popular pairs section');
  assert.ok(
    pairs.includes('<h2 id="pairs-title">Popular Currency Pairs to Convert</h2>'),
    'expected the pairs H2',
  );
  assert.ok(
    pairs.includes('<ol class="pair-list" role="list">'),
    'expected an ordered list that keeps its list semantics with list-style: none',
  );
  assert.strictEqual(pairs.match(/<li[ >]/g)?.length, 30, 'expected exactly 30 list items');
  assert.strictEqual(pairs.match(/<h3/g)?.length, 30, 'expected one H3 per pair');
  assert.strictEqual(productionHtml.match(/<li[ >]/g)?.length, 30, 'no other list items allowed');
});

test('every pair renders rank, ticker, names, description and conversion link', () => {
  for (const pair of POPULAR_PAIRS) {
    assert.ok(
      productionHtml.includes(`<span class="pair-rank">${pair.rank}</span>`),
      `rank ${pair.rank} badge is missing`,
    );
    assert.ok(
      productionHtml.includes(`<span class="pair-ticker">${pair.from}/${pair.to}</span>`),
      `${pair.from}/${pair.to} ticker is missing`,
    );
    assert.ok(
      productionHtml.includes(`<span class="pair-names">${pair.fromName} / ${pair.toName}</span>`),
      `${pair.from}/${pair.to} full names are missing`,
    );
    assert.ok(
      productionHtml.includes(pair.description),
      `${pair.from}/${pair.to} description is missing`,
    );
    assert.ok(
      productionHtml.includes(`href="/?c=${pair.from}:1&amp;c=${pair.to}"`),
      `${pair.from}/${pair.to} conversion link is missing`,
    );
  }
});

test('pair anchors carry descriptive link text', () => {
  assert.ok(
    productionHtml.includes('>Convert Euro (EUR) to US Dollar (USD)</a>'),
    'expected descriptive anchor text for EUR/USD',
  );
});

test('about section describes fiat, crypto and offline support', () => {
  const about = sectionHtml(productionHtml, 'about');
  assert.ok(about, 'expected an about section');
  assert.ok(
    about.includes('<h2 id="about-title">A Free Currency and Cryptocurrency Converter</h2>'),
    'expected the about H2',
  );
  assert.match(about, /fiat/i);
  assert.match(about, /crypto/i);
  assert.match(about, /offline/i);
});

test('FAQ section contains the four answer-oriented questions', () => {
  const faq = sectionHtml(productionHtml, 'faq');
  assert.ok(faq, 'expected a FAQ section');
  assert.ok(
    faq.includes('<h2 id="faq-title">Frequently Asked Questions</h2>'),
    'expected the FAQ H2',
  );
  assert.strictEqual(faq.match(/class="faq-item"/g)?.length, FAQ_ITEMS.length);
  assert.strictEqual(FAQ_ITEMS.length, 4);
  for (const item of FAQ_ITEMS) {
    assert.ok(faq.includes(item.question), `missing FAQ question: ${item.question}`);
    assert.ok(faq.includes(item.answer), `missing FAQ answer: ${item.question}`);
  }
});

test('final CTA links back to the converter', () => {
  const finalCta = sectionHtml(productionHtml, 'final-cta');
  assert.ok(finalCta, 'expected a final CTA section');
  assert.ok(
    finalCta.includes('<h2 id="final-cta-title">Convert Currencies Instantly with Skolko</h2>'),
    'expected the final CTA H2',
  );
  assert.ok(
    finalCta.includes('<a class="button" href="/">Try Skolko Currency Converter</a>'),
    'expected the final CTA link to the converter',
  );
});

test('header and footer link back to the converter root', () => {
  const header = productionHtml.match(/<header[\s\S]*?<\/header>/)?.[0];
  assert.ok(header?.includes('href="/"'), 'expected a brand link to the app root');
  const footer = productionHtml.match(/<footer[\s\S]*?<\/footer>/)?.[0];
  assert.ok(footer?.includes('href="/"'), 'expected a footer link to the app root');
});

// --- base path handling ---

test('conversion links respect a non-root base path', () => {
  assert.ok(
    stagingHtml.includes('href="/skolko/?c=EUR:1&amp;c=USD"'),
    'expected the EUR/USD link under /skolko/',
  );
  assert.ok(
    stagingHtml.includes('<a class="button" href="/skolko/?c=USD:1&amp;c=EUR">Open Currency Converter</a>'),
    'expected the hero CTA under /skolko/',
  );
  assert.ok(
    stagingHtml.includes('<a class="button" href="/skolko/">Try Skolko Currency Converter</a>'),
    'expected the final CTA under /skolko/',
  );
});

test('an empty base path falls back to the site root', () => {
  assert.ok(
    emptyBasePathHtml.includes('href="/?c=EUR:1&amp;c=USD"'),
    'expected the EUR/USD link at the root',
  );
  assert.ok(
    emptyBasePathHtml.includes('<a class="button" href="/?c=USD:1&amp;c=EUR">Open Currency Converter</a>'),
    'expected the hero CTA at the root',
  );
});

// --- JSON-LD ---

test('JSON-LD graph contains WebPage, ItemList and SoftwareApplication', () => {
  const graph = jsonLdGraph(productionHtml);
  const types = graph.map(node => node['@type']);
  assert.deepStrictEqual(types, ['WebPage', 'ItemList', 'SoftwareApplication']);
});

test('JSON-LD WebPage describes the landing page', () => {
  const [webPage] = jsonLdGraph(productionHtml);
  assert.strictEqual(webPage['@type'], 'WebPage');
  assert.strictEqual(webPage.name, TITLE);
  assert.strictEqual(webPage.description, META_DESCRIPTION);
  assert.strictEqual(webPage.url, `${ORIGIN}/popular-currency-pairs/`);
  assert.strictEqual(webPage.inLanguage, 'en');
});

test('JSON-LD WebPage mainEntity points at the attached ItemList', () => {
  const [webPage, itemList] = jsonLdGraph(productionHtml);
  assert.ok(itemList['@id'], 'expected the ItemList to carry an @id');
  assert.deepStrictEqual(webPage.mainEntity, { '@id': itemList['@id'] });
});

test('JSON-LD ItemList mirrors all 30 pairs in rank order', () => {
  const itemList = jsonLdGraph(productionHtml)[1];
  assert.strictEqual(itemList['@type'], 'ItemList');
  assert.strictEqual(itemList.name, 'Popular Currency Pairs');
  assert.strictEqual(itemList.numberOfItems, 30);
  assert.strictEqual(itemList.itemListElement.length, 30);

  for (const [index, pair] of POPULAR_PAIRS.entries()) {
    const item = itemList.itemListElement[index];
    assert.strictEqual(item['@type'], 'ListItem');
    assert.strictEqual(item.position, pair.rank);
    assert.ok(item.name.includes(pair.fromName), `item ${pair.rank} name is missing the source name`);
    assert.ok(item.name.includes(pair.toName), `item ${pair.rank} name is missing the target name`);
    assert.strictEqual(item.description, pair.description);
    assert.strictEqual(item.url, `${ORIGIN}/?c=${pair.from}:1&c=${pair.to}`);
  }
});

test('JSON-LD SoftwareApplication describes Skolko without invented ratings', () => {
  const app = jsonLdGraph(productionHtml)[2];
  assert.strictEqual(app['@type'], 'SoftwareApplication');
  assert.strictEqual(app.name, 'Skolko');
  assert.strictEqual(app.applicationCategory, 'FinanceApplication');
  assert.strictEqual(app.operatingSystem, 'Any');
  assert.strictEqual(app.url, `${ORIGIN}/`);
  assert.ok(typeof app.description === 'string' && app.description.length > 0);
  assert.ok(!('aggregateRating' in app), 'must not invent ratings');
  assert.ok(!('review' in app), 'must not invent reviews');
});

test('JSON-LD URLs respect the base path', () => {
  const itemList = jsonLdGraph(stagingHtml)[1];
  assert.strictEqual(itemList.itemListElement[0].url, `${ORIGIN}/skolko/?c=EUR:1&c=USD`);
  assert.strictEqual(jsonLdGraph(stagingHtml)[2].url, `${ORIGIN}/skolko/`);
});

test('JSON-LD cannot terminate its own script element', () => {
  const raw = productionHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(raw, 'expected the JSON-LD payload');
  assert.ok(!raw.includes('<'), 'every "<" must be escaped inside the JSON-LD script');
  jsonLdGraph(productionHtml);
});
