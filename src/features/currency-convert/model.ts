import type { CurrencyCode } from '@/entities/currency';

/** Price of currency to base currency ratio */
export type CurrencyRate = number;

/**
 * Exchange rates with currency code as the key and the rate as the value
 */
export type ExchangeRates = Record<CurrencyCode, CurrencyRate>;
