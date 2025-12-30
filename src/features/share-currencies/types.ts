import { type CurrencyCode } from '@/entities/currency';

export type SharedCurrency = {
  code: CurrencyCode;
  amount?: number;
};
