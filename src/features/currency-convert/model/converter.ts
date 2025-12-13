import { combine, createEffect, createEvent, createStore, sample } from 'effector';
import { debounce } from 'patronum';

import { getRandomInt, roundTo } from '@/shared/lib/math';
import { getStorageData, setStorageData } from '@/shared/lib/storage';

import { type CurrencyCode, DEFAULT_CURRENCY_FIAT } from '@/entities/currency';

import { convert } from '../lib/convert';

type Line = {
  currency: CurrencyCode;
  amount: number;
};
type Rates = Record<CurrencyCode, number>;

const CONVERT_PRECISION = 4;

const isValidLine = (data: unknown): data is Line => (
  typeof data === 'object' &&
  data !== null &&
  'currency' in data &&
  'amount' in data &&
  typeof data.currency === 'string' &&
  typeof data.amount === 'number'
);

const recalculateLines = (lines: Line[], rates: Rates) => lines.reduce<Line[]>(
  (newLines, line) => {
    if (line.currency in rates) {
      if (newLines.length === 0) {
        newLines.push(line);
      } else {
        const toConvert = newLines[0];
        newLines.push({
          currency: line.currency,
          amount: roundTo(
            convert(toConvert.amount, toConvert.currency, line.currency, rates),
            CONVERT_PRECISION,
          ),
        });
      }
    }

    return newLines;
  },
  [],
);

const LINES_STORAGE_KEY = 'converter-lines';
const getLinesStorageKey = (id?: string) => (
  id ? `${LINES_STORAGE_KEY}-${id}` : LINES_STORAGE_KEY
);

const getLinesFromStorage = (id?: string): Line[] => {
  const data = getStorageData(getLinesStorageKey(id));
  if (!Array.isArray(data)) return [];
  return data.filter(isValidLine);
};

const saveLinesInStorageFx = createEffect(({ lines, converterId }: {lines?: Line[], converterId?: string}) => {
  setStorageData(getLinesStorageKey(converterId), lines);
});

const getLinesFx = createEffect(({ rates, converterId }: { rates?: Rates; converterId?: string }) => {
  const lines = getLinesFromStorage(converterId);
  if (lines.length === 0) return [{ currency: DEFAULT_CURRENCY_FIAT, amount: 0 }];
  return rates ? recalculateLines(lines, rates) : lines;
});

const $lines = createStore<Line[] | undefined>(undefined, { skipVoid: false })
  .on(getLinesFx.doneData, (_, lines) => lines);

const $usedCurrencies = combine(
  $lines,
  (lines) => new Set<CurrencyCode>((lines ?? []).map((line) => line.currency)),
);

const lineAdded = createEvent<Rates>();
sample({
  clock: lineAdded,
  source: [$usedCurrencies, $lines, getLinesFx.pending] as const,
  filter: ([, , isLoading]) => !isLoading,
  fn: ([usedCurrencies, lines = []], rates) => {
    if (lines.length === 0) return [{ currency: DEFAULT_CURRENCY_FIAT, amount: 1 }];

    const availableCurrencies = Object.keys(rates).filter(
      (c) => !usedCurrencies.has(c),
    );
    if (availableCurrencies.length === 0) return lines;

    const currency = availableCurrencies.includes(DEFAULT_CURRENCY_FIAT)
      ? DEFAULT_CURRENCY_FIAT
      : availableCurrencies[getRandomInt(0, availableCurrencies.length - 1)];

    const [toConvert] = lines;
    const amount = roundTo(
      convert(toConvert.amount, toConvert.currency, currency, rates),
      CONVERT_PRECISION,
    );

    return lines.concat({ currency, amount });
  },
  target: $lines,
});

const lineDeleted = createEvent<Line>();
$lines.on(lineDeleted, (state = [], line) => state.filter((l) => l.currency !== line.currency));

const lineReordered = createEvent<{ from: number; to: number }>();
$lines.on(lineReordered, (lines = [], { from, to }) => {
  const newLines = [...lines];
  const [movedLine] = newLines.splice(from, 1);
  newLines.splice(to, 0, movedLine);
  return newLines;
});

const currencyChanged = createEvent<{
  line: Line;
  newCurrency: Line['currency'],
  rates: Rates,
}>();
sample({
  clock: currencyChanged,
  source: [$lines, $usedCurrencies, getLinesFx.pending] as const,
  filter: ([, usedCurrencies, isLoading], payload) => !usedCurrencies.has(payload.newCurrency) && !isLoading,
  fn: ([lines = []], payload) => lines.map((l) => {
    if (l.currency !== payload.line.currency) return l;

    return {
      currency: payload.newCurrency,
      amount: roundTo(
        convert(l.amount, l.currency, payload.newCurrency, payload.rates),
        CONVERT_PRECISION,
      ),
    };
  }),
  target: $lines,
});

const amountChanged = createEvent<{
  line: Line,
  newAmount: Line['amount'],
  rates: Rates,
}>();

const amountChangedDebounced = debounce(amountChanged, 500);

$lines.on(amountChangedDebounced, (lines = [], payload) => lines.map((l) => {
  if (l.currency === payload.line.currency) return {
    currency: payload.line.currency,
    amount: roundTo(payload.newAmount, CONVERT_PRECISION),
  };

  return {
    currency: l.currency,
    amount: roundTo(
      convert(payload.newAmount, payload.line.currency, l.currency, payload.rates),
      CONVERT_PRECISION,
    ),
  };
}));

const $converterId = createStore<string | undefined>(undefined, { skipVoid: false })
  .reset(getLinesFx.failData);

const converterUpdated = createEvent<{
  rates?: Rates;
  converterId?: string;
}>();

sample({
  clock: converterUpdated,
  fn: ({ converterId }) => converterId,
  target: $converterId,
});

const isLinesReady = (
  currentLines: Line[] | undefined,
  newConverterId: string | undefined,
  previousConverterId: string | undefined,
) => currentLines !== undefined && newConverterId === previousConverterId;

// init or switch converter
sample({
  clock: converterUpdated,
  source: [$lines, $converterId] as const,
  filter: ([lines, converterId], payload) => !isLinesReady(lines, payload.converterId, converterId),
  fn: (_, payload) => payload,
  target: getLinesFx,
});
// recalculate current converter lines
sample({
  clock: converterUpdated,
  source: [$lines, $converterId] as const,
  filter: ([lines, converterId], payload) => payload.rates !== undefined && isLinesReady(lines, payload.converterId, converterId),
  fn: ([lines = []], payload) => {
    if (typeof payload.rates !== 'object') return lines;
    return recalculateLines(lines, payload.rates);
  },
  target: $lines,
});

const linesChangedDebounced = debounce($lines, 1000);
sample({
  clock: linesChangedDebounced,
  source: $converterId,
  filter: (_converterId, lines) => lines !== undefined,
  fn: (converterId, lines) => ({ lines, converterId }),
  target: saveLinesInStorageFx,
});

export {
  lineAdded,
  lineDeleted,
  lineReordered,
  currencyChanged,
  amountChanged,
  converterUpdated,
  $lines,
  $usedCurrencies,
};
