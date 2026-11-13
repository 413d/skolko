import { useState, useCallback } from 'react';

import type { SharedCurrency } from './types';
import { parseQueryParams } from './lib/parse-query-params.mjs';

const CURRENCY_PARAM_KEY = 'c';

export const createURLWithSharedCurrencies = (sharedCurrencies: SharedCurrency[]) => {
  if (typeof window === 'undefined') {
    throw new Error('Unsupported environment');
  }

  const params = new URLSearchParams(window.location.search);
  params.delete(CURRENCY_PARAM_KEY);

  sharedCurrencies.forEach(({ code, amount }) => {
    const paramValue = amount ? `${code}:${String(amount)}` : code;
    params.append(CURRENCY_PARAM_KEY, paramValue);
  });

  return `${window.location.pathname}?${params.toString()}`;
};

const getSharedCurrenciesFromURL = (): SharedCurrency[] => {
  if (typeof window === 'undefined' || !window.location.search) return [];
  return parseQueryParams(window.location.search);
};

export const clearSharedCurrenciesFromURL = () => {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  if (!params.has(CURRENCY_PARAM_KEY) && !params.has('from') && !params.has('to')) return;

  params.delete(CURRENCY_PARAM_KEY);
  params.delete('from');
  params.delete('to');
  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
  window.history.replaceState({}, '', nextUrl);
};

export const useSharedCurrencies = () => {
  const [sharedCurrencies, setSharedCurrencies] = useState<SharedCurrency[]>(getSharedCurrenciesFromURL());

  const clearSharedCurrencies = useCallback(() => {
    clearSharedCurrenciesFromURL();
    setSharedCurrencies([]);
  }, []);

  return [sharedCurrencies, clearSharedCurrencies] as const;
};
