/**
 * generate-sitemap.mjs
 *
 * Generates the XML sitemap for Skolko including the root converter
 * and the `/popular-currency-pairs/` SEO landing page.
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
 * Validates or resolves the lastmod date string in YYYY-MM-DD format.
 * @param {string | Date | undefined} lastmod
 * @returns {string}
 */
function resolveLastmod(lastmod) {
  if (lastmod === undefined || lastmod === null) {
    return new Date().toISOString().slice(0, 10);
  }
  if (lastmod instanceof Date) {
    return lastmod.toISOString().slice(0, 10);
  }
  const str = String(lastmod).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  throw new RangeError(`Invalid lastmod date: "${lastmod}". Expected YYYY-MM-DD format.`);
}

/**
 * Generates sitemap.xml string for production indexing.
 *
 * @param {string | { origin: string, lastmod?: string }} originOrOptions
 * @param {string} [lastmodArg]
 * @returns {string}
 */
export function generateSitemapXml(originOrOptions, lastmodArg) {
  let origin;
  let lastmod;

  if (typeof originOrOptions === 'object' && originOrOptions !== null) {
    origin = originOrOptions.origin;
    lastmod = originOrOptions.lastmod ?? lastmodArg;
  } else {
    origin = originOrOptions;
    lastmod = lastmodArg;
  }

  const cleanOrigin = normalizeOrigin(origin);
  const formattedLastmod = resolveLastmod(lastmod);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${cleanOrigin}/</loc>
    <lastmod>${formattedLastmod}</lastmod>
  </url>
  <url>
    <loc>${cleanOrigin}/popular-currency-pairs/</loc>
    <lastmod>${formattedLastmod}</lastmod>
  </url>
</urlset>
`;
}
