import { memo } from 'react';
import { Trash2, Copy } from 'lucide-react';

import { cn, Button } from '@/shared/ui';

import { CurrencySelect, type CurrencyCode } from '@/entities/currency';

import { AmountInput, AmountInputSkeleton } from './amount-input';

type Props = {
  className?: string;
  currencies: CurrencyCode[];
  amount: number;
  currency: CurrencyCode;
  onAmountChange: (newAmount: number) => void;
  onCurrencyChange: (newCurrency: CurrencyCode) => void;
  onDelete: () => void;
  onCopy?: () => void;
}

export const CurrencyLine = memo<Props>(({
  className,
  currencies,
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  onDelete,
  onCopy,
}) => {
  return (
    <div className={cn('flex space-x-2', className)}>
      <AmountInput
        className="grow"
        value={amount}
        onChange={onAmountChange}
      />

      <CurrencySelect
        currencies={currencies}
        currency={currency}
        onSelectCurrency={onCurrencyChange}
        aria-label="Currency"
      />

      {onCopy !== undefined && (
        <Button
          className="cursor-pointer"
          variant="outline"
          size="icon"
          title="Copy amount and currency"
          aria-label="Copy amount and currency"
          onClick={onCopy}
        >
          <Copy />
        </Button>
      )}

      <Button
        className="cursor-pointer"
        variant="destructive"
        size="icon"
        title="Delete"
        aria-label={`Delete currency ${currency}`}
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.currencies.length === nextProps.currencies.length &&
    prevProps.amount === nextProps.amount &&
    prevProps.currency === nextProps.currency
  );
});

CurrencyLine.displayName = 'CurrencyLine';

export const CurrencyLineSkeleton = ({ className, canCopy }: { className?: string; canCopy?: boolean }) => (
  <div
    className={cn('flex space-x-2 select-none cursor-wait', className)}
    role="status"
    aria-busy="true"
    aria-label="Loading currency line"
  >
    <AmountInputSkeleton />
    <div className="h-9 w-20 bg-primary/10 rounded-md animate-pulse" aria-hidden="true" />
    {canCopy && (<div className="h-9 w-9 bg-primary/10 rounded-md animate-pulse" aria-hidden="true" />)}
    <div className="h-9 w-9 bg-primary/10 rounded-md animate-pulse" aria-hidden="true" />
  </div>
);
