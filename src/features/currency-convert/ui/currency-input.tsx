import { type ReactNode, memo, useEffect, useRef } from 'react';
import { CircleX } from 'lucide-react';
import { debounce } from '@/shared/lib/delay';
import { CurrencySelect, type CurrencyCode } from '@/entities/currency';
import { cn, Input } from '@/shared/ui';

const amountToInputValue = (amount: number) => amount === 0 ? '' : String(amount);

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
    amountRef.current.value = amountToInputValue(amount);
  }, [amount]);

  const handleAmountChange = debounce(() => {
    if (!amountRef.current) return;

    const newAmount = Number(amountRef.current.value);

    if (Number.isNaN(newAmount) || newAmount < 0) {
      amountRef.current.value = amountToInputValue(amount);
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
      <div className="relative grow">
        <Input
          ref={amountRef}
          type="number"
          step={0.0001}
          min={0}
          placeholder="0"
          defaultValue={amountToInputValue(amount)}
          onChange={handleAmountChange}
          aria-label="Amount"
          className="pr-10 w-full min-w-px"
        />
        {amount > 0 && (<button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 focus:outline-none cursor-pointer"
          onClick={() => onAmountChange(0)}
        >
          <CircleX className="w-5 opacity-50 hover:opacity-100" />
        </button>)}
      </div>

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

export const CurrencyInputSkeleton = ({ className, childrenCount = 1 }: { className?: string; childrenCount?: number }) => (
  <div className={cn('flex space-x-2 select-none cursor-wait', className)}>
    <div className="h-9 grow bg-primary/10 rounded-md animate-pulse" />
    <div className="h-9 w-20 bg-primary/10 rounded-md animate-pulse" />
    {Array.from({ length: childrenCount }).map((_, index) => (
      <div className="h-9 w-9 bg-primary/10 rounded-md animate-pulse" key={index} />
    ))}
  </div>
);
