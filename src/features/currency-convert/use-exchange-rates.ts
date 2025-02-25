import { useState, useEffect } from 'react';
import { getStorageData, setStorageData } from '@/shared/lib/storage';
import type { ExchangeRates } from './model';
import { getExchangeRates } from './api';
import { withRetryAndTimeout } from '@/shared/lib/retry';

const CACHE_KEY = 'exchange-rates';
const CACHE_DURATION = 1000 * 60 * 60 * 4; // 4 hours
type CacheData = {
  timestamp: number;
  rates: ExchangeRates;
};

export const useExchangeRates = () => {
  const [data, setData] = useState<ExchangeRates>();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const abortController = new AbortController();
    let isActive = true;

    const fetchRates = async () => {
      try {
        const cached = getStorageData<CacheData>(CACHE_KEY);

        if (typeof cached?.rates === 'object') {
          setData(cached.rates);
          if (
            typeof cached.timestamp === 'number'
            && Date.now() - cached.timestamp < CACHE_DURATION
          ) return;
        }

        setLoading(true);

        const response = await withRetryAndTimeout(
          () => getExchangeRates({ signal: abortController.signal })
            .then((data) => ({ data }))
            .catch((error: unknown) => ({ error })),
          { maxAttempts: 5, delay: 300, abortController },
        );

        if (!isActive) return;

        if ('error' in response) {
          if (typeof cached?.rates !== 'object') throw response.error;
          setData(cached.rates);
          return;
        }

        setData(response.data);
        setStorageData(CACHE_KEY, {
          timestamp: Date.now(),
          rates: response.data,
        } as CacheData);
      } catch (e: unknown) {
        if (!isActive) return;
        setError(e instanceof Error ? e.message : 'Something went wrong while fetching exchange rates');
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

  return { data, isLoading, error } as const;
};
