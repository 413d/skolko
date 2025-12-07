import { useEffect, useMemo } from 'react';
import { useUnit } from 'effector-react';
import { toast } from 'sonner';

import { useCopy } from '../lib/copy';

import {
  lineDeleted,
  currencyChanged,
  amountChanged,
  ratesUpdated,
  $lines,
  $usedCurrencies,
} from '../model/converter';

import { CurrencyLine, CurrencyLineSkeleton } from './currency-line';

type Props = {
  rates: Record<string, number> | undefined;
  isRatesLoading: boolean;
}

export const CurrencyLines = ({ rates, isRatesLoading }: Props) => {
  const [
    onDeleteLine,
    onCurrencyChange,
    onAmountChange,
    onRatesUpdate,
    lines,
    usedCurrencies,
  ] = useUnit([
    lineDeleted,
    currencyChanged,
    amountChanged,
    ratesUpdated,
    $lines,
    $usedCurrencies,
  ] as const);

  useEffect(() => {
    onRatesUpdate({ rates });
  }, [onRatesUpdate, rates]);

  const currencies = useMemo(() => rates ? Object.keys(rates) : [], [rates]);

  const { canCopy, copy } = useCopy();

  if (isRatesLoading && rates === undefined) {
    return <CurrencyLinesSkeleton
      lineCount={lines.length || 2}
      canCopy={canCopy}
    />;
  }

  return lines.map((v) => rates?.[v.currency] !== undefined && (
    <CurrencyLine
      className="mb-4"
      key={v.currency}
      currencies={currencies}
      amount={v.amount}
      currency={v.currency}
      onAmountChange={(newAmount) => onAmountChange({
        line: v,
        newAmount,
        rates,
      })}
      onCurrencyChange={(newCurrency) => {
        if (usedCurrencies.has(newCurrency)) {
          toast.error(`Currency ${newCurrency} is already used.`);
          return;
        }
        onCurrencyChange({
          line: v,
          newCurrency,
          rates,
        });
      }}
      onDelete={() => !isRatesLoading && onDeleteLine(v)}
      onCopy={canCopy ? (() => copy(`${String(v.amount)} ${v.currency}`)) : undefined}
    />
  ));
};

type SkeletonProps = {
  lineCount?: number;
  canCopy?: boolean;
}
function CurrencyLinesSkeleton({
  lineCount = 2,
  canCopy = true,
}: SkeletonProps) {
  return (
    <>
      {Array.from({ length: lineCount }).map((_, index) => (
        <CurrencyLineSkeleton
          key={index}
          className="mb-4"
          canCopy={canCopy}
        />
      ))}
    </>
  );
};
