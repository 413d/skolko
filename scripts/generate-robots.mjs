/**
 * generate-robots.mjs
 *
 * Generates the robots.txt file for Skolko.
 * In staging, disallows all bots and omits sitemap.
 * In production, explicitly allows search crawlers and AI search bots
 * (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot), allows general bots,
 * and advertises the canonical sitemap URL.
 */

/**
 * Normalizes an origin string by trimming whitespace and removing trailing slashes.
 * @param {string} origin
 * @returns {string}
 */
function normalizeOrigin(origin) {
  return String(origin ?? '').trim().replace(/\/+$/, '');
}

/**
 * Generates robots.txt content.
 *
 * @param {string | { origin: string, isStaging?: boolean }} originOrOptions
 * @param {boolean} [isStagingArg]
 * @returns {string}
 */
export function generateRobotsTxt(originOrOptions, isStagingArg) {
  let origin;
  let isStaging;

  if (typeof originOrOptions === 'object' && originOrOptions !== null) {
    origin = originOrOptions.origin;
    isStaging = originOrOptions.isStaging ?? isStagingArg;
  } else {
    origin = originOrOptions;
    isStaging = isStagingArg;
  }

  const staging = Boolean(isStaging);

  if (staging) {
    return `User-agent: *
Disallow: /
`;
  }

  const cleanOrigin = normalizeOrigin(origin);

  return `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: *
Allow: /

Sitemap: ${cleanOrigin}/sitemap.xml
`;
}
