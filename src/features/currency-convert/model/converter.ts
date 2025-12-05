import { combine, createEffect, createEvent, createStore, sample } from 'effector';

import { getRandomInt, roundTo } from '@/shared/lib/math';
import { getStorageData, setStorageData } from '@/shared/lib/storage';
import { debounce } from '@/shared/lib/delay';

import { type CurrencyCode, DEFAULT_CURRENCY_FIAT } from '@/entities/currency';

import { convert } from '../lib/convert';

type Line = {
  currency: CurrencyCode;
  amount: number;
};
type Rates = Record<CurrencyCode, number>;

const CONVERT_PRECISION = 4;
const DEFAULT_LINE: Readonly<Line> = { currency: DEFAULT_CURRENCY_FIAT, amount: 0 };

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
const getLinesFromStorage = (): Line[] => {
  const data = getStorageData(LINES_STORAGE_KEY);
  if (!Array.isArray(data)) return [];
  return data.filter(isValidLine);
};
const updateLinesInStorage = debounce((lines?: Line[]) => {
  setStorageData(LINES_STORAGE_KEY, lines);
}, 2000);

const getLinesFx = createEffect((rates?: Rates) => {
  const lines = getLinesFromStorage();
  if (lines.length === 0) return [{ ...DEFAULT_LINE }];
  return rates ? recalculateLines(lines, rates) : lines;
});

const $lines = createStore<Line[]>([]).on(getLinesFx.doneData, (_, lines) => lines);
$lines.watch((lines) => {
  updateLinesInStorage(lines);
});

const $usedCurrencies = combine(
  $lines,
  (lines) => new Set<CurrencyCode>(lines.map((line) => line.currency)),
);

const lineAdded = createEvent<Rates>();
sample({
  clock: lineAdded,
  source: [$usedCurrencies, $lines] as const,
  fn: ([usedCurrencies, lines], rates) => {
    let currency = DEFAULT_CURRENCY_FIAT;

    if (lines.length === 0) return [{ currency, amount: 1 }];

    while (usedCurrencies.has(currency) || !rates[currency]) {
      const allCurrencies = Object.keys(rates);
      const randomIndex = getRandomInt(0, allCurrencies.length - 1);
      currency = allCurrencies[randomIndex];
    }

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
$lines.on(lineDeleted, (state, line) => state.filter((l) => l.currency !== line.currency));

const currencyChanged = createEvent<{
  line: Line;
  newCurrency: Line['currency'],
  rates: Rates,
}>();
sample({
  clock: currencyChanged,
  source: [$lines, $usedCurrencies] as const,
  filter: ([, usedCurrencies], payload) => !usedCurrencies.has(payload.newCurrency),
  fn: ([lines], payload) => lines.map((l) => {
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
$lines.on(amountChanged, (lines, payload) => lines.map((l) => {
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

const ratesUpdated = createEvent<Rates>();
sample({
  clock: ratesUpdated,
  source: $lines,
  filter: (lines) => lines.length > 1,
  fn: recalculateLines,
  target: $lines,
});

const converterStarted = createEvent<{
  rates?: Rates;
}>();
sample({
  clock: converterStarted,
  source: $lines,
  filter: (lines) => !lines.length,
  fn: (_, payload) => payload.rates,
  target: getLinesFx,
});

export {
  lineAdded,
  lineDeleted,
  currencyChanged,
  amountChanged,
  ratesUpdated,
  converterStarted,
  $lines,
  $usedCurrencies,
};
