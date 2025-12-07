import { useEffect, useRef, useState } from 'react';
import { CircleX } from 'lucide-react';
import { cn, Input } from '@/shared/ui';

type Props = {
  value: number;
  onChange: (newAmount: number) => void;
  className?: string;
}

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

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(e.target.value) || 0;
    setAmount(newAmount);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange(newAmount), 500);
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
        step={0.0001}
        min={0}
        placeholder="0"
        value={amount}
        onChange={onAmountChange}
        aria-label="Amount"
        className="pr-10 w-full min-w-px"
      />
      {amount > 0 && (
        <button
          type="button"
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
