import { useEffect, useRef, useState } from 'react';
import { CircleX } from 'lucide-react';
import { cn, Input } from '@/shared/ui';

type Props = {
  value: number;
  onChange: (newAmount: number) => void;
  className?: string;
};

const DEBOUNCE_MS = 500;

const parseAmount = (value: string): number => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : 0;
};

export const AmountInput = ({
  value,
  onChange,
  className,
}: Props) => {
  const [amount, setAmount] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setAmount(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseAmount(e.target.value);
    setAmount(newAmount);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange(newAmount), DEBOUNCE_MS);
  };

  const onClear = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAmount(0);
    onChange(0);
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        type="number"
        inputMode="decimal"
        step={0.0001}
        min={0}
        placeholder="0"
        value={amount || ''}
        onChange={onAmountChange}
        aria-label="Amount"
        className="pr-10 w-full min-w-px"
      />
      {amount > 0 && (
        <button
          type="button"
          aria-label="Clear amount"
          className="absolute inset-y-0 right-0 pr-3 focus:outline-none cursor-pointer"
          onClick={onClear}
        >
          <CircleX className="w-5 opacity-50 hover:opacity-100" />
        </button>
      )}
    </div>
  );
};

export const AmountInputSkeleton = () => (<div className="h-9 grow bg-primary/10 rounded-md animate-pulse" />);
