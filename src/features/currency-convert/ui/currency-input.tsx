import { type ReactNode, memo, useEffect, useRef } from 'react';
import { debounce } from '@/shared/lib/delay';
import { CurrencySelect, type CurrencyCode } from '@/entities/currency';
import { cn, Input } from '@/shared/ui';

type Props = {
  currencies: CurrencyCode[];
  amount: number;
  currency: CurrencyCode;
  onAmountChange: (newAmount: number) => void;
  onCurrencyChange: (newCurrency: CurrencyCode) => void;
  className?: string;
  children?: ReactNode;
}

export const CurrencyInput = memo<Props>(({
  currencies,
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  className,
  children,
}) => {
  const amountRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!amountRef.current) return;
    amountRef.current.value = String(amount);
  }, [amount]);

  const handleAmountChange = debounce(() => {
    if (!amountRef.current) return;

    const newAmount = Number(amountRef.current.value);

    if (Number.isNaN(newAmount) || newAmount < 0) {
      amountRef.current.value = String(amount);
    } else if (newAmount !== amount) {
      onAmountChange(newAmount);
    }
  }, 500);

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    if (newCurrency === currency) return;
    onCurrencyChange(newCurrency);
  };

  return (
    <div className={cn('flex space-x-2', className)}>
      <Input
        ref={amountRef}
        type="number"
        step={0.0001}
        min={0}
        defaultValue={amount}
        onChange={handleAmountChange}
        aria-label="Amount"
      />

      <CurrencySelect
        currencies={currencies}
        currency={currency}
        onSelectCurrency={handleCurrencyChange}
        aria-label="Currency"
      />

      {children}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.currencies.length === nextProps.currencies.length &&
    prevProps.amount === nextProps.amount &&
    prevProps.currency === nextProps.currency
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export const CurrencyInputSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('flex space-x-2 select-none cursor-wait', className)}>
    <div className="h-9 flex-grow bg-primary/10 rounded-md animate-pulse" />
    <div className="h-9 w-20 bg-primary/10 rounded-md animate-pulse" />
    <div className="h-9 w-9 bg-primary/10 rounded-md animate-pulse" />
  </div>
);
