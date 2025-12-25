import { valueOrThrow } from '@/shared/lib/validation';

const API_URL = valueOrThrow(import.meta.env.VITE_EXCHANGE_RATES_API_URL, 'VITE_EXCHANGE_RATES_API_URL');

const ERROR_RESPONSE = 'Invalid exchange rates: missing rates in response';
const ERROR_RATES = 'Invalid exchange rates: one or more rates are not numeric';

const parseRates = (res: unknown) => {
  if (typeof res !== 'object' || res === null || !('data' in res)) {
    throw new Error(ERROR_RESPONSE);
  }

  const { data } = res;
  if (typeof data !== 'object' || data === null || !('rates' in data)) {
    throw new Error(ERROR_RESPONSE);
  }

  const { rates } = data;
  if (typeof rates !== 'object' || rates === null) throw new Error(ERROR_RATES);

  return Object.entries(rates).reduce<Record<string, number>>((acc, [code, rate]) => {
    if (typeof rate === 'string') {
      rate = Number.parseFloat(rate);
    }
    if (typeof rate !== 'number' || !Number.isFinite(rate)) {
      throw new Error(ERROR_RATES);
    }

    acc[code] = rate;

    return acc;
  }, {});
};

export const getExchangeRates = async (requestOptions?: RequestInit) => {
  const response = await fetch(API_URL, requestOptions);

  if (!response.ok) {
    throw new Error(`Exchange rates request failed (status ${String(response.status)}).`);
  }

  const rates = parseRates(await response.json());

  return rates;
};
