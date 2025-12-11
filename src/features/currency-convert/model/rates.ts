import { createStore, createEffect, createEvent, sample } from 'effector';

import { getStorageData, setStorageData } from '@/shared/lib/storage';
import { withRetryAndTimeout } from '@/shared/lib/retry';
import { valueOrDefault } from '@/shared/lib/validation';

import type { CurrencyCode } from '@/entities/currency';

import { getExchangeRates } from '../api';

/** Price of currency to base currency ratio */
type CurrencyRate = number;

/**
 * Exchange rates with currency code as the key and the rate as the value
 */
type RateByCurrency = Record<CurrencyCode, CurrencyRate>;

type RatesData = {
  rates: RateByCurrency;
  timestamp: number;
};

const CACHE_KEY = 'exchange-rates';
const CACHE_DURATION = Number(valueOrDefault(import.meta.env.VITE_EXCHANGE_RATES_CACHE_TTL, '3600000')) || 3600000;
const isValidCache = (data: unknown): data is RatesData => (
  typeof data === 'object' &&
  data !== null &&
  'timestamp' in data && typeof data.timestamp === 'number' &&
  'rates' in data && typeof data.rates === 'object' && data.rates !== null
);
const isFreshCache = (data: Pick<RatesData, 'timestamp'>): boolean => (
  Date.now() - data.timestamp < CACHE_DURATION
);

const saveRatesToCacheFx = createEffect((data: RatesData) => {
  setStorageData(CACHE_KEY, data);
});

const getRatesFromCacheFx = createEffect(() => {
  const cached = getStorageData(CACHE_KEY);
  if (isValidCache(cached)) {
    return cached;
  }
  setStorageData(CACHE_KEY, undefined);
  return undefined;
});

const getRatesFromApiFx = createEffect(async () => {
  const rates = await withRetryAndTimeout(
    () => getExchangeRates(),
    { maxAttempts: 5, delay: 300 },
  );

  return {
    rates,
    timestamp: Date.now(),
  } satisfies RatesData;
});

sample({
  clock: getRatesFromApiFx.doneData,
  target: saveRatesToCacheFx,
});

sample({
  clock: getRatesFromCacheFx.doneData,
  filter: (cached) => cached === undefined || !isFreshCache(cached),
  target: getRatesFromApiFx,
});

const $rates = createStore<RateByCurrency | undefined>(undefined, { skipVoid: false })
  .on(getRatesFromCacheFx.doneData, (state, cached) => cached?.rates ?? state)
  .on(getRatesFromApiFx.doneData, (_, loaded) => loaded.rates);

const $isRatesLoading = getRatesFromApiFx.pending;

const $ratesError = createStore('')
  .on(getRatesFromApiFx.failData, (_, e) => {
    if (e instanceof TypeError && e.message.includes('network')) {
      return 'Network connection issue. Please check your internet connection.';
    }

    if (e instanceof Error && e.message.includes('status')) {
      return 'The exchange rate server is currently unavailable.';
    }
    
    if (e instanceof SyntaxError) {
      return 'Failed to process exchange rates data.';
    }

    return 'Something went wrong while fetching exchange rates.';
  })
  .reset(getRatesFromApiFx);

const $ratesFetchedAt = createStore<Date | undefined>(undefined, { skipVoid: false })
  .on(getRatesFromCacheFx.doneData, (_, data) => data?.timestamp ? new Date(data.timestamp) : undefined)
  .on(getRatesFromApiFx.doneData, (_, data) => new Date(data.timestamp));

const ratesInited = createEvent();
sample({
  clock: ratesInited,
  source: $rates,
  filter: (rates) => rates === undefined,
  target: getRatesFromCacheFx,
});

export {
  $rates,
  $isRatesLoading,
  $ratesError,
  $ratesFetchedAt,
  ratesInited,
};
