import { useEffect, useState } from 'react';
import { CircleX } from 'lucide-react';

import { cn, Input } from '@/shared/ui';

import { createNumberFormatter } from '../lib/format';

type Props = {
  value: number;
  onChange: (newAmount: number) => void;
  className?: string;
};

const formatter = createNumberFormatter();

export const AmountInput = ({
  value,
  onChange,
  className,
}: Props) => {
  const [displayAmount, setDisplayAmount] = useState(formatter.format(value));

  useEffect(() => {
    setDisplayAmount(formatter.format(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const filteredValue = rawValue.replace(/[^\d.,]/g, '');
    setDisplayAmount(filteredValue);
    const newValue = formatter.parse(filteredValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setDisplayAmount('');
    onChange(0);
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        inputMode="decimal"
        placeholder="0"
        value={displayAmount}
        onChange={handleChange}
        aria-label="Amount"
        className="pr-10 w-full min-w-px text-xs font-mono"
      />
      {displayAmount && (
        <button
          type="button"
          aria-label="Clear amount"
          className="absolute inset-y-0 right-0 pr-3 cursor-pointer rounded-r-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          onClick={handleClear}
        >
          <CircleX className="w-5 opacity-50 hover:opacity-100" />
        </button>
      )}
    </div>
  );
};

export const AmountInputSkeleton = () => (
  <div
    className="h-9 grow bg-primary/10 rounded-md animate-pulse"
    aria-hidden="true"
  />
);
