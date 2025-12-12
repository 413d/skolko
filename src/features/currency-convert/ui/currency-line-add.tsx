import { useUnit } from 'effector-react';
import { CopyPlus, Loader2 } from 'lucide-react';

import { Button, cn } from '@/shared/ui';

import { $lines, lineAdded } from '../model/converter';

type Props = {
  rates: Record<string, number>;
  isRatesLoading: boolean;
  className?: string;
};

export const CurrencyLineAdd = ({
  rates,
  isRatesLoading,
  className,
}: Props) => {
  const [usedCount, onNewLine] = useUnit([
    $lines.map((lines) => lines?.length ?? 0),
    lineAdded,
  ] as const);

  const allCount = Object.keys(rates).length;

  if (usedCount >= allCount) return null;

  return (
    <Button
      className={cn('cursor-pointer', className)}
      variant="default"
      size="lg"
      disabled={isRatesLoading}
      aria-label="Add currency"
      onClick={() => onNewLine(rates)}
    >
      {
        isRatesLoading ? <Loader2 className="animate-spin" /> : <CopyPlus />
      }
    </Button>
  );
};
