/**
 * generate-llms.mjs
 *
 * Generates the /llms.txt discoverability file for LLM and AI search crawlers.
 * Outlines Skolko's features, provides links to the main converter and
 * popular currency pairs guide, and summarizes the 30 curated pairs.
 */

import { POPULAR_PAIRS } from './seo-pairs-data.mjs';

/**
 * Normalizes an origin string by trimming whitespace and removing trailing slashes.
 * @param {string} origin
 * @returns {string}
 */
function normalizeOrigin(origin) {
  return String(origin ?? '').trim().replace(/\/+$/, '');
}

/**
 * Normalizes any base path shape into `/`, `/repo/`, etc.
 * @param {string} [basePath]
 * @returns {string}
 */
function normalizeBasePath(basePath) {
  const segment = String(basePath ?? '').trim().replace(/^\/+|\/+$/g, '');
  return segment ? `/${segment}/` : '/';
}

/**
 * Generates llms.txt content.
 *
 * @param {string | { origin: string, basePath?: string }} originOrOptions
 * @param {string} [basePathArg]
 * @returns {string}
 */
export function generateLlmsTxt(originOrOptions, basePathArg) {
  let origin;
  let basePath;

  if (typeof originOrOptions === 'object' && originOrOptions !== null) {
    origin = originOrOptions.origin;
    basePath = originOrOptions.basePath ?? basePathArg;
  } else {
    origin = originOrOptions;
    basePath = basePathArg;
  }

  const cleanOrigin = normalizeOrigin(origin);
  const normalizedBasePath = normalizeBasePath(basePath);

  const mainUrl = `${cleanOrigin}${normalizedBasePath}`;
  const guideUrl = `${cleanOrigin}/popular-currency-pairs/`;

  const fiatList = POPULAR_PAIRS
    .filter((p) => p.kind === 'fiat')
    .map((p) => `- [${p.from}/${p.to}](${mainUrl}?c=${p.from}:1&c=${p.to}): ${p.fromName} to ${p.toName}`)
    .join('\n');

  const cryptoList = POPULAR_PAIRS
    .filter((p) => p.kind === 'crypto')
    .map((p) => `- [${p.from}/${p.to}](${mainUrl}?c=${p.from}:1&c=${p.to}): ${p.fromName} to ${p.toName}`)
    .join('\n');

  return `# Skolko

> Skolko is a lightweight, privacy-friendly currency and cryptocurrency converter with offline support.

Skolko is a fast web-based currency converter that allows users to convert between major fiat currencies and popular cryptocurrencies. It operates without accounts, tracking, or advertisements, caches exchange rates for reliable offline use, and provides instant calculations based on Coinbase exchange rates.

## Core Services

- [Skolko Currency Converter](${mainUrl}): Fast, privacy-friendly currency and crypto converter.
- [Popular Currency Pairs Guide](${guideUrl}): Reference guide covering 30 of the most frequently traded and converted fiat and cryptocurrency pairs.

## Popular Currency Pairs Overview

Skolko features a curated list of 30 popular currency pairs: 20 fiat currency pairs and 10 cryptocurrency pairs.

### Fiat Currency Pairs (Ranks 1–20)

${fiatList}

### Cryptocurrency Pairs (Ranks 21–30)

${cryptoList}
`;
}
