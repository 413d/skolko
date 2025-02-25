import { type ReactNode, memo, useEffect, useRef } from 'react';
import { debounce } from '@/shared/lib/delay';
import type { CurrencyCode } from '@/entities/currency';

type Props = {
  currencies: CurrencyCode[];
  amount: number;
  currency: CurrencyCode;
  onAmountChange: (newAmount: number) => void;
  onCurrencyChange: (newCurrency: CurrencyCode) => void;
  children?: ReactNode;
}

export const CurrencyInput = memo<Props>(({
  currencies,
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
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

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value || currency;
    if (newCurrency === currency) return;
    onCurrencyChange(newCurrency);
  };

  return (
    <div className="flex gap-2">
      <input
        ref={amountRef}
        type="number"
        step={0.0001}
        min={0}
        defaultValue={amount}
        onChange={handleAmountChange}
      />
      <select
        value={currency}
        onChange={handleCurrencyChange}
      >
        {currencies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

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
