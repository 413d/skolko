/**
 * generate-html.mjs
 *
 * Renders the standalone `/popular-currency-pairs/` landing page as a single
 * self-contained HTML document: no SPA bundle, no external CSS or fonts, no
 * runtime JavaScript beyond the JSON-LD data block.
 */

import { POPULAR_PAIRS, FAQ_ITEMS } from './seo-pairs-data.mjs';

const PAGE_TITLE = 'Popular Currency Pairs to Convert | Fiat & Crypto Converter';
const PAGE_DESCRIPTION =
  'Explore 30 popular fiat and cryptocurrency conversion pairs. Discover commonly used ' +
  'currency combinations and convert currencies instantly with Skolko.';
const LANDING_PATH = '/popular-currency-pairs/';
const HERO_PATH = '?from=USD&to=EUR';

/** Escapes text-node content. Quotes stay literal so copy reads unchanged. */
const escapeText = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

/** Escapes attribute values. */
const escapeAttribute = (value) => escapeText(value).replaceAll('"', '&quot;');

/** Normalizes any base path shape into `/`, `/repo/`, etc. */
function normalizeBasePath(basePath) {
  const segment = String(basePath ?? '').trim().replace(/^\/+|\/+$/g, '');
  return segment ? `/${segment}/` : '/';
}

const renderPair = (pair, appPath) => {
  const ticker = `${pair.from}/${pair.to}`;
  const href = escapeAttribute(`${appPath}?from=${pair.from}&to=${pair.to}`);
  return `            <li class="pair-card">
              <span class="pair-rank">${pair.rank}</span>
              <div class="pair-body">
                <h3 class="pair-heading">
                  <span class="pair-ticker">${escapeText(ticker)}</span>
                  <span class="pair-names">${escapeText(pair.fromName)} / ${escapeText(pair.toName)}</span>
                </h3>
                <p class="pair-description">${escapeText(pair.description)}</p>
                <a class="pair-link" href="${href}">Convert ${escapeText(pair.fromName)} (${escapeText(pair.from)}) to ${escapeText(pair.toName)} (${escapeText(pair.to)})</a>
              </div>
            </li>`;
};

const renderFaq = (item) => `          <article class="faq-item">
            <h3>${escapeText(item.question)}</h3>
            <p>${escapeText(item.answer)}</p>
          </article>`;

const STYLES = `      :root {
        color-scheme: light dark;
        --container-width: 60rem;
        --page-background: #ffffff;
        --surface-background: #faf9f7;
        --surface-border: #e7e5e4;
        --text-primary: #1c1917;
        --text-secondary: #57534e;
        --accent-background: #1c1917;
        --accent-text: #ffffff;
        --focus-ring: #2563eb;
        --radius: 0.75rem;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --page-background: #12100f;
          --surface-background: #1c1a19;
          --surface-border: #332e2b;
          --text-primary: #f5f5f4;
          --text-secondary: #b3aca7;
          --accent-background: #f5f5f4;
          --accent-text: #12100f;
          --focus-ring: #93c5fd;
        }
      }

      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      html {
        -webkit-text-size-adjust: 100%;
      }

      body {
        margin: 0;
        background: var(--page-background);
        color: var(--text-primary);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 1rem;
        line-height: 1.65;
      }

      h1,
      h2,
      h3 {
        line-height: 1.25;
        text-wrap: balance;
        margin: 0 0 0.75em;
      }

      h1 {
        font-size: clamp(1.85rem, 5vw, 2.6rem);
      }

      h2 {
        font-size: clamp(1.4rem, 3.5vw, 1.85rem);
      }

      h3 {
        font-size: 1.05rem;
      }

      p {
        margin: 0 0 1em;
      }

      .container {
        width: 100%;
        max-width: var(--container-width);
        margin: 0 auto;
        padding: 0 1.25rem;
      }

      a {
        color: inherit;
      }

      a:focus-visible,
      .button:focus-visible {
        outline: 3px solid var(--focus-ring);
        outline-offset: 3px;
        border-radius: 4px;
      }

      .skip-link {
        position: absolute;
        left: -999px;
        top: 0;
        padding: 0.75rem 1.25rem;
        background: var(--accent-background);
        color: var(--accent-text);
        z-index: 10;
      }

      .skip-link:focus-visible {
        left: 0.75rem;
        top: 0.75rem;
      }

      .site-header {
        border-bottom: 1px solid var(--surface-border);
      }

      .site-header-inner {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding-block: 0.75rem;
      }

      .brand {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        font-weight: 700;
        font-size: 1.15rem;
        letter-spacing: -0.01em;
        text-decoration: none;
      }

      .site-nav {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .site-nav a {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        padding: 0 0.5rem;
        color: var(--text-secondary);
      }

      .section {
        padding-block: 2.5rem;
        border-bottom: 1px solid var(--surface-border);
      }

      .section > .container > p,
      .section > .container > h2 + p {
        color: var(--text-secondary);
        max-width: 46rem;
      }

      .hero {
        padding-block: 3rem;
        border-bottom: 1px solid var(--surface-border);
        background: var(--surface-background);
      }

      .hero-lead {
        font-size: 1.15rem;
        color: var(--text-primary);
      }

      .hero p {
        max-width: 44rem;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0 1.35rem;
        border-radius: var(--radius);
        background: var(--accent-background);
        color: var(--accent-text);
        font-weight: 600;
        text-decoration: none;
      }

      .button:hover {
        opacity: 0.88;
      }

      .pair-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 1rem;
      }

      .pair-card {
        display: flex;
        gap: 1rem;
        padding: 1.25rem;
        background: var(--surface-background);
        border: 1px solid var(--surface-border);
        border-radius: var(--radius);
      }

      .pair-rank {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2.25rem;
        height: 2.25rem;
        border-radius: 999px;
        background: var(--accent-background);
        color: var(--accent-text);
        font-weight: 700;
        font-size: 0.9rem;
      }

      .pair-body {
        min-width: 0;
      }

      .pair-heading {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.25rem 0.6rem;
        margin-bottom: 0.5em;
      }

      .pair-ticker {
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.01em;
      }

      .pair-names {
        color: var(--text-secondary);
        font-size: 0.95rem;
        font-weight: 500;
      }

      .pair-description {
        color: var(--text-secondary);
        margin-bottom: 0.85em;
      }

      .pair-link {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .faq-item {
        padding: 1.25rem;
        border: 1px solid var(--surface-border);
        border-radius: var(--radius);
        margin-bottom: 0.75rem;
      }

      .faq-item p {
        color: var(--text-secondary);
        margin-bottom: 0;
      }

      .final-cta {
        padding-block: 3rem;
        background: var(--surface-background);
        text-align: center;
      }

      .final-cta p {
        color: var(--text-secondary);
      }

      .site-footer {
        padding-block: 1.5rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .site-footer-inner {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .site-footer a {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
      }

      .site-footer p {
        margin: 0;
      }

      @media (min-width: 48rem) {
        .section {
          padding-block: 3.5rem;
        }

        .pair-card {
          padding: 1.5rem;
        }
      }`;

/**
 * Renders the `/popular-currency-pairs/` document.
 *
 * @param {{ origin: string, basePath?: string, isStaging?: boolean }} options
 * @param {string} options.origin Absolute production origin used for canonical
 *   and structured-data URLs, e.g. `https://skolko.example.com`.
 * @param {string} [options.basePath] Deployment base path for in-page links
 *   (`/` for production, `/skolko/` for GitHub Pages staging).
 * @param {boolean} [options.isStaging] When true the page is not indexable.
 * @returns {string} Complete HTML document.
 */
export function generateLandingPageHtml({ origin, basePath = '/', isStaging = false }) {
  const siteOrigin = String(origin).replace(/\/+$/, '');
  const appPath = normalizeBasePath(basePath);
  const canonicalUrl = `${siteOrigin}${LANDING_PATH}`;
  const robotsContent = isStaging ? 'noindex, nofollow' : 'index, follow';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonicalUrl,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        url: canonicalUrl,
        inLanguage: 'en',
        mainEntity: { '@id': `${canonicalUrl}#popular-currency-pairs` },
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#popular-currency-pairs`,
        name: 'Popular Currency Pairs',
        numberOfItems: POPULAR_PAIRS.length,
        itemListElement: POPULAR_PAIRS.map(pair => ({
          '@type': 'ListItem',
          position: pair.rank,
          name: `${pair.from}/${pair.to} — ${pair.fromName} to ${pair.toName}`,
          description: pair.description,
          url: `${siteOrigin}${appPath}?from=${pair.from}&to=${pair.to}`,
        })),
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Skolko',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        description:
          'Skolko is a free, lightweight currency converter for fiat currencies and ' +
          'cryptocurrencies that runs in the browser and works offline with previously ' +
          'loaded exchange rates.',
        url: `${siteOrigin}${appPath}`,
      },
    ],
  };
  const jsonLdScript = JSON.stringify(jsonLd, null, 2).replaceAll('<', '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light dark" />
    <title>${PAGE_TITLE}</title>
    <meta name="description" content="${PAGE_DESCRIPTION}" />
    <meta name="robots" content="${robotsContent}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Skolko" />
    <meta property="og:title" content="${PAGE_TITLE}" />
    <meta property="og:description" content="${PAGE_DESCRIPTION}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${PAGE_TITLE}" />
    <meta name="twitter:description" content="${PAGE_DESCRIPTION}" />
    <link rel="icon" href="${appPath}favicon.ico" sizes="48x48" />
    <link rel="icon" href="${appPath}skolko.svg" sizes="any" type="image/svg+xml" />
    <link rel="apple-touch-icon" sizes="180x180" href="${appPath}pwa/apple-touch-icon.png" />
    <style>
${STYLES}
    </style>
    <script type="application/ld+json">
${jsonLdScript}
    </script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <div class="container site-header-inner">
        <a class="brand" href="${appPath}">Skolko</a>
        <nav class="site-nav" aria-label="Primary">
          <a href="${appPath}">Currency Converter</a>
        </nav>
      </div>
    </header>
    <main id="main">
      <section id="hero" class="hero" aria-labelledby="hero-title">
        <div class="container">
          <h1 id="hero-title">Popular Currency Pairs for Everyday Conversion</h1>
          <p class="hero-lead">Looking for the most popular currency pairs to convert? Explore commonly used fiat currency and cryptocurrency combinations from around the world.</p>
          <p>Whether you're planning an international trip, comparing exchange rates, managing international payments, or tracking cryptocurrency values, these currency pairs represent popular conversion directions used by people worldwide.</p>
          <p>Choose any pair below to open the Skolko currency converter and convert between your preferred currencies.</p>
          <a class="button" href="${escapeAttribute(`${appPath}${HERO_PATH}`)}">Open Currency Converter</a>
        </div>
      </section>
      <section id="popular-pairs" class="section" aria-labelledby="pairs-title">
        <div class="container">
          <h2 id="pairs-title">Popular Currency Pairs to Convert</h2>
          <p>The list below ranks 30 widely used conversion directions: 20 fiat currency pairs followed by 10 cryptocurrency pairs. Each entry links straight to a pre-filled conversion in the Skolko converter.</p>
          <ol class="pair-list" role="list">
${POPULAR_PAIRS.map(pair => renderPair(pair, appPath)).join('\n')}
          </ol>
        </div>
      </section>
      <section id="about" class="section" aria-labelledby="about-title">
        <div class="container">
          <h2 id="about-title">A Free Currency and Cryptocurrency Converter</h2>
          <p>Skolko is a lightweight currency converter designed to make converting fiat currencies and cryptocurrencies simple and convenient.</p>
          <p>Convert between traditional currencies and digital assets using an intuitive interface without unnecessary complexity.</p>
          <p>Skolko also supports offline access using the most recently cached exchange rates, making it useful even when an internet connection is unavailable.</p>
        </div>
      </section>
      <section id="faq" class="section" aria-labelledby="faq-title">
        <div class="container">
          <h2 id="faq-title">Frequently Asked Questions</h2>
${FAQ_ITEMS.map(renderFaq).join('\n')}
        </div>
      </section>
      <section id="final-cta" class="final-cta" aria-labelledby="final-cta-title">
        <div class="container">
          <h2 id="final-cta-title">Convert Currencies Instantly with Skolko</h2>
          <p>Pick your currencies, enter an amount, and get a conversion using up-to-date exchange rates in a single screen.</p>
          <a class="button" href="${appPath}">Try Skolko Currency Converter</a>
        </div>
      </section>
    </main>
    <footer class="site-footer">
      <div class="container site-footer-inner">
        <p>Skolko — free fiat and cryptocurrency converter.</p>
        <a href="${appPath}">Open the currency converter</a>
      </div>
    </footer>
  </body>
</html>
`;
}
