import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  POPULAR_PAIRS,
  FAQ_ITEMS,
  COINBASE_KNOWN_SYMBOLS,
} from '../scripts/seo-pairs-data.mjs';

// --- POPULAR_PAIRS length ---
test('POPULAR_PAIRS has exactly 30 entries', () => {
  assert.strictEqual(POPULAR_PAIRS.length, 30);
});

// --- kind split: first 20 fiat, last 10 crypto ---
test('first 20 pairs have kind fiat', () => {
  for (let i = 0; i < 20; i++) {
    assert.strictEqual(
      POPULAR_PAIRS[i].kind,
      'fiat',
      `pair at index ${i} (rank ${POPULAR_PAIRS[i].rank}) should be fiat`,
    );
  }
});

test('last 10 pairs have kind crypto', () => {
  for (let i = 20; i < 30; i++) {
    assert.strictEqual(
      POPULAR_PAIRS[i].kind,
      'crypto',
      `pair at index ${i} (rank ${POPULAR_PAIRS[i].rank}) should be crypto`,
    );
  }
});

test('exactly 20 fiat and 10 crypto pairs', () => {
  const fiatCount = POPULAR_PAIRS.filter(p => p.kind === 'fiat').length;
  const cryptoCount = POPULAR_PAIRS.filter(p => p.kind === 'crypto').length;
  assert.strictEqual(fiatCount, 20);
  assert.strictEqual(cryptoCount, 10);
});

// --- ranks are strictly 1..30 in sequence ---
test('ranks are strictly 1 through 30 in sequence', () => {
  for (let i = 0; i < 30; i++) {
    assert.strictEqual(
      POPULAR_PAIRS[i].rank,
      i + 1,
      `pair at index ${i} should have rank ${i + 1}, got ${POPULAR_PAIRS[i].rank}`,
    );
  }
});

// --- descriptions: strings >= 50 chars and all unique ---
test('all descriptions are strings of length >= 50', () => {
  for (const pair of POPULAR_PAIRS) {
    assert.ok(
      typeof pair.description === 'string',
      `${pair.from}/${pair.to} description is not a string`,
    );
    assert.ok(
      pair.description.length >= 50,
      `${pair.from}/${pair.to} description is too short (${pair.description.length} chars)`,
    );
  }
});

test('all 30 descriptions are unique', () => {
  const descs = POPULAR_PAIRS.map(p => p.description);
  const unique = new Set(descs);
  assert.strictEqual(unique.size, 30, 'found duplicate descriptions');
});

// --- from/to tickers are all in COINBASE_KNOWN_SYMBOLS ---
test('every pair from and to ticker is in COINBASE_KNOWN_SYMBOLS', () => {
  const known = new Set(COINBASE_KNOWN_SYMBOLS);
  for (const pair of POPULAR_PAIRS) {
    assert.ok(
      known.has(pair.from),
      `${pair.from} (from in rank ${pair.rank}) is not in COINBASE_KNOWN_SYMBOLS`,
    );
    assert.ok(
      known.has(pair.to),
      `${pair.to} (to in rank ${pair.rank}) is not in COINBASE_KNOWN_SYMBOLS`,
    );
  }
});

// --- COINBASE_KNOWN_SYMBOLS is an array with exactly 24 unique tickers ---
test('COINBASE_KNOWN_SYMBOLS has exactly 24 unique entries', () => {
  assert.ok(Array.isArray(COINBASE_KNOWN_SYMBOLS));
  const unique = new Set(COINBASE_KNOWN_SYMBOLS);
  assert.strictEqual(unique.size, 24, `expected 24 unique tickers, got ${unique.size}`);
});

// --- pair identity in PRD order (full 30-entry sequence) ---
const EXPECTED_PAIRS = [
  // fiat
  { from: 'EUR', to: 'USD' },
  { from: 'USD', to: 'JPY' },
  { from: 'USD', to: 'CNY' },
  { from: 'GBP', to: 'USD' },
  { from: 'USD', to: 'CAD' },
  { from: 'AUD', to: 'USD' },
  { from: 'USD', to: 'CHF' },
  { from: 'USD', to: 'HKD' },
  { from: 'USD', to: 'SGD' },
  { from: 'USD', to: 'INR' },
  { from: 'EUR', to: 'GBP' },
  { from: 'USD', to: 'KRW' },
  { from: 'USD', to: 'MXN' },
  { from: 'USD', to: 'NZD' },
  { from: 'EUR', to: 'JPY' },
  { from: 'EUR', to: 'CHF' },
  { from: 'USD', to: 'BRL' },
  { from: 'USD', to: 'ZAR' },
  { from: 'USD', to: 'TRY' },
  { from: 'USD', to: 'PLN' },
  // crypto
  { from: 'BTC', to: 'USD' },
  { from: 'BTC', to: 'USDT' },
  { from: 'ETH', to: 'USD' },
  { from: 'ETH', to: 'USDT' },
  { from: 'SOL', to: 'USD' },
  { from: 'SOL', to: 'USDT' },
  { from: 'BTC', to: 'USDC' },
  { from: 'ETH', to: 'USDC' },
  { from: 'XRP', to: 'USD' },
  { from: 'ETH', to: 'BTC' },
];

test('pairs appear in PRD-specified from/to order across all 30 slots', () => {
  for (let i = 0; i < 30; i++) {
    const pair = POPULAR_PAIRS[i];
    const expected = EXPECTED_PAIRS[i];
    assert.strictEqual(
      pair.from,
      expected.from,
      `index ${i} (rank ${pair.rank}): expected from=${expected.from}, got ${pair.from}`,
    );
    assert.strictEqual(
      pair.to,
      expected.to,
      `index ${i} (rank ${pair.rank}): expected to=${expected.to}, got ${pair.to}`,
    );
  }
});

// --- required shape fields are present and correctly typed ---
test('every pair has required shape fields with correct types', () => {
  const stringFields = ['from', 'to', 'fromName', 'toName', 'description', 'kind'];
  for (const pair of POPULAR_PAIRS) {
    assert.strictEqual(
      typeof pair.rank,
      'number',
      `pair rank ${pair.rank} has non-number rank field`,
    );
    for (const field of stringFields) {
      assert.ok(
        field in pair,
        `pair rank ${pair.rank} is missing field "${field}"`,
      );
      assert.strictEqual(
        typeof pair[field],
        'string',
        `pair rank ${pair.rank} field "${field}" is not a string (got ${typeof pair[field]})`,
      );
    }
  }
});

// --- FAQ_ITEMS ---
test('FAQ_ITEMS has exactly 4 entries', () => {
  assert.strictEqual(FAQ_ITEMS.length, 4);
});

test('every FAQ item has non-empty question and answer strings', () => {
  for (let i = 0; i < FAQ_ITEMS.length; i++) {
    const item = FAQ_ITEMS[i];
    assert.ok(
      typeof item.question === 'string' && item.question.length > 0,
      `FAQ item ${i} has an empty or missing question`,
    );
    assert.ok(
      typeof item.answer === 'string' && item.answer.length > 0,
      `FAQ item ${i} has an empty or missing answer`,
    );
  }
});
