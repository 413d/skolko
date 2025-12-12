import { type CurrencyCode } from '@/entities/currency';

export const convert = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number>,
) => {
  if (amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  if (!rates[fromCurrency] || !rates[toCurrency]) return 0;

  return amount * (rates[toCurrency] / rates[fromCurrency]);
};
