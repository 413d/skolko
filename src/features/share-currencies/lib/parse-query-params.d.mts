/**
 * Type declarations for parse-query-params.mjs
 * Covers both ?c=CODE:AMOUNT and ?from=CODE&to=CODE patterns.
 */
export declare function parseQueryParams(
  search: string,
): Array<{ code: string; amount: number | undefined }>;
