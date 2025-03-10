import { useEffect, useState } from 'react';

import { getRandomInt, roundTo } from '@/shared/lib/math';
import { getStorageData, setStorageData } from '@/shared/lib/storage';

import { DEFAULT_CURRENCY_FIAT, type CurrencyCode } from '@/entities/currency';

import type { ExchangeRates } from './exchange-rates';

type ValueToConvert = {
  amount: number;
  currency: CurrencyCode;
};
const createValueToConvert = (amount = 0, currency = DEFAULT_CURRENCY_FIAT): ValueToConvert => ({
  amount,
  currency,
});

const convert = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: ExchangeRates,
) => {
  if (amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  if (!rates[fromCurrency] || !rates[toCurrency]) return 0;

  return amount * (rates[toCurrency] / rates[fromCurrency]);
};

const VALUES_STORAGE_KEY = 'values-to-convert';
const getSavedValues = () => {
  const data = getStorageData<ValueToConvert[]>(VALUES_STORAGE_KEY);
  if (!Array.isArray(data)) return undefined;
  return data.filter((v) => typeof v === 'object' && typeof v.amount === 'number' && typeof v.currency === 'string');
};

export const useConvert = (exchangeRates: ExchangeRates | undefined) => {
  const [values, setValues] = useState<ValueToConvert[]>(
    () => getSavedValues() ?? [createValueToConvert()],
  );
  useEffect(() => {
    setStorageData(VALUES_STORAGE_KEY, values);
  }, [values]);
  useEffect(() => {
    if (exchangeRates === undefined) return;

    setValues((prevValues) => {
      if (prevValues.length < 2) return prevValues;
      const baseValue = prevValues[0];
      return prevValues.map((v, i) => {
        if (i === 0) return v;
        return createValueToConvert(
          roundTo(
            convert(baseValue.amount, baseValue.currency, v.currency, exchangeRates),
            4,
          ),
          v.currency,
        );
      });
    });
  }, [exchangeRates]);

  const handleValueChange = (
    amount: number,
    currency: CurrencyCode,
    index: number,
  ) => {
    setValues((prevValues) => prevValues.map((v, i) => {
      if (i === index) return createValueToConvert(amount, currency);
      return createValueToConvert(
        roundTo(convert(amount, currency, v.currency, exchangeRates ?? {}), 4),
        v.currency,
      );
    }));
  };

  const addValue = () => {
    if (exchangeRates === undefined) return;

    const currencies = Object.keys(exchangeRates);
    const idx = getRandomInt(0, currencies.length - 1);
    const currency = currencies[idx];

    setValues((prevValues) => {
      if (prevValues.length === 0) return [createValueToConvert(0, currency)];

      const [toConvert] = prevValues;
      const amount = roundTo(
        convert(toConvert.amount, toConvert.currency, currency, exchangeRates),
        4,
      );

      return [
        ...prevValues,
        createValueToConvert(amount, currency),
      ];
    });
  };

  const deleteValue = (index: number) => {
    setValues((prevValues) => prevValues.filter((_, i) => i !== index));
  };

  return {
    values,
    handleValueChange,
    addValue,
    deleteValue,
  } as const;
};
