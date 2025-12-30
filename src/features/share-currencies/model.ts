import { useSyncExternalStore } from 'react';

import type { SharedCurrency } from './types';

const CURRENCY_PARAM_KEY = 'c';

export const useSharedCurrencies = () => useSyncExternalStore<SharedCurrency[]>(
  (onStoreChange) => {
    if (typeof window === 'undefined' || typeof history === 'undefined') {
      return () => void 0;
    }

    const notify = () => onStoreChange();

    const handlePopState = () => {
      notify();
    };

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      notify();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      notify();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  },
  () => {
    if (typeof window === 'undefined') {
      return [];
    }

    const params = new URLSearchParams(window.location.search);
    const sharedCurrenciesParam = params.getAll(CURRENCY_PARAM_KEY);

    if (sharedCurrenciesParam.length > 0) {
      return sharedCurrenciesParam.map((param) => {
        const [code, amountStr] = param.split(':');
        const amount = amountStr ? Number(amountStr) : undefined;

        return {
          code: code,
          amount: amount === undefined || isNaN(amount) ? undefined : amount,
        };
      });
    }

    return [];
  },
  () => [],
);

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
