import { type FC, useMemo } from 'react';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';

import { dateToCommonString } from '@/shared/lib/date';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from '@/shared/ui';
import type { CurrencyCode } from '@/entities/currency';

import { useExchangeRates } from '../model/exchange-rates';
import { useConvert } from '../model/convert';
import { CurrencyInput, CurrencyInputSkeleton } from './currency-input';

export const CurrenciesConverter: FC<{ className?: string }> = ({ className }) => {
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
    <div className={className}>
      {exchangeRatesError && (
        <Alert variant={exchangeRates ? 'default' : 'destructive'} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{exchangeRates ? 'Used old exchange rates' : 'Error'}</AlertTitle>
          <AlertDescription>
            {exchangeRatesError}
          </AlertDescription>
        </Alert>
      )}

      {exchangeRatesFetchDate && (
        <p className="mb-2 text-xs text-muted-foreground text-right select-none cursor-none">
          {dateToCommonString(exchangeRatesFetchDate)}
        </p>
      )}

      {exchangeRatesLoading && exchangeRates === undefined
        ? <CurrencyConverterSkeleton count={values.length || 2} />
        : values.map((v, i) => exchangeRates?.[v.currency] !== undefined && (
          <CurrencyInput
            key={v.currency + String(i)}
            className="mb-4"
            currencies={currencies}
            amount={v.amount}
            currency={v.currency}
            onAmountChange={(newAmount) => handleValueChange(newAmount, v.currency, i)}
            onCurrencyChange={(newCurrency) => handleValueChange(v.amount, newCurrency, i)}
          >
            <Button
              className="cursor-pointer"
              variant="destructive"
              size="icon"
              title="Delete"
              aria-label={`Delete currency ${v.currency}`}
              onClick={() => !exchangeRatesLoading && deleteValue(i)}
            >
              <Trash2 />
            </Button>
          </CurrencyInput>
        ))
      }

      <Button
        className="w-full cursor-pointer"
        variant="default"
        size="lg"
        disabled={currencies.length === 0 || exchangeRatesLoading}
        aria-label="Add currency"
        onClick={addValue}
      >{exchangeRatesLoading ? (<>
          <Loader2 className="animate-spin" />
          <span>The currencies are loading</span>
        </>) : 'Add currency'}
      </Button>
    </div>
  );
};

function CurrencyConverterSkeleton({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <CurrencyInputSkeleton key={index} className="mb-4" />
      ))}
    </>
  );
};
