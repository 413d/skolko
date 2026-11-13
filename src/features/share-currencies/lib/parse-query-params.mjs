/**
 * Parses URL query parameters for currency conversion.
 *
 * Supports two patterns:
 *   - ?c=CODE:AMOUNT  (repeated; legacy share-link format)
 *   - ?from=CODE&to=CODE  (SEO landing-page deep-link format)
 *
 * @param {string} search - URL search string, e.g. '?from=EUR&to=USD'
 * @returns {Array<{ code: string, amount: number | undefined }>}
 */
export function parseQueryParams(search) {
  const params = new URLSearchParams(search);
  const result = [];

  // Handle repeated ?c=CODE:AMOUNT params (existing share-link format)
  for (const param of params.getAll('c')) {
    const colonIndex = param.indexOf(':');
    let code, amount;
    if (colonIndex === -1) {
      code = param;
      amount = undefined;
    } else {
      code = param.slice(0, colonIndex);
      const amountStr = param.slice(colonIndex + 1);
      const normalized = amountStr.replace(',', '.').trim();
      if (normalized) {
        const parsed = Number.parseFloat(normalized);
        amount = Number.isNaN(parsed) ? undefined : parsed;
      } else {
        amount = undefined;
      }
    }
    result.push({ code, amount });
  }

  // Handle ?from=CODE&to=CODE (SEO landing-page deep-link format)
  const from = params.get('from');
  const to = params.get('to');

  if (from) {
    result.push({ code: from.trim().toUpperCase(), amount: 1 });
  }
  if (to) {
    result.push({ code: to.trim().toUpperCase(), amount: undefined });
  }

  return result;
}
