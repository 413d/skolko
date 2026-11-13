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

// --- required shape fields are present ---
test('every pair has required shape fields', () => {
  for (const pair of POPULAR_PAIRS) {
    for (const field of ['rank', 'from', 'to', 'fromName', 'toName', 'description', 'kind']) {
      assert.ok(
        field in pair,
        `pair rank ${pair.rank} is missing field "${field}"`,
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
