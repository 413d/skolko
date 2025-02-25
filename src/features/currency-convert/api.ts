import type { ExchangeRates } from './model';

const API_URL = import.meta.env.VITE_EXCHANGE_RATES_API_URL;

const ERROR_RESPONSE = 'Invalid exchange rates: response doesn\'t contain rates';
const ERROR_RATES = 'Invalid exchange rates: one or more rates are not numbers';

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

  return Object.entries(rates).reduce<ExchangeRates>((acc, [code, rate]) => {
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

let inMemoryRates: ExchangeRates | undefined;
export const getExchangeRates = async ({ signal }: {
  signal?: AbortSignal;
} = {}): Promise<ExchangeRates> => {
  if (inMemoryRates !== undefined) return inMemoryRates;

  const response = await fetch(API_URL, { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
  }

  const rates = parseRates(await response.json());
  inMemoryRates = rates;
  return rates;
};
