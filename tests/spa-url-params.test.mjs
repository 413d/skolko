import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseQueryParams } from '../src/features/share-currencies/lib/parse-query-params.mjs';

test('parseQueryParams parses standard c parameters', () => {
  const result = parseQueryParams('?c=USD:100&c=EUR');
  assert.deepStrictEqual(result, [
    { code: 'USD', amount: 100 },
    { code: 'EUR', amount: undefined },
  ]);
});

test('parseQueryParams parses from and to parameters with default amount 1', () => {
  const result = parseQueryParams('?from=EUR&to=USD');
  assert.deepStrictEqual(result, [
    { code: 'EUR', amount: 1 },
    { code: 'USD', amount: undefined },
  ]);
});

test('parseQueryParams normalizes lowercase from and to symbols', () => {
  const result = parseQueryParams('?from=btc&to=usdt');
  assert.deepStrictEqual(result, [
    { code: 'BTC', amount: 1 },
    { code: 'USDT', amount: undefined },
  ]);
});

test('parseQueryParams parses from without to', () => {
  const result = parseQueryParams('?from=EUR');
  assert.deepStrictEqual(result, [
    { code: 'EUR', amount: 1 },
  ]);
});
