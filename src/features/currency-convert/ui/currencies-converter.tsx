import { useMemo } from 'react';

import type { CurrencyCode } from '@/entities/currency';

import { useExchangeRates } from '../model/exchange-rates';
import { useConvert } from '../model/convert';
import { CurrencyInput } from './currency-input';

export const CurrenciesConverter = () => {
  const {
    data: exchangeRates,
    fetchedAt: exchangeRatesFetchDate,
    isLoading: exchangeRatesLoading,
    error: exchangeRatesError,
  } = useExchangeRates();
  const currencies = useMemo<CurrencyCode[]>(
    () => Object.keys(exchangeRates ?? {}),
    [exchangeRates],
  );

  const {
    values,
    handleValueChange,
    addValue,
    deleteValue,
  } = useConvert(exchangeRates);

  return (
    <div>
      {exchangeRatesError && <p>{exchangeRatesError}</p>}

      {exchangeRatesFetchDate && (
        <p>
          <small>
            {exchangeRatesFetchDate.toLocaleString()}
          </small>
        </p>
      )}

      {exchangeRatesLoading && exchangeRates === undefined
        ? <CurrencyConverterSkeleton count={values.length || 2} />
        : values.map((v, i) => exchangeRates?.[v.currency] !== undefined && (
          <CurrencyInput
            key={v.currency + String(i)}
            currencies={currencies}
            amount={v.amount}
            currency={v.currency}
            onAmountChange={(newAmount) => handleValueChange(newAmount, v.currency, i)}
            onCurrencyChange={(newCurrency) => handleValueChange(v.amount, newCurrency, i)}
          >
            {i > 0 && (<button title="Delete" onClick={() => deleteValue(i)}>X</button>)}
          </CurrencyInput>
        ))
      }

      <button
        disabled={currencies.length === 0 || exchangeRatesLoading}
        onClick={addValue}
      >Add currency</button>
    </div>
  );
};

function CurrencyConverterSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-12 bg-gray-200 rounded mb-4" />
      ))}
    </div>
  );
};
