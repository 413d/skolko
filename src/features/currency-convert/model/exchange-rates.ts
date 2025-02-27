import { useState, useEffect } from 'react';

import { getStorageData, setStorageData } from '@/shared/lib/storage';
import { withRetryAndTimeout } from '@/shared/lib/retry';

import type { CurrencyCode } from '@/entities/currency';

import { getExchangeRates } from '../api';

/** Price of currency to base currency ratio */
export type CurrencyRate = number;

/**
 * Exchange rates with currency code as the key and the rate as the value
 */
export type ExchangeRates = Record<CurrencyCode, CurrencyRate>;

const CACHE_KEY = 'exchange-rates';
const CACHE_DURATION = 1000 * 60 * 60 * 4; // 4 hours
type CacheData = {
  timestamp: number;
  rates: ExchangeRates;
};

export const EXCHANGE_RATES_ERRORS = {
  NETWORK: 'Network connection issue. Please check your internet connection.',
  SERVER: 'The exchange rate server is currently unavailable. Using cached data.',
  TIMEOUT: 'Request timed out. The server took too long to respond.',
  PARSE: 'Failed to process exchange rate data.',
  CACHE: 'Failed to load cached exchange rates.',
  UNKNOWN: 'Something went wrong while fetching exchange rates.',
} as const;

export const useExchangeRates = () => {
  const [data, setData] = useState<ExchangeRates>();
  const [fetchedAt, setFetchedAt] = useState<Date>();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const abortController = new AbortController();
    let isActive = true;

    const fetchRates = async () => {
      try {
        setError(undefined);

        const cached = getStorageData<CacheData>(CACHE_KEY);

        if (typeof cached === 'object' && typeof cached.rates === 'object') {
          setData(cached.rates);
          if (typeof cached.timestamp === 'number') {
            setFetchedAt(new Date(cached.timestamp));
            if (Date.now() - cached.timestamp < CACHE_DURATION) return;
          }
        } else {
          setStorageData(CACHE_KEY, undefined);
        }

        setLoading(true);

        const rates = await withRetryAndTimeout(
          () => getExchangeRates({ signal: abortController.signal }),
          { maxAttempts: 5, delay: 300, abortController },
        );

        if (!isActive) return;
        setData(rates);

        const timestamp = Date.now();
        setFetchedAt(new Date(timestamp));

        setStorageData(CACHE_KEY, {
          timestamp,
          rates,
        } as CacheData);
      } catch (e: unknown) {
        if (!isActive) return;

        if (e instanceof TypeError && e.message.includes('network')) {
          setError(EXCHANGE_RATES_ERRORS.NETWORK);
        } else if (e instanceof DOMException && e.name === 'AbortError') {
          if (e.message.includes('timeout')) {
            setError(EXCHANGE_RATES_ERRORS.TIMEOUT);
          }
        } else if (e instanceof Error && e.message.includes('status')) {
          setError(EXCHANGE_RATES_ERRORS.SERVER);
        } else if (e instanceof SyntaxError) {
          setError(EXCHANGE_RATES_ERRORS.PARSE);
        } else {
          setError(EXCHANGE_RATES_ERRORS.UNKNOWN);
        }

        console.error(e);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void fetchRates();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, []);

  return { data, fetchedAt, isLoading, error } as const;
};
