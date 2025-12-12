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

const getLinesFromStorage = (): Line[] => {
  const data = getStorageData(LINES_STORAGE_KEY);
  if (!Array.isArray(data)) return [];
  return data.filter(isValidLine);
};

const saveLinesInStorageFx = createEffect((lines?: Line[]) => {
  setStorageData(LINES_STORAGE_KEY, lines);
});

const getLinesFx = createEffect((rates?: Rates) => {
  const lines = getLinesFromStorage();
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
  source: [$usedCurrencies, $lines] as const,
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

const currencyChanged = createEvent<{
  line: Line;
  newCurrency: Line['currency'],
  rates: Rates,
}>();
sample({
  clock: currencyChanged,
  source: [$lines, $usedCurrencies] as const,
  filter: ([, usedCurrencies], payload) => !usedCurrencies.has(payload.newCurrency),
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

const ratesUpdated = createEvent<{
  rates?: Rates;
}>();
// first load (init)
sample({
  clock: ratesUpdated,
  source: $lines,
  filter: (lines) => !lines?.length,
  fn: (_, payload) => payload.rates,
  target: getLinesFx,
});
// subsequent updates
sample({
  clock: ratesUpdated,
  source: $lines,
  filter: (lines, { rates }) => rates !== undefined && lines !== undefined && lines.length > 1,
  fn: (lines = [], { rates }) => {
    if (typeof rates !== 'object') return lines;
    return recalculateLines(lines, rates);
  },
  target: $lines,
});

const linesChangedDebounced = debounce($lines, 1000);
sample({
  clock: linesChangedDebounced,
  filter: (lines) => lines !== undefined,
  target: saveLinesInStorageFx,
});

export {
  lineAdded,
  lineDeleted,
  currencyChanged,
  amountChanged,
  ratesUpdated,
  $lines,
  $usedCurrencies,
};
