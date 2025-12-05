import { type FC, useEffect, useMemo } from 'react';
import { useUnit } from 'effector-react';
import { AlertCircle, Loader2, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { dateToCommonString } from '@/shared/lib/date';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from '@/shared/ui';
import type { CurrencyCode } from '@/entities/currency';

import { CurrencyInput, CurrencyInputSkeleton } from './currency-input';
import {
  $rates,
  $isRatesLoading,
  $ratesError,
  $ratesFetchedAt,
  $currencies,
  ratesInited,
} from '../model/rates';
import {
  lineAdded,
  lineDeleted,
  currencyChanged,
  amountChanged,
  ratesUpdated,
  converterStarted,
  $lines,
  $usedCurrencies,
} from '../model/converter';


const canCopy = () => typeof navigator !== 'undefined' && 'clipboard' in navigator;

export const CurrenciesConverter: FC<{ className?: string }> = ({ className }) => {
  const [
    rates,
    isRatesLoading,
    ratesErrorMessage,
    ratesFetchDate,
    currencies,
    initRates,
  ] = useUnit([
    $rates,
    $isRatesLoading,
    $ratesError,
    $ratesFetchedAt,
    $currencies,
    ratesInited,
  ] as const);
  useEffect(() => {
    initRates();
  }, [initRates]);

  const [
    onNewLine,
    onDeleteLine,
    onCurrencyChange,
    onAmountChange,
    onRatesUpdate,
    onConverterStart,
    lines,
    usedCurrencies,
  ] = useUnit([
    lineAdded,
    lineDeleted,
    currencyChanged,
    amountChanged,
    ratesUpdated,
    converterStarted,
    $lines,
    $usedCurrencies,
  ] as const);
  useEffect(() => {
    onConverterStart({ rates });
  }, [onConverterStart, rates]);
  useEffect(() => {
    if (rates !== undefined) {
      onRatesUpdate(rates);
    }
  }, [onRatesUpdate, rates]);

  const availableCurrencies = useMemo(
    () => currencies.filter((c) => !usedCurrencies.has(c)),
    [currencies, usedCurrencies],
  );

  const isCopySupported = canCopy();
  const copyValue = (amount: number, currency: CurrencyCode) => {
    const textToCopy = `${String(amount)} ${currency}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.info('Copied to clipboard', {
          description: textToCopy,
        });
      })
      .catch((error: unknown) => {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy to clipboard');
      });
  };

  return (
    <div className={className}>
      {ratesErrorMessage && (
        <Alert variant={rates ? 'default' : 'destructive'} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{rates ? 'Used old exchange rates' : 'Error'}</AlertTitle>
          <AlertDescription>
            {ratesErrorMessage}
          </AlertDescription>
        </Alert>
      )}

      {ratesFetchDate && (
        <p className="mb-2 text-xs text-muted-foreground text-right select-none cursor-none">
          {dateToCommonString(ratesFetchDate)}
        </p>
      )}

      {isRatesLoading && rates === undefined
        ? <CurrencyConverterSkeleton count={lines.length || 2} />
        : lines.map((v, i) => rates?.[v.currency] !== undefined && (
          <CurrencyInput
            key={v.currency + String(i)}
            className="mb-4"
            currencies={availableCurrencies}
            amount={v.amount}
            currency={v.currency}
            onAmountChange={(newAmount) => onAmountChange({
              line: v,
              newAmount,
              rates,
            })}
            onCurrencyChange={(newCurrency) => onCurrencyChange({
              line: v,
              newCurrency,
              rates,
            })}
          >
            {isCopySupported && (
              <Button
                className="cursor-pointer"
                variant="outline"
                size="icon"
                title="Copy amount and currency"
                aria-label="Copy amount and currency"
                onClick={() => copyValue(v.amount, v.currency)}
              >
                <Copy />
              </Button>
            )}
            <Button
              className="cursor-pointer"
              variant="destructive"
              size="icon"
              title="Delete"
              aria-label={`Delete currency ${v.currency}`}
              onClick={() => !isRatesLoading && onDeleteLine(v)}
            >
              <Trash2 />
            </Button>
          </CurrencyInput>
        ))
      }

      {rates && <Button
        className="w-full cursor-pointer"
        variant="default"
        size="lg"
        disabled={currencies.length === 0 || isRatesLoading}
        aria-label="Add currency"
        onClick={() => onNewLine(rates)}
      >{isRatesLoading ? (<>
          <Loader2 className="animate-spin" />
          <span>The currencies are loading</span>
        </>) : 'Add currency'}
      </Button>}
    </div>
  );
};

function CurrencyConverterSkeleton({ count = 2 }: { count?: number }) {
  const childrenCount = canCopy() ? 2 : 1;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <CurrencyInputSkeleton key={index} className="mb-4" childrenCount={childrenCount} />
      ))}
    </>
  );
};
